#!/usr/bin/env python
"""
Pre‑compute SMC features for a given symbol.
Usage:
    python scripts/precompute_features.py --input data/processed/XAUUSD.parquet --output data/processed/XAUUSD.features.parquet
"""

import argparse
from pathlib import Path
import pandas as pd
import pyarrow.parquet as pq
from loguru import logger
import sys
sys.path.append(str(Path(__file__).resolve().parent.parent))
from src.features.smc_engine import SMCEngine, RobustOnlineScaler

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True, help="Path to raw Parquet file")
    parser.add_argument("--output", required=True, help="Path to output feature Parquet")
    parser.add_argument("--window", type=int, default=1000, help="Scaler window")
    args = parser.parse_args()

    input_path = Path(args.input)
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    logger.info(f"Loading {input_path} ...")
    df = pd.read_parquet(input_path)
    required = {"time", "open", "high", "low", "close"}
    if not required.issubset(df.columns):
        raise ValueError(f"Missing columns. Required: {required}")

    logger.info("Initializing SMC engine...")
    scaler = RobustOnlineScaler(window=args.window, update_freq=20)
    smc = SMCEngine(swing_window=10, scaler=scaler)

    smc.fit_scaler(df)
    logger.info("Extracting features...")
    features_df = smc.transform_scaled(df)  # already carries an aligned 'time' column

    table = pq.Table.from_pandas(features_df, preserve_index=False)
    pq.write_table(table, output_path, compression="snappy", row_group_size=50000)
    logger.success(f"Saved {len(features_df)} rows to {output_path}")

if __name__ == "__main__":
    main()