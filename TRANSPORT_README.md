# ⛴ 一時退避ブランチ（transport/new-projects）

このブランチは **2つの新規プロジェクトを回収するための一時的な運び屋**です。
be-your-own 本体とは無関係で、main には取り込みません。

含まれるもの:

- `morse-jp/` … 和文・欧文モールス双方向変換（**動く MVP**：typecheck・11テスト・本番ビルド通過済み）
- `lipreading-jp/` … 日本語読唇の土台（MediaPipe 抽出＋学習/推論スケルトン、純粋ロジックは pytest 6件通過）

## 各プロジェクトを本来の空リポへ移す手順

```bash
# このブランチを取得
git fetch origin transport/new-projects
git worktree add /tmp/transport origin/transport/new-projects   # または git checkout

# morse-jp を専用リポへ
cp -r /tmp/transport/morse-jp ~/morse-jp && cd ~/morse-jp
git init && git add -A && git commit -m "morse-jp: 初期コミット"
git branch -M main
git remote add origin https://github.com/Uzu83/morse-jp.git
git push -u origin main

# lipreading-jp も同様に
cp -r /tmp/transport/lipreading-jp ~/lipreading-jp && cd ~/lipreading-jp
git init && git add -A && git commit -m "lipreading-jp: 初期コミット"
git branch -M main
git remote add origin https://github.com/Uzu83/lipreading-jp.git
git push -u origin main
```

移し終えたら、このブランチは削除して構いません:

```bash
git push origin --delete transport/new-projects
```

各プロジェクト内の `README.md` にセットアップ・使い方があります。
