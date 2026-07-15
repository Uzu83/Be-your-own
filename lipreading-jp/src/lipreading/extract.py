"""動画クリップから口唇ランドマーク系列を抽出して .npz に保存する。

入力レイアウト:  data/raw/<word>/<clip>.mp4
出力:            data/processed/<word>/<clip>.npz   （key="feat": (T, FEATURE_DIM)）
                 data/processed/labels.json          （word ↔ index の対応）

MediaPipe FaceMesh でフレームごとに唇 40 点を取り、話者不変に正規化して系列化する。
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import numpy as np

from .landmarks import (
    FEATURE_DIM,
    LEFT_EYE_CORNER,
    LIP_LANDMARKS,
    RIGHT_EYE_CORNER,
    flatten_feature,
    normalize_lip_points,
)


def extract_clip(video_path: Path, face_mesh) -> np.ndarray:
    """1 クリップ → (T, FEATURE_DIM)。顔が取れないフレームはスキップ。"""
    import cv2  # 遅延 import（抽出時のみ必要）

    cap = cv2.VideoCapture(str(video_path))
    feats: list[np.ndarray] = []
    try:
        while True:
            ok, frame = cap.read()
            if not ok:
                break
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            result = face_mesh.process(rgb)
            if not result.multi_face_landmarks:
                continue
            lm = result.multi_face_landmarks[0].landmark
            pts = np.array([[lm[i].x, lm[i].y] for i in LIP_LANDMARKS], dtype=np.float32)
            eye_l = np.array([lm[LEFT_EYE_CORNER].x, lm[LEFT_EYE_CORNER].y], dtype=np.float32)
            eye_r = np.array([lm[RIGHT_EYE_CORNER].x, lm[RIGHT_EYE_CORNER].y], dtype=np.float32)
            feats.append(flatten_feature(normalize_lip_points(pts, eye_l, eye_r)))
    finally:
        cap.release()

    if not feats:
        return np.zeros((0, FEATURE_DIM), dtype=np.float32)
    return np.stack(feats).astype(np.float32)


def main() -> None:
    ap = argparse.ArgumentParser(description="動画から口唇ランドマーク系列を抽出")
    ap.add_argument("--input", type=Path, default=Path("data/raw"))
    ap.add_argument("--output", type=Path, default=Path("data/processed"))
    args = ap.parse_args()

    import mediapipe as mp  # 遅延 import

    face_mesh = mp.solutions.face_mesh.FaceMesh(
        static_image_mode=False,
        max_num_faces=1,
        refine_landmarks=True,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5,
    )

    words = sorted(p.name for p in args.input.iterdir() if p.is_dir())
    label_map = {w: i for i, w in enumerate(words)}
    args.output.mkdir(parents=True, exist_ok=True)
    (args.output / "labels.json").write_text(
        json.dumps(label_map, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    total = 0
    for word in words:
        out_dir = args.output / word
        out_dir.mkdir(parents=True, exist_ok=True)
        for clip in sorted((args.input / word).glob("*.mp4")):
            feat = extract_clip(clip, face_mesh)
            if feat.shape[0] == 0:
                print(f"[skip] 顔を検出できず: {clip}")
                continue
            np.savez_compressed(out_dir / f"{clip.stem}.npz", feat=feat)
            total += 1
            print(f"[ok] {clip}  ->  {feat.shape}")

    face_mesh.close()
    print(f"完了: {total} クリップ / {len(words)} 単語 -> {args.output}")


if __name__ == "__main__":
    main()
