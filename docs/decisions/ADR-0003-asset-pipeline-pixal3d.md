---
tags: [decision, adr, assets, island-vacation]
date: 2026-06-01
status: accepted
---

# ADR-0003 アセットは Pixal3D（外部ツール、リポジトリに取り込まない）

## 文脈
3D アセットを [Pixal3D](https://github.com/TencentARC/Pixal3D)（TencentARC、SIGGRAPH
2026、単一画像→PBR 付き GLB）で生成したい。MIT 化されたので「フォークして
プロジェクトに取り込むべきか？」が論点。

## 決定
**Pixal3D はゲームリポジトリに vendor しない。**「ツールは外、成果物(GLB)だけ中」。

## 理由
- Pixal3D は Python + CUDA（GPU/高VRAM）の重い ML 推論パイプライン。Three.js の
  ゲームリポジトリとはツールチェーンが別世界で、取り込むと肥大化・混在する。
- 必要なのは出力 GLB であり、それは `island-vacation/public/models/` に置けば良い。

## 運用
1. Pixal3D は別環境で実行（オンラインデモ / HF Space / ローカル GPU /
   ComfyUI: Saganaki22/Pixal3D-ComfyUI）。
2. 出力 GLB を `island-vacation/public/models/` に保存。
3. `src/assets/manifest.ts` にキー追加 → `AssetManager.load()` / `Avatar.fromGLTF()`。
4. プレイヤーアバターは `GameConfig.useGeneratedAvatar = true` で差し替え。

## ライセンス注意
- **コードは MIT**。ただしリポジトリに重み専用ライセンスの明記なし。
- **商用利用前に Hugging Face のモデルカードで重みの条件を確認**すること
  （コード MIT ≠ 重み商用可、のケースが ML では稀にある）。
- 生成設定を自分用に改造したい場合のみフォーク。その際も**ゲームとは別リポ
  （またはサブモジュール）**にし、ゲーム本体には混ぜない。

## 参考
- https://github.com/TencentARC/Pixal3D
- https://huggingface.co/TencentARC/Pixal3D
- https://github.com/Saganaki22/Pixal3D-ComfyUI
