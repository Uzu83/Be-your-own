"""単語分類モデルの学習スクリプト。

例:
    python -m lipreading.train --data data/processed --config configs/base.yaml
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import torch
import torch.nn as nn
from torch.utils.data import DataLoader, random_split

from .dataset import LipDataset
from .model import LipWordClassifier


def load_config(path: Path | None) -> dict:
    cfg = {"seq_len": 32, "batch_size": 16, "epochs": 40, "lr": 1e-3, "val_split": 0.2}
    if path and path.exists():
        import yaml  # 遅延 import

        cfg.update(yaml.safe_load(path.read_text(encoding="utf-8")) or {})
    return cfg


def run_epoch(model, loader, criterion, optimizer, device) -> tuple[float, float]:
    train = optimizer is not None
    model.train(train)
    total_loss, correct, n = 0.0, 0, 0
    for feats, labels in loader:
        feats, labels = feats.to(device), labels.to(device)
        with torch.set_grad_enabled(train):
            logits = model(feats)
            loss = criterion(logits, labels)
            if train:
                optimizer.zero_grad()
                loss.backward()
                optimizer.step()
        total_loss += loss.item() * feats.size(0)
        correct += (logits.argmax(1) == labels).sum().item()
        n += feats.size(0)
    return total_loss / max(n, 1), correct / max(n, 1)


def main() -> None:
    ap = argparse.ArgumentParser(description="口唇単語分類の学習")
    ap.add_argument("--data", type=Path, default=Path("data/processed"))
    ap.add_argument("--config", type=Path, default=Path("configs/base.yaml"))
    ap.add_argument("--out", type=Path, default=Path("runs"))
    args = ap.parse_args()

    cfg = load_config(args.config)
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"device={device}  config={cfg}")

    ds = LipDataset(args.data, seq_len=cfg["seq_len"])
    if len(ds) == 0:
        raise SystemExit("学習データが空です。先に extract.py で特徴を作ってください。")

    n_val = max(1, int(len(ds) * cfg["val_split"]))
    n_train = len(ds) - n_val
    train_ds, val_ds = random_split(ds, [n_train, n_val], generator=torch.Generator().manual_seed(42))
    train_loader = DataLoader(train_ds, batch_size=cfg["batch_size"], shuffle=True)
    val_loader = DataLoader(val_ds, batch_size=cfg["batch_size"])

    model = LipWordClassifier(ds.num_classes).to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=cfg["lr"])

    args.out.mkdir(parents=True, exist_ok=True)
    best_acc = 0.0
    for epoch in range(1, cfg["epochs"] + 1):
        tr_loss, tr_acc = run_epoch(model, train_loader, criterion, optimizer, device)
        va_loss, va_acc = run_epoch(model, val_loader, criterion, None, device)
        print(f"[{epoch:3d}] train loss={tr_loss:.3f} acc={tr_acc:.3f} | val loss={va_loss:.3f} acc={va_acc:.3f}")
        if va_acc >= best_acc:
            best_acc = va_acc
            torch.save({"model": model.state_dict(), "label_map": ds.label_map, "seq_len": cfg["seq_len"]}, args.out / "best.pt")
    (args.out / "metrics.json").write_text(json.dumps({"best_val_acc": best_acc}, indent=2))
    print(f"完了: best_val_acc={best_acc:.3f} -> {args.out / 'best.pt'}")


if __name__ == "__main__":
    main()
