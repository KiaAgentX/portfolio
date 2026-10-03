"""
GQR Institutional – PPO Trainer
================================
Encapsulates Proximal Policy Optimization update logic.
"""

import torch
import torch.nn as nn
from torch.optim import AdamW
from torch.distributions import Categorical
from loguru import logger

class PPOTrainer:
    def __init__(self, model: nn.Module, lr: float = 3e-5, gamma: float = 0.99,
                 gae_lambda: float = 0.95, clip_range: float = 0.2,
                 value_coeff: float = 0.5, entropy_coeff: float = 0.01,
                 epochs: int = 5, batch_size: int = 256):
        self.model = model
        self.optimizer = AdamW(model.parameters(), lr=lr, weight_decay=1e-4)
        self.gamma = gamma
        self.gae_lambda = gae_lambda
        self.clip_range = clip_range
        self.value_coeff = value_coeff
        self.entropy_coeff = entropy_coeff
        self.epochs = epochs
        self.batch_size = batch_size

    def update(self, buffer: list) -> float:
        device = next(self.model.parameters()).device
        golds = torch.stack([e['gold'] for e in buffer]).to(device)
        dxys  = torch.stack([e['dxy'] for e in buffer]).to(device)
        acts  = torch.tensor([e['action'] for e in buffer], dtype=torch.long, device=device)
        old_lp = torch.tensor([e['log_prob'] for e in buffer], dtype=torch.float32, device=device)
        rews  = torch.tensor([e['reward'] for e in buffer], dtype=torch.float32, device=device)
        vals  = torch.tensor([e['value'] for e in buffer], dtype=torch.float32, device=device)
        n_golds = torch.stack([e['next_gold'] for e in buffer]).to(device)
        n_dxys  = torch.stack([e['next_dxy'] for e in buffer]).to(device)

        with torch.no_grad():
            _, n_vals = self.model(n_golds, n_dxys)
            n_vals = n_vals.squeeze(-1)

        # GAE
        advantages = torch.zeros_like(rews)
        last_gae = 0.0
        for t in reversed(range(len(rews))):
            delta = rews[t] + self.gamma * n_vals[t] - vals[t]
            advantages[t] = last_gae = delta + self.gamma * self.gae_lambda * last_gae
        returns = advantages + vals
        advantages = (advantages - advantages.mean()) / (advantages.std() + 1e-8)

        # PPO epochs
        final_loss = 0.0
        for epoch in range(self.epochs):
            perm = torch.randperm(len(acts))
            for i in range(0, len(acts), self.batch_size):
                idx = perm[i:i+self.batch_size]
                logits, curr_vals = self.model(golds[idx], dxys[idx])
                dist = Categorical(logits=logits)
                new_lp = dist.log_prob(acts[idx])
                entropy = dist.entropy().mean()

                ratio = torch.exp(new_lp - old_lp[idx])
                surr1 = ratio * advantages[idx]
                surr2 = torch.clamp(ratio, 1 - self.clip_range, 1 + self.clip_range) * advantages[idx]
                policy_loss = -torch.min(surr1, surr2).mean()
                value_loss = nn.MSELoss()(curr_vals.squeeze(-1), returns[idx])
                loss = (policy_loss
                        + self.value_coeff * value_loss
                        - self.entropy_coeff * entropy)

                self.optimizer.zero_grad()
                loss.backward()
                nn.utils.clip_grad_norm_(self.model.parameters(), 0.5)
                self.optimizer.step()
                final_loss = loss.item()

        return final_loss