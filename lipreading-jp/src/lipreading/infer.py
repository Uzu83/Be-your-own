"""学習済みモデルで推論する（Web カメラ or 動画ファイル）。

例:
    python -m lipreading.infer --model runs/best.pt --source 0
    python -m lipreading.infer --model runs/best.pt --source clip.mp4
"""

from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
import torch

from .extract import extract_clip
from .sequence import resample_sequence
from .model import LipWordClassifier


def load_model(model_path: Path):
    ckpt = torch.load(model_path, map_location="cpu")
    label_map: dict[str, int] = ckpt["label_map"]
    inv = {v: k for k, v in label_map.items()}
    model = LipWordClassifier(num_classes=len(label_map))
    model.load_state_dict(ckpt["model"])
    model.eval()
    return model, inv, ckpt.get("seq_len", 32)


def predict(model, inv, seq_len: int, feat: np.ndarray, topk: int = 3) -> list[tuple[str, float]]:
    x = torch.from_numpy(resample_sequence(feat, seq_len)).unsqueeze(0)  # (1, T, D)
    with torch.no_grad():
        probs = torch.softmax(model(x), dim=1)[0]
    k = min(topk, probs.numel())
    vals, idx = probs.topk(k)
    return [(inv[int(i)], float(v)) for v, i in zip(vals, idx)]


def main() -> None:
    ap = argparse.ArgumentParser(description="口唇読み取りの推論")
    ap.add_argument("--model", type=Path, required=True)
    ap.add_argument("--source", default="0", help="Webカメラ番号 or 動画パス")
    args = ap.parse_args()

    import mediapipe as mp

    model, inv, seq_len = load_model(args.model)
    face_mesh = mp.solutions.face_mesh.FaceMesh(
        static_image_mode=False, max_num_faces=1, refine_landmarks=True,
        min_detection_confidence=0.5, min_tracking_confidence=0.5,
    )

    # 動画ファイルなら 1 本を推論。Web カメラなら一定フレームを溜めて逐次推論。
    if Path(str(args.source)).exists():
        feat = extract_clip(Path(str(args.source)), face_mesh)
        if feat.shape[0] == 0:
            raise SystemExit("顔を検出できませんでした。")
        for word, p in predict(model, inv, seq_len, feat):
            print(f"{word}\t{p:.3f}")
    else:
        _run_webcam(model, inv, seq_len, int(args.source), face_mesh)
    face_mesh.close()


def _run_webcam(model, inv, seq_len, cam_index: int, face_mesh, window: int = 32) -> None:
    import cv2

    from .landmarks import (
        LEFT_EYE_CORNER, LIP_LANDMARKS, RIGHT_EYE_CORNER,
        flatten_feature, normalize_lip_points,
    )

    cap = cv2.VideoCapture(cam_index)
    buf: list[np.ndarray] = []
    print("Web カメラ推論中。q で終了。")
    while True:
        ok, frame = cap.read()
        if not ok:
            break
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        res = face_mesh.process(rgb)
        if res.multi_face_landmarks:
            lm = res.multi_face_landmarks[0].landmark
            pts = np.array([[lm[i].x, lm[i].y] for i in LIP_LANDMARKS], dtype=np.float32)
            eye_l = np.array([lm[LEFT_EYE_CORNER].x, lm[LEFT_EYE_CORNER].y], dtype=np.float32)
            eye_r = np.array([lm[RIGHT_EYE_CORNER].x, lm[RIGHT_EYE_CORNER].y], dtype=np.float32)
            buf.append(flatten_feature(normalize_lip_points(pts, eye_l, eye_r)))
            buf = buf[-window:]
            if len(buf) >= window:
                top = predict(model, inv, seq_len, np.stack(buf))[0]
                cv2.putText(frame, f"{top[0]} {top[1]:.2f}", (20, 40),
                            cv2.FONT_HERSHEY_SIMPLEX, 1.0, (0, 220, 160), 2)
        cv2.imshow("lipreading-jp", frame)
        if cv2.waitKey(1) & 0xFF == ord("q"):
            break
    cap.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    main()
