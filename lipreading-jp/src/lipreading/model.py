"""口唇ランドマーク系列 → 単語分類モデル。

系列 (B, T, FEATURE_DIM) を時間方向 1D-CNN で局所パターン化し、GRU で時間文脈を
まとめて単語クラスへ分類する。少数データでも回る軽量構成。
データが増えたら、この分類ヘッドを CTC に差し替えて文レベルへ拡張できる。
"""

from __future__ import annotations

import torch
import torch.nn as nn

from .landmarks import FEATURE_DIM


class LipWordClassifier(nn.Module):
    def __init__(self, num_classes: int, feature_dim: int = FEATURE_DIM, hidden: int = 128):
        super().__init__()
        self.temporal = nn.Sequential(
            nn.Conv1d(feature_dim, hidden, kernel_size=5, padding=2),
            nn.BatchNorm1d(hidden),
            nn.ReLU(),
            nn.Conv1d(hidden, hidden, kernel_size=3, padding=1),
            nn.BatchNorm1d(hidden),
            nn.ReLU(),
        )
        self.gru = nn.GRU(hidden, hidden, num_layers=2, batch_first=True, bidirectional=True, dropout=0.2)
        self.head = nn.Sequential(
            nn.Linear(hidden * 2, hidden),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(hidden, num_classes),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # x: (B, T, D) -> Conv1d は (B, D, T) を期待
        h = self.temporal(x.transpose(1, 2))  # (B, hidden, T)
        h = h.transpose(1, 2)  # (B, T, hidden)
        out, _ = self.gru(h)  # (B, T, hidden*2)
        pooled = out.mean(dim=1)  # 時間平均プーリング
        return self.head(pooled)  # (B, num_classes)
