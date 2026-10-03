"""
GQR Institutional – Model Guard
================================
Monitors post‑update performance and rolls back if necessary.
"""

import torch
from pathlib import Path
from typing import Optional, Dict, Any
from loguru import logger

class ModelGuard:
    """
    Keeps a backup of the model weights before each PPO update.
    If the moving Sharpe over the next `evaluation_steps` drops below
    a threshold, restores the backup.
    """

    def __init__(
        self,
        model: torch.nn.Module,
        backup_path: str = "models/weights/backup.pt",
        evaluation_steps: int = 500,
        sharpe_threshold: float = -0.5,
    ):
        self.model = model
        self.backup_path = Path(backup_path)
        self.evaluation_steps = evaluation_steps
        self.sharpe_threshold = sharpe_threshold

        # Track post‑update performance
        self.post_update_returns: list = []
        self._monitoring = False

    def backup(self):
        """Save current model weights as backup."""
        self.backup_path.parent.mkdir(parents=True, exist_ok=True)
        torch.save(self.model.state_dict(), self.backup_path)
        logger.debug("Model backup created")

    def start_monitoring(self):
        """Begin collecting returns after an update."""
        self.post_update_returns.clear()
        self._monitoring = True

    def add_return(self, ret: float):
        """Feed a step return."""
        if self._monitoring:
            self.post_update_returns.append(ret)

    def check_and_rollback(self) -> bool:
        """
        Evaluate recent performance. If too poor, restore backup.
        Returns True if rollback happened.
        """
        if not self._monitoring or len(self.post_update_returns) < 10:
            return False

        if len(self.post_update_returns) < 2:
            return False

        rets = torch.tensor(self.post_update_returns, dtype=torch.float32)
        mean = rets.mean()
        std = rets.std() + 1e-8
        sharpe = mean / std * (252 * 24 * 60) ** 0.5  # annualised

        if sharpe < self.sharpe_threshold and self.backup_path.exists():
            logger.warning(f"Sharpe {sharpe:.2f} < threshold {self.sharpe_threshold}. Rolling back.")
            try:
                _dev = next(self.model.parameters()).device
            except StopIteration:
                _dev = torch.device("cpu")
            self.model.load_state_dict(torch.load(self.backup_path, map_location=_dev))
            self._monitoring = False
            return True

        if len(self.post_update_returns) >= self.evaluation_steps:
            self._monitoring = False

        return False