#!/usr/bin/env python
"""
Pre‑processing: convert raw CSV historical data to columnar Parquet.
Each symbol's CSV must contain columns: time, open, high, low, close.
Optional: tick_volume, spread.
Output: <symbol>.parquet with snappy compression and a sorted index on "time".
Usage:
    python scripts/convert_csv_to_parquet.py --input data/raw --output data/parquet
"""

import argparse
from pathlib import Path
import pandas as pd
import pyarrow as pa
import pyarrow.parquet as pq
from loguru import logger

def convert_file(csv_path: Path, output_dir: Path):
    sym = csv_path.stem.upper()
    logger.info(f"Converting {sym} …")
    df = pd.read_csv(csv_path, parse_dates=["time"])
    # Ensure minimal columns
    required_cols = {"time", "open", "high", "low", "close"}
    missing = required_cols - set(df.columns)
    if missing:
        raise ValueError(f"{csv_path} missing columns: {missing}")

    # Optionally fill spread/volatility if not present (for SMC engine)
    if "spread" not in df.columns:
        df["spread"] = 0.0
    if "tick_volume" not in df.columns:
        df["tick_volume"] = 0

    # Sort by time
    df = df.sort_values("time").reset_index(drop=True)

    # Write with pyarrow to Parquet, using timestamp in milliseconds
    table = pa.Table.from_pandas(df, preserve_index=False)
    out_path = output_dir / f"{sym}.parquet"
    pq.write_table(table, out_path, compression="snappy", row_group_size=50000)
    logger.success(f"Saved {out_path} ({table.num_rows} rows)")

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True, help="Folder containing .csv files")
    parser.add_argument("--output", default="data/parquet", help="Output folder for .parquet")
    args = parser.parse_args()

    input_dir = Path(args.input)
    output_dir = Path(args.output)
    output_dir.mkdir(parents=True, exist_ok=True)

    csv_files = list(input_dir.glob("*.csv"))
    if not csv_files:
        logger.error("No CSV files found.")
        return

    for fp in csv_files:
        try:
            convert_file(fp, output_dir)
        except Exception as e:
            logger.exception(f"Failed {fp.name}: {e}")

if __name__ == "__main__":
    main()