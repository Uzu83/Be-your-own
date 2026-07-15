"""口唇ランドマークの定義と正規化。

MediaPipe FaceMesh（468点）のうち唇周辺の点だけを使い、話者の顔の大きさ・
位置・傾きに不変な特徴へ正規化する。映像そのものではなく低次元の系列を学習に使う。
"""

from __future__ import annotations

import numpy as np

# MediaPipe FaceMesh の唇ランドマーク（外輪郭＋内輪郭、計 40 点）。
LIP_LANDMARKS: list[int] = [
    61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291,
    185, 40, 39, 37, 0, 267, 269, 270, 409,
    78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308,
    191, 80, 81, 82, 13, 312, 311, 310, 415,
]

# 目尻（左右）: スケール正規化の基準（両目間距離）に使う。
LEFT_EYE_CORNER = 33
RIGHT_EYE_CORNER = 263

NUM_LIP_POINTS = len(LIP_LANDMARKS)
FEATURE_DIM = NUM_LIP_POINTS * 2  # (x, y) × 点数


def normalize_lip_points(points: np.ndarray, eye_l: np.ndarray, eye_r: np.ndarray) -> np.ndarray:
    """唇点を話者不変な座標へ正規化する。

    - 平行移動不変: 唇の重心を原点に。
    - スケール不変: 両目間距離で割る。
    - 出力: shape (NUM_LIP_POINTS, 2) の float32。

    points: (NUM_LIP_POINTS, 2) の生座標（画像座標でも正規化座標でも可）。
    eye_l, eye_r: (2,) の目尻座標。
    """
    centroid = points.mean(axis=0, keepdims=True)
    scale = float(np.linalg.norm(eye_r - eye_l))
    if scale < 1e-6:
        scale = 1.0
    return ((points - centroid) / scale).astype(np.float32)


def flatten_feature(norm_points: np.ndarray) -> np.ndarray:
    """(NUM_LIP_POINTS, 2) を (FEATURE_DIM,) に平坦化する。"""
    return norm_points.reshape(-1).astype(np.float32)
