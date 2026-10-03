"""
GQR Institutional – Immutable Audit Logger
==========================================
Writes JSON-lines events with SHA-256 chain hashing.
"""
import json
import hashlib
from pathlib import Path
from datetime import datetime, timezone
from loguru import logger

class AuditLogger:
    def __init__(self, log_path: str = "logs/audit.jsonl"):
        self.log_path = Path(log_path)
        self.log_path.parent.mkdir(parents=True, exist_ok=True)
        self._last_hash = self._load_last_hash()

    def _load_last_hash(self) -> str:
        if not self.log_path.exists():
            return ""
        return self._tail_hash()

    def _tail_hash(self) -> str:
        """Hash of the last line on disk (multi-instance safe)."""
        try:
            with open(self.log_path, "r") as f:
                lines = [ln.strip() for ln in f if ln.strip()]
        except FileNotFoundError:
            return ""
        if not lines:
            return ""
        return hashlib.sha256(lines[-1].encode()).hexdigest()

    def log_event(self, event_type: str, data: dict):
        # Re-read the tail: several agents may append to the same file.
        self._last_hash = self._tail_hash()
        entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "type": event_type,
            "data": data,
            "prev_hash": self._last_hash
        }
        line = json.dumps(entry, sort_keys=True)
        with open(self.log_path, "a") as f:
            f.write(line + "\n")
        self._last_hash = hashlib.sha256(line.encode()).hexdigest()

    def verify_chain(self) -> bool:
        with open(self.log_path, "r") as f:
            lines = f.readlines()
        prev_hash = ""
        for line in lines:
            entry = json.loads(line.strip())
            if entry.get("prev_hash", "") != prev_hash:
                return False
            prev_hash = hashlib.sha256(line.strip().encode()).hexdigest()
        return True
def _cli() -> int:
    import argparse
    ap = argparse.ArgumentParser(description="Verify a GQR audit chain (JSON-lines with SHA-256 links).")
    ap.add_argument("--verify", metavar="PATH", nargs="?", const="logs/audit.jsonl",
                    default="logs/audit.jsonl", help="audit file to verify (default: logs/audit.jsonl)")
    args = ap.parse_args()
    p = Path(args.verify)
    if not p.exists():
        print(f"no audit file at {p}")
        return 2
    ok = AuditLogger(str(p)).verify_chain()
    print(("OK  " if ok else "TAMPERED  ") + f"audit chain valid: {ok} ({p})")
    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(_cli())
