"""系列の長さ調整（torch 非依存の純粋関数。単体テスト対象）。"""

from __future__ import annotations

import numpy as np

from .landmarks import FEATURE_DIM


def resample_sequence(seq: np.ndarray, length: int) -> np.ndarray:
    """(T, D) を (length, D) に。等間隔サンプリング／エッジパディング。

    - T == 0: ゼロ系列を返す。
    - T == length: そのまま。
    - それ以外: 0..T-1 を length 点に等間隔サンプリング（最近傍丸め）。
    """
    t = seq.shape[0]
    d = seq.shape[1] if seq.ndim == 2 else FEATURE_DIM
    if t == 0:
        return np.zeros((length, d), dtype=np.float32)
    if t == length:
        return seq.astype(np.float32)
    idx = np.linspace(0, t - 1, num=length)
    idx = np.clip(np.round(idx).astype(int), 0, t - 1)
    return seq[idx].astype(np.float32)
