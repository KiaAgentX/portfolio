"""Ensure multi-asset runner starts and stops gracefully."""
import asyncio
import pytest
from src.config import init_config
from src.multi_asset_runner import run_multi_asset

@pytest.mark.asyncio
async def test_multi_asset_startup():
    config = init_config()
    config.simulation_only = True
    config.rl.train_every_n_steps = 10
    try:
        task = asyncio.create_task(run_multi_asset(config))
        await asyncio.sleep(3)
        task.cancel()
        with pytest.raises(asyncio.CancelledError):
            await task
    except Exception as e:
        pytest.fail(f"Integration test failed: {e}")