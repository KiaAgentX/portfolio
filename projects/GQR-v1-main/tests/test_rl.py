"""Verify that PPO training changes model parameters (fused gold+DXY wiring)."""
import torch
from src.main import FusedActorCritic
from src.rl.ppo_trainer import PPOTrainer

def test_model_parameter_update():
    model = FusedActorCritic(gold_dim=50, dxy_dim=1, embed_dim=128, n_heads=4, n_layers=2)
    trainer = PPOTrainer(model, lr=1e-3)
    initial_params = [p.clone() for p in model.parameters()]

    # Fake buffer
    buffer = [{
        'gold': torch.randn(30, 50),
        'dxy': torch.randn(30, 1),
        'action': 1,
        'log_prob': 0.0,
        'reward': 0.01,
        'next_gold': torch.randn(30, 50),
        'next_dxy': torch.randn(30, 1),
        'value': 0.0,
        'done': False
    } for _ in range(5)]
    trainer.update(buffer)

    for p_init, p_now in zip(initial_params, model.parameters()):
        assert not torch.equal(p_init, p_now), "Parameter did not change"