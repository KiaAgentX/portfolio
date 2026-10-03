"""
MT5 Data Fetcher - Backend Server (Auto Download & Analysis) - Corrected Version
Run: python server.py
"""

from fastapi import FastAPI, HTTPException, Query, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from datetime import datetime, timedelta, time
from pathlib import Path
import csv
import json
import os
import random
import math
import asyncio
import concurrent.futures
import threading
import time as time_mod
from typing import Optional, List, Dict, Any
import shutil
import logging
import requests

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ── FastAPI app ─────────────────────────────────────────────────────────────
app = FastAPI(title="MT5 Data Fetcher - Auto Download & Analysis (Corrected)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = Path("data")
DATA_DIR.mkdir(exist_ok=True)

# ── MT5 import ──────────────────────────────────────────────────────────────
try:
    import MetaTrader5 as mt5
    MT5_AVAILABLE = True
except ImportError:
    MT5_AVAILABLE = False
    logger.warning("MetaTrader5 not installed. Run: pip install MetaTrader5")

# ── Thread locks for MT5 and shared state ────────────────────────────────
mt5_lock = threading.Lock()
jobs_lock = threading.Lock()
continuous_jobs_lock = threading.Lock()
auto_download_lock = threading.Lock()
analysis_state_lock = threading.Lock()

# ── Jobs and state ──────────────────────────────────────────────────────────
jobs: Dict[str, Dict[str, Any]] = {}
continuous_jobs: Dict[str, Dict[str, Any]] = {}
continuous_stop_event: Dict[str, threading.Event] = {}
auto_download_active: Dict[str, bool] = {}
auto_download_stop_event: Dict[str, threading.Event] = {}
analysis_state: Dict[str, Dict[str, Any]] = {}
user_api_keys: Dict[str, str] = {}  # symbol -> api_key for auto analysis

# ── Timeframe constants ─────────────────────────────────────────────────────
TF_CONSTANTS = {
    "S15": 0.25,
    "M1": 1,
    "M5": 5,
    "M15": 15,
    "H1": 60,
    "H4": 240,
    "D1": 1440,
    "W1": 10080,
    "MN1": 43200,
}

TF_NAMES = ["S15", "M1", "M5", "M15", "H1", "H4", "D1", "W1", "MN1"]
TF_ORDER = {tf: i for i, tf in enumerate(TF_NAMES)}

# Mapping from string to MT5 timeframe constant (for S15 we use a special approach)
def tf_constant(tf: str):
    if not MT5_AVAILABLE:
        return None
    mapping = {
        "M1": mt5.TIMEFRAME_M1,
        "M5": mt5.TIMEFRAME_M5,
        "M15": mt5.TIMEFRAME_M15,
        "H1": mt5.TIMEFRAME_H1,
        "H4": mt5.TIMEFRAME_H4,
        "D1": mt5.TIMEFRAME_D1,
        "W1": mt5.TIMEFRAME_W1,
        "MN1": mt5.TIMEFRAME_MN1,
    }
    return mapping.get(tf)

# ── Data models ──────────────────────────────────────────────────────────────

class FetchRequest(BaseModel):
    symbol: str
    dates: List[str]
    timeframe: str = "M1"
    time_from: str = "00:00"
    time_to: str = "23:59"

class ContinuousFetchRequest(BaseModel):
    symbol: str
    days: int = 30
    timeframe: str = "M1"
    time_from: str = "00:00"
    time_to: str = "23:59"

class AutoDownloadRequest(BaseModel):
    symbol: str
    initial_timeframe: str = "S15"
    auto_analysis: bool = True
    analysis_interval_hours: int = 1
    api_key: Optional[str] = None   # Optional API key for OpenRouter

# ── Helper functions ─────────────────────────────────────────────────────────

def parse_date(date_str: str) -> datetime:
    return datetime.strptime(date_str, "%d.%m.%y")

def parse_time(time_str: str) -> time:
    return datetime.strptime(time_str, "%H:%M").time()

def date_to_str(dt: datetime) -> str:
    return dt.strftime("%d.%m.%y")

def job_key(symbol: str, date: str) -> str:
    return f"{symbol}_{date}"

def continuous_job_key(symbol: str, tf: str) -> str:
    return f"continuous_{symbol}_{tf}"

def auto_download_key(symbol: str) -> str:
    return f"auto_{symbol}"

def analysis_key(symbol: str, tf: str) -> str:
    return f"analysis_{symbol}_{tf}"

# ── Synthetic data generator ────────────────────────────────────────────────

def _generate_synthetic(symbol: str, dt_start: datetime, tf: str, count: int = None) -> List[Dict]:
    interval_minutes = TF_CONSTANTS.get(tf, 1)
    if tf == "S15":
        interval_minutes = 0.25
    bars = count if count else (24 * 60) // max(1, int(interval_minutes))
    price = 50000.0 if "BTC" in symbol else 1.10
    rows = []
    t = dt_start
    for _ in range(bars):
        change = price * random.uniform(-0.002, 0.002)
        o = price
        c = price + change
        h = max(o, c) + abs(change) * random.uniform(0, 0.5)
        l = min(o, c) - abs(change) * random.uniform(0, 0.5)
        rows.append({
            "time": t.strftime("%Y-%m-%d %H:%M:%S"),
            "open": round(o, 5),
            "high": round(h, 5),
            "low": round(l, 5),
            "close": round(c, 5),
            "volume": random.randint(100, 5000),
        })
        price = c
        if tf == "S15":
            t += timedelta(seconds=15)
        else:
            t += timedelta(minutes=int(interval_minutes))
    return rows

# ── Aggregation function: build higher timeframe from lower ──────────────

def aggregate_candles(lower_candles: List[Dict], target_tf: str) -> List[Dict]:
    """
    Aggregates lower timeframe candles (e.g., M1) into higher timeframe (e.g., M5).
    Assumes lower_candles are sorted by time.
    """
    interval_minutes = TF_CONSTANTS.get(target_tf, 1)
    if target_tf == "S15":
        interval_minutes = 0.25

    if not lower_candles:
        return []

    # Convert seconds to interval in seconds
    interval_seconds = interval_minutes * 60 if interval_minutes >= 1 else 15
    aggregated = []
    bucket_start = None
    bucket = None
    for candle in lower_candles:
        dt = datetime.strptime(candle["time"], "%Y-%m-%d %H:%M:%S")
        # Align to start of bucket
        if target_tf == "S15":
            bucket_start = dt.replace(second=(dt.second // 15) * 15, microsecond=0)
        else:
            # For minute-based timeframes, truncate to minute
            if interval_minutes >= 1:
                bucket_start = dt.replace(second=0, microsecond=0)
                # For >1 minute, further truncate
                if interval_minutes > 1:
                    minute_of_day = dt.hour * 60 + dt.minute
                    bucket_minutes = (minute_of_day // interval_minutes) * interval_minutes
                    bucket_start = dt.replace(hour=bucket_minutes // 60, minute=bucket_minutes % 60, second=0, microsecond=0)
            else:
                # S15: already handled above
                pass

        if bucket is None or dt >= bucket_start + timedelta(seconds=interval_seconds):
            if bucket is not None:
                aggregated.append({
                    "time": bucket_start.strftime("%Y-%m-%d %H:%M:%S"),
                    "open": bucket["open"],
                    "high": bucket["high"],
                    "low": bucket["low"],
                    "close": bucket["close"],
                    "volume": bucket["volume"]
                })
            bucket = {
                "open": candle["open"],
                "high": candle["high"],
                "low": candle["low"],
                "close": candle["close"],
                "volume": candle["volume"]
            }
        else:
            # Update bucket
            bucket["high"] = max(bucket["high"], candle["high"])
            bucket["low"] = min(bucket["low"], candle["low"])
            bucket["close"] = candle["close"]
            bucket["volume"] += candle["volume"]

    if bucket is not None:
        aggregated.append({
            "time": bucket_start.strftime("%Y-%m-%d %H:%M:%S"),
            "open": bucket["open"],
            "high": bucket["high"],
            "low": bucket["low"],
            "close": bucket["close"],
            "volume": bucket["volume"]
        })

    return aggregated

# ── Core fetch functions ────────────────────────────────────────────────────

def fetch_day(symbol: str, date_str: str, tf: str, time_from: str = "00:00", time_to: str = "23:59") -> Dict:
    key = job_key(symbol, date_str)
    with jobs_lock:
        jobs[key] = {"status": "running", "message": "Starting...", "rows": 0}

    try:
        dt_start = parse_date(date_str)
        dt_end = dt_start + timedelta(days=1)

        folder = DATA_DIR / symbol / tf
        folder.mkdir(parents=True, exist_ok=True)
        filepath = folder / f"{date_str}.csv"

        if not MT5_AVAILABLE:
            rows = _generate_synthetic(symbol, dt_start, tf)
        else:
            if tf == "S15":
                rows = _fetch_ticks_aggregated(symbol, dt_start, dt_end, time_from, time_to)
                if rows is None:
                    rows = _generate_synthetic(symbol, dt_start, tf)
            else:
                with mt5_lock:
                    if not mt5.initialize():
                        raise RuntimeError(f"MT5 init failed: {mt5.last_error()}")
                    rates = mt5.copy_rates_range(symbol, tf_constant(tf), dt_start, dt_end)
                    mt5.shutdown()
                if rates is None or len(rates) == 0:
                    # Try to generate synthetic as fallback
                    rows = _generate_synthetic(symbol, dt_start, tf)
                else:
                    rows = [
                        {
                            "time": datetime.fromtimestamp(r["time"]).strftime("%Y-%m-%d %H:%M:%S"),
                            "open": r["open"],
                            "high": r["high"],
                            "low": r["low"],
                            "close": r["close"],
                            "volume": r["tick_volume"],
                        }
                        for r in rates
                    ]

        # Filter by time window
        from_time = parse_time(time_from)
        to_time = parse_time(time_to)
        filtered_rows = []
        for row in rows:
            dt = datetime.strptime(row["time"], "%Y-%m-%d %H:%M:%S")
            t = dt.time()
            if from_time <= t <= to_time:
                filtered_rows.append(row)

        # Save CSV
        with open(filepath, "w", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=["time","open","high","low","close","volume"])
            writer.writeheader()
            writer.writerows(filtered_rows)

        with jobs_lock:
            jobs[key] = {"status": "done", "message": str(filepath), "rows": len(filtered_rows)}
        return jobs[key]

    except Exception as e:
        logger.error(f"Error fetching {symbol} {date_str} {tf}: {e}")
        with jobs_lock:
            jobs[key] = {"status": "error", "message": str(e), "rows": 0}
        return jobs[key]

def _fetch_ticks_aggregated(symbol: str, dt_start: datetime, dt_end: datetime,
                            time_from: str, time_to: str) -> Optional[List[Dict]]:
    if not MT5_AVAILABLE:
        return None
    with mt5_lock:
        if not mt5.initialize():
            raise RuntimeError(f"MT5 init failed: {mt5.last_error()}")
        ticks = mt5.copy_ticks_range(symbol, dt_start, dt_end, mt5.COPY_TICKS_ALL)
        mt5.shutdown()
    if ticks is None or len(ticks) == 0:
        return None
    tick_data = []
    for t in ticks:
        tick_data.append({
            "time": datetime.fromtimestamp(t["time"]),
            "bid": t["bid"],
            "ask": t["ask"],
            "last": t["last"],
            "volume": t["volume"],
        })
    from_t = parse_time(time_from)
    to_t = parse_time(time_to)
    tick_data = [td for td in tick_data if from_t <= td["time"].time() <= to_t]
    if not tick_data:
        return []
    aggregated = {}
    for td in tick_data:
        ts = td["time"]
        sec = (ts.second // 15) * 15
        bucket = ts.replace(second=sec, microsecond=0)
        if bucket not in aggregated:
            aggregated[bucket] = {"open": td["last"], "high": td["last"], "low": td["last"],
                                  "close": td["last"], "volume": 0, "count": 0}
        agg = aggregated[bucket]
        agg["high"] = max(agg["high"], td["last"])
        agg["low"] = min(agg["low"], td["last"])
        agg["close"] = td["last"]
        agg["volume"] += td["volume"]
        agg["count"] += 1
    rows = []
    for ts in sorted(aggregated.keys()):
        agg = aggregated[ts]
        rows.append({
            "time": ts.strftime("%Y-%m-%d %H:%M:%S"),
            "open": round(agg["open"], 5),
            "high": round(agg["high"], 5),
            "low": round(agg["low"], 5),
            "close": round(agg["close"], 5),
            "volume": agg["volume"],
        })
    return rows

# ── Continuous download ──────────────────────────────────────────────────────

def continuous_fetch(symbol: str, tf: str, days: int, time_from: str, time_to: str):
    key = continuous_job_key(symbol, tf)
    with continuous_jobs_lock:
        continuous_jobs[key] = {"status": "running", "message": "Starting...", "rows": 0}
    stop_event = threading.Event()
    continuous_stop_event[key] = stop_event

    try:
        current_date = datetime.now().date()
        fetched = 0
        for i in range(days):
            if stop_event.is_set():
                with continuous_jobs_lock:
                    continuous_jobs[key]["status"] = "stopped"
                    continuous_jobs[key]["message"] = f"Stopped after {fetched} days"
                return
            target_date = current_date - timedelta(days=i)
            date_str = target_date.strftime("%d.%m.%y")
            jkey = job_key(symbol, date_str)
            with jobs_lock:
                if jkey in jobs and jobs[jkey].get("status") == "done":
                    fetched += 1
                    with continuous_jobs_lock:
                        continuous_jobs[key]["rows"] = fetched
                        continuous_jobs[key]["message"] = f"Processed {fetched}/{days} days (skipped existing)"
                    continue
            fetch_day(symbol, date_str, tf, time_from, time_to)
            with jobs_lock:
                if jkey in jobs and jobs[jkey].get("status") == "done":
                    fetched += 1
                    with continuous_jobs_lock:
                        continuous_jobs[key]["rows"] = fetched
                        continuous_jobs[key]["message"] = f"Downloaded {fetched}/{days} days"
            time_mod.sleep(0.3)
        if not stop_event.is_set():
            with continuous_jobs_lock:
                continuous_jobs[key]["status"] = "done"
                continuous_jobs[key]["message"] = f"Complete! {fetched} days downloaded"
    except Exception as e:
        logger.error(f"Continuous fetch error: {e}")
        with continuous_jobs_lock:
            continuous_jobs[key]["status"] = "error"
            continuous_jobs[key]["message"] = str(e)
    finally:
        continuous_stop_event.pop(key, None)

# ── AUTO DOWNLOAD ────────────────────────────────────────────────────────────

def auto_download_process(symbol: str, initial_tf: str, auto_analysis: bool, analysis_interval_hours: int, api_key: Optional[str] = None):
    key = auto_download_key(symbol)
    with auto_download_lock:
        auto_download_active[key] = True
        analysis_state[key] = {"last_analysis": None, "analysis_count": 0}
    if api_key:
        user_api_keys[key] = api_key
    stop_event = threading.Event()
    auto_download_stop_event[key] = stop_event

    try:
        # Main loop: runs every 60 seconds
        while not stop_event.is_set():
            current_date = datetime.now().date()  # Update current date every iteration

            # For each timeframe from initial_tf to highest
            tf_index = TF_ORDER[initial_tf]
            for tf in TF_NAMES[tf_index:]:
                if stop_event.is_set():
                    return
                tf_folder = DATA_DIR / symbol / tf
                tf_folder.mkdir(parents=True, exist_ok=True)

                # Determine how many days to fetch for this timeframe
                if tf == "S15":
                    days_to_fetch = 1
                elif tf == "M1":
                    days_to_fetch = 2
                elif tf == "M5":
                    days_to_fetch = 5
                elif tf == "M15":
                    days_to_fetch = 15
                elif tf == "H1":
                    days_to_fetch = 30
                elif tf == "H4":
                    days_to_fetch = 90
                elif tf == "D1":
                    days_to_fetch = 180
                elif tf == "W1":
                    days_to_fetch = 365
                elif tf == "MN1":
                    days_to_fetch = 365 * 2
                else:
                    days_to_fetch = 1

                # Fetch each day backward from current date
                for i in range(days_to_fetch):
                    if stop_event.is_set():
                        return
                    target_date = current_date - timedelta(days=i)
                    date_str = target_date.strftime("%d.%m.%y")
                    filepath = tf_folder / f"{date_str}.csv"

                    if not filepath.exists():
                        # If we have a lower timeframe, we could aggregate,
                        # but for simplicity we fetch directly from MT5.
                        # However, to reduce API calls, we can try to build from lower timeframe
                        # if that lower timeframe data exists.
                        # Here we check for next lower timeframe (if any)
                        lower_tf = None
                        if tf != "S15":
                            # find the next lower timeframe in TF_NAMES list
                            idx = TF_ORDER[tf]
                            if idx > 0:
                                lower_tf = TF_NAMES[idx - 1]
                        if lower_tf and (DATA_DIR / symbol / lower_tf / f"{date_str}.csv").exists():
                            # Build from lower timeframe
                            lower_path = DATA_DIR / symbol / lower_tf / f"{date_str}.csv"
                            with open(lower_path, "r") as f:
                                reader = csv.DictReader(f)
                                lower_candles = [row for row in reader]
                            # Convert to proper format
                            lower_candles = [
                                {
                                    "time": row["time"],
                                    "open": float(row["open"]),
                                    "high": float(row["high"]),
                                    "low": float(row["low"]),
                                    "close": float(row["close"]),
                                    "volume": int(row["volume"])
                                }
                                for row in lower_candles
                            ]
                            aggregated = aggregate_candles(lower_candles, tf)
                            # Save aggregated
                            with open(filepath, "w", newline="") as f:
                                writer = csv.DictWriter(f, fieldnames=["time","open","high","low","close","volume"])
                                writer.writeheader()
                                writer.writerows(aggregated)
                            # Also update jobs
                            jkey = job_key(symbol, date_str)
                            with jobs_lock:
                                jobs[jkey] = {"status": "done", "message": f"Aggregated from {lower_tf}", "rows": len(aggregated)}
                            logger.info(f"Aggregated {tf} from {lower_tf} for {symbol} {date_str}")
                        else:
                            fetch_day(symbol, date_str, tf, "00:00", "23:59")

            # Automatic analysis every X hours
            if auto_analysis:
                with analysis_state_lock:
                    last_analysis = analysis_state[key].get("last_analysis")
                    now = datetime.now()
                    if last_analysis is None or (now - last_analysis).total_seconds() >= analysis_interval_hours * 3600:
                        run_auto_analysis(symbol, initial_tf, api_key or user_api_keys.get(key))
                        analysis_state[key]["last_analysis"] = now
                        analysis_state[key]["analysis_count"] = analysis_state[key].get("analysis_count", 0) + 1

            # Sleep 60 seconds before next iteration
            for _ in range(60):
                if stop_event.is_set():
                    break
                time_mod.sleep(1)

    except Exception as e:
        logger.error(f"Auto download error for {symbol}: {e}")
    finally:
        with auto_download_lock:
            auto_download_active[key] = False
        auto_download_stop_event.pop(key, None)
        user_api_keys.pop(key, None)

def run_auto_analysis(symbol: str, tf: str, api_key: Optional[str] = None):
    """
    Analyze latest data with OpenRouter LLM.
    """
    try:
        tf_folder = DATA_DIR / symbol / tf
        csv_files = list(tf_folder.glob("*.csv"))
        if not csv_files:
            logger.info(f"No CSV files for {symbol} {tf}, skipping analysis")
            return

        # Read only last few files to avoid memory blow
        all_candles = []
        # Sort files by date (filename is date.csv with format DD.MM.YY)
        def parse_date_from_filename(fname):
            stem = fname.stem
            try:
                return datetime.strptime(stem, "%d.%m.%y")
            except:
                return datetime.min
        csv_files.sort(key=parse_date_from_filename, reverse=True)
        # Limit to last 10 files or so
        for f in csv_files[:10]:
            with open(f, "r") as csvfile:
                reader = csv.DictReader(csvfile)
                for row in reader:
                    all_candles.append({
                        "time": row["time"],
                        "open": float(row["open"]),
                        "high": float(row["high"]),
                        "low": float(row["low"]),
                        "close": float(row["close"]),
                        "volume": int(row["volume"])
                    })
        all_candles.sort(key=lambda x: x["time"])
        recent = all_candles[-200:] if len(all_candles) >= 200 else all_candles

        # Prepare prompt
        sample = recent[:50]
        sample_str = "\n".join([f"[{c['time']} O:{c['open']} H:{c['high']} L:{c['low']} C:{c['close']}]" for c in sample])

        prompt = f"""You are an expert market analyst. Analyze the following {tf} data for {symbol}.

Recent Candle Data (last 50):
{sample_str}

Provide a concise analysis (max 3 sentences) including:
- Market trend (bullish/bearish/neutral)
- Key support/resistance levels
- Recommended action (BUY/SELL/HOLD)
- Confidence level (0-100)

Output JSON only:
{{"trend": "...", "support": ..., "resistance": ..., "action": "BUY/SELL/HOLD", "confidence": ...}}"""

        if not api_key:
            # No API key, use fallback
            analysis_result = {
                "trend": "neutral",
                "support": "N/A",
                "resistance": "N/A",
                "action": "HOLD",
                "confidence": 50,
                "error": "No API key"
            }
        else:
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:8000",
                "X-Title": "Nexus Terminal Auto Analysis"
            }
            payload = {
                "model": "openai/gpt-4-turbo",
                "messages": [{"role": "user", "content": prompt}],
                "response_format": {"type": "json_object"}
            }
            try:
                resp = requests.post("https://openrouter.ai/api/v1/chat/completions", json=payload, headers=headers, timeout=30)
                if resp.status_code == 200:
                    data = resp.json()
                    content = data["choices"][0]["message"]["content"]
                    analysis_result = json.loads(content)
                else:
                    analysis_result = {"error": f"OpenRouter status {resp.status_code}"}
            except Exception as e:
                analysis_result = {"error": str(e)}

        # Save result
        llm_folder = DATA_DIR / "llm" / symbol / tf
        llm_folder.mkdir(parents=True, exist_ok=True)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filepath = llm_folder / f"analysis_{timestamp}.txt"
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(json.dumps(analysis_result, indent=2, ensure_ascii=False))

        logger.info(f"Analysis saved to {filepath}")
    except Exception as e:
        logger.error(f"Auto analysis error: {e}")

# ── API Endpoints ────────────────────────────────────────────────────────────

@app.get("/api/status")
def status():
    return {
        "mt5_available": MT5_AVAILABLE,
        "data_dir": str(DATA_DIR.resolve()),
    }

@app.post("/api/fetch")
async def start_fetch(req: FetchRequest):
    results = []
    loop = asyncio.get_event_loop()
    with concurrent.futures.ThreadPoolExecutor() as pool:
        futures = []
        for date_str in req.dates:
            key = job_key(req.symbol, date_str)
            with jobs_lock:
                jobs[key] = {"status": "pending", "message": "", "rows": 0}
            future = loop.run_in_executor(
                pool, fetch_day, req.symbol, date_str, req.timeframe, req.time_from, req.time_to
            )
            futures.append((date_str, future))
        for date_str, future in futures:
            await future
            with jobs_lock:
                results.append(jobs[job_key(req.symbol, date_str)])
    return {"results": results}

@app.post("/api/fetch_continuous")
async def start_continuous_fetch(req: ContinuousFetchRequest):
    key = continuous_job_key(req.symbol, req.timeframe)
    with continuous_jobs_lock:
        if key in continuous_jobs and continuous_jobs[key].get("status") == "running":
            raise HTTPException(400, "Continuous download already running for this symbol/timeframe")
    thread = threading.Thread(
        target=continuous_fetch,
        args=(req.symbol, req.timeframe, req.days, req.time_from, req.time_to)
    )
    thread.daemon = True
    thread.start()
    return {"status": "started", "message": f"Continuous download started for {req.days} days"}

@app.post("/api/stop_continuous")
def stop_continuous_fetch(symbol: str = Query(...), timeframe: str = Query(...)):
    key = continuous_job_key(symbol, timeframe)
    with continuous_jobs_lock:
        if key not in continuous_jobs:
            raise HTTPException(404, "No continuous download found for this symbol/timeframe")
    stop_event = continuous_stop_event.get(key)
    if stop_event:
        stop_event.set()
        with continuous_jobs_lock:
            continuous_jobs[key]["status"] = "stopping"
    return {"status": "stopping", "message": "Stop signal sent"}

@app.post("/api/auto_download")
async def start_auto_download(req: AutoDownloadRequest):
    """Start auto download and analysis"""
    key = auto_download_key(req.symbol)
    with auto_download_lock:
        if auto_download_active.get(key, False):
            raise HTTPException(400, "Auto download already running for this symbol")
    thread = threading.Thread(
        target=auto_download_process,
        args=(req.symbol, req.initial_timeframe, req.auto_analysis, req.analysis_interval_hours, req.api_key)
    )
    thread.daemon = True
    thread.start()
    return {"status": "started", "message": f"Auto download started for {req.symbol} from {req.initial_timeframe}"}

@app.post("/api/stop_auto_download")
def stop_auto_download(symbol: str = Query(...)):
    key = auto_download_key(symbol)
    with auto_download_lock:
        if key not in auto_download_active:
            raise HTTPException(404, "No auto download running for this symbol")
    stop_event = auto_download_stop_event.get(key)
    if stop_event:
        stop_event.set()
    with auto_download_lock:
        auto_download_active[key] = False
    return {"status": "stopping", "message": "Stop signal sent"}

@app.get("/api/job_status/{job_key:path}")
def get_job_status(job_key: str):
    with jobs_lock:
        if job_key in jobs:
            return jobs[job_key]
    with continuous_jobs_lock:
        if job_key in continuous_jobs:
            return continuous_jobs[job_key]
    raise HTTPException(404, "Job not found")

@app.get("/api/auto_download_status/{symbol}")
def get_auto_download_status(symbol: str):
    key = auto_download_key(symbol)
    with auto_download_lock:
        active = auto_download_active.get(key, False)
    with analysis_state_lock:
        state = analysis_state.get(key, {})
    return {
        "active": active,
        "analysis_state": state
    }

@app.get("/api/jobs")
def get_jobs():
    with jobs_lock:
        return list(jobs.values())

@app.get("/api/files")
def list_files():
    """List all files in hierarchical folder structure"""
    files = []
    for symbol_dir in DATA_DIR.iterdir():
        if symbol_dir.is_dir() and symbol_dir.name != "llm":
            for tf_dir in symbol_dir.iterdir():
                if tf_dir.is_dir():
                    for f in sorted(tf_dir.glob("*.csv")):
                        size = f.stat().st_size
                        lines = sum(1 for _ in open(f)) - 1
                        files.append({
                            "symbol": symbol_dir.name,
                            "timeframe": tf_dir.name,
                            "date": f.stem,
                            "path": str(f),
                            "size_kb": round(size / 1024, 1),
                            "rows": lines,
                        })
    return files

@app.get("/api/llm_files/{symbol}")
def list_llm_files(symbol: str):
    """List analysis files for a symbol"""
    llm_folder = DATA_DIR / "llm" / symbol
    if not llm_folder.exists():
        return []
    files = []
    for tf_dir in llm_folder.iterdir():
        if tf_dir.is_dir():
            for f in sorted(tf_dir.glob("*.txt")):
                files.append({
                    "timeframe": tf_dir.name,
                    "path": str(f),
                    "size_kb": round(f.stat().st_size / 1024, 1),
                    "modified": datetime.fromtimestamp(f.stat().st_mtime).isoformat()
                })
    return files

@app.delete("/api/files/{symbol}/{timeframe}/{date}")
def delete_file(symbol: str, timeframe: str, date: str):
    filepath = DATA_DIR / symbol / timeframe / f"{date}.csv"
    if filepath.exists():
        filepath.unlink()
        return {"deleted": True}
    raise HTTPException(404, "File not found")

@app.post("/api/data")
def get_market_data(symbol: str = Query(...), timeframe: str = Query("M1"), count: int = 200):
    symbol_dir = DATA_DIR / symbol / timeframe
    if not symbol_dir.exists():
        rows = _generate_synthetic(symbol, datetime.now() - timedelta(days=30), timeframe)
        return rows[-count:]
    csv_files = list(symbol_dir.glob("*.csv"))
    if not csv_files:
        rows = _generate_synthetic(symbol, datetime.now() - timedelta(days=30), timeframe)
        return rows[-count:]
    all_candles = []
    for f in csv_files:
        with open(f, "r") as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                all_candles.append({
                    "time": row["time"],
                    "open": float(row["open"]),
                    "high": float(row["high"]),
                    "low": float(row["low"]),
                    "close": float(row["close"]),
                    "volume": int(row["volume"])
                })
    all_candles.sort(key=lambda x: x["time"])
    return all_candles[-count:]

# ── Serve static files ───────────────────────────────────────────────────────

if os.path.exists("static"):
    app.mount("/", StaticFiles(directory="static", html=True), name="static")

# ── Main ─────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    logger.info("🚀 MT5 Data Fetcher (Auto Download & Analysis) running at http://localhost:8000")
    logger.info(f"📁 Data folder: {DATA_DIR.resolve()}")
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=False)