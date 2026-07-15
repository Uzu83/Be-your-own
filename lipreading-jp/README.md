# lipreading-jp

**日本語の読唇（リップリーディング）を、単語レベルから始める OSS プロジェクト。**

口元の動きだけから発話内容を推定します。まずは「あ・い・う・え・お」や日常語 50〜100 語の**単語分類**を MVP とし、文レベルは次フェーズに置きます。

> ⚠️ **現状はスキャフォールド（土台）です。** データ抽出パイプライン・学習/推論スクリプト・データセット定義は揃っていますが、学習済みモデルはまだ同梱していません。まず自分で数百〜数千クリップを撮影し、学習する流れです。GPU（Colab 可）を推奨します。

## なぜ単語レベルからか

日本語読唇をゼロから文レベルで学習させるには、大量の映像データがボトルネックになります。土日〜短期間で「動くもの」に到達するため、次の割り切りを採用します。

- **スコープ限定**：単語（母音 5 種＋日常語）から。文は次フェーズ。
- **軽量な特徴**：フレームごとに MediaPipe FaceMesh で口周辺のランドマーク／ROI を抽出し、映像そのものではなく低次元の系列を学習に使う。
- **転移学習**：フルスクラッチではなく、口形の系列から単語を当てる軽量モデル（3D-CNN + GRU）で少数データに適応。将来は Auto-AVSR 等の事前学習特徴の利用を検討。

## パイプライン全体

```
撮影(mp4) ──► extract.py ──► ランドマーク系列(.npz) ──► train.py ──► model.pt
   │            (MediaPipe)      (口ROI/landmarks)         (3DCNN+GRU)
   └─ label(単語)                                    ──► infer.py（Webカメラ/動画で推論）
```

## セットアップ

```bash
python -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"        # または pip install -r requirements.txt
```

## 使い方

### 1. 単語リストを決める
`configs/words_ja.txt`（母音＋日常語）。1 行 1 語。

### 2. クリップを撮る
`data/raw/<word>/*.mp4` に単語ごとの短いクリップを置く（撮影ガイドは [`docs/recording.md`](docs/recording.md)）。

### 3. 特徴を抽出
```bash
python -m lipreading.extract --input data/raw --output data/processed
```

### 4. 学習
```bash
python -m lipreading.train --data data/processed --config configs/base.yaml
```

### 5. 推論（Web カメラ or 動画）
```bash
python -m lipreading.infer --model runs/best.pt --source 0        # Webカメラ
python -m lipreading.infer --model runs/best.pt --source clip.mp4 # 動画
```

## 設計メモ

- **口 ROI 抽出**：FaceMesh の唇ランドマーク（内輪郭・外輪郭）から正規化した (x, y) 系列を作り、話者の顔サイズ・位置に不変な特徴にする。
- **系列長**：各クリップを固定長 `T` にリサンプル（不足はパディング、超過は等間隔サンプリング）。
- **モデル**：ランドマーク系列 → 時間方向の畳み込み＋GRU → 単語分類（CE 損失）。データが増えたら CTC で文レベルへ拡張。
- **文脈補完のアイデア**：大阪大学 Lip2ja の「口形コード＋LLM」の発想に倣い、視覚特徴の候補列を LLM で日本語として尤もらしく補正する後段は将来の拡張候補。

## ロードマップ

- [x] データ抽出パイプライン（MediaPipe）
- [x] 学習・推論スクリプトの骨組み
- [ ] 母音 5 種の分類で精度検証
- [ ] 日常語 50〜100 語へ拡張
- [ ] 事前学習特徴（Auto-AVSR 等）の転移
- [ ] 文レベル（CTC）＋ LLM 文脈補完

## 参考

- LipNet（STCNN + CTC）／ LipNet-JP（JPHACKS）
- Auto-AVSR ／ Visual Speech Recognition for Multiple Languages
- Lip2ja（口形コード + LLM）

## ライセンス

MIT
