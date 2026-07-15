"""torch/mediapipe 非依存の純粋ロジックのテスト（numpy のみ）。"""

import numpy as np

from lipreading.landmarks import (
    FEATURE_DIM,
    NUM_LIP_POINTS,
    flatten_feature,
    normalize_lip_points,
)
from lipreading.sequence import resample_sequence


def test_normalize_is_translation_invariant():
    pts = np.random.rand(NUM_LIP_POINTS, 2).astype("float32")
    eye_l = np.array([0.3, 0.5], dtype="float32")
    eye_r = np.array([0.7, 0.5], dtype="float32")
    a = normalize_lip_points(pts, eye_l, eye_r)
    b = normalize_lip_points(pts + 5.0, eye_l + 5.0, eye_r + 5.0)
    assert np.allclose(a, b, atol=1e-5)


def test_normalize_is_scale_invariant():
    pts = np.random.rand(NUM_LIP_POINTS, 2).astype("float32")
    eye_l = np.array([0.4, 0.5], dtype="float32")
    eye_r = np.array([0.6, 0.5], dtype="float32")
    a = normalize_lip_points(pts, eye_l, eye_r)
    b = normalize_lip_points(pts * 3.0, eye_l * 3.0, eye_r * 3.0)
    assert np.allclose(a, b, atol=1e-5)


def test_feature_dim():
    pts = np.zeros((NUM_LIP_POINTS, 2), dtype="float32")
    assert flatten_feature(pts).shape[0] == FEATURE_DIM


def test_resample_up_and_down():
    up = resample_sequence(np.arange(10).reshape(5, 2).astype("float32"), 8)
    down = resample_sequence(np.arange(40).reshape(20, 2).astype("float32"), 8)
    assert up.shape == (8, 2)
    assert down.shape == (8, 2)


def test_resample_empty_returns_zeros():
    out = resample_sequence(np.zeros((0, FEATURE_DIM), dtype="float32"), 8)
    assert out.shape == (8, FEATURE_DIM)
    assert not out.any()


def test_resample_same_length_is_identity():
    seq = np.random.rand(8, FEATURE_DIM).astype("float32")
    assert np.array_equal(resample_sequence(seq, 8), seq)
