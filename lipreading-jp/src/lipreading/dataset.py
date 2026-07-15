"""前処理済み .npz を読み込む PyTorch Dataset。

各クリップの (T, FEATURE_DIM) 系列を固定長 T にリサンプルして返す。
不足はエッジパディング、超過は等間隔サンプリング。
"""

from __future__ import annotations

import json
from pathlib import Path

import numpy as np
import torch
from torch.utils.data import Dataset

from .sequence import resample_sequence

__all__ = ["LipDataset", "resample_sequence"]


class LipDataset(Dataset):
    """data/processed 以下の .npz と labels.json を読む。"""

    def __init__(self, root: str | Path, seq_len: int = 32):
        self.root = Path(root)
        self.seq_len = seq_len
        self.label_map: dict[str, int] = json.loads(
            (self.root / "labels.json").read_text(encoding="utf-8")
        )
        self.samples: list[tuple[Path, int]] = []
        for word, label in self.label_map.items():
            for npz in sorted((self.root / word).glob("*.npz")):
                self.samples.append((npz, label))

    @property
    def num_classes(self) -> int:
        return len(self.label_map)

    def __len__(self) -> int:
        return len(self.samples)

    def __getitem__(self, i: int) -> tuple[torch.Tensor, int]:
        path, label = self.samples[i]
        feat = np.load(path)["feat"]
        feat = resample_sequence(feat, self.seq_len)  # (seq_len, FEATURE_DIM)
        return torch.from_numpy(feat), label
