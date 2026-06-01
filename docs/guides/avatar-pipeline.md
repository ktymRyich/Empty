---
tags: [guide, assets, island-vacation, pixal3d]
updated: 2026-06-01
---

# 🧍 アバター生成パイプライン（Pixal3D → avatar.glb）

Issue [#3](https://github.com/ktymRyich/Empty/issues/3) 用の手順。Pixal3D で
キャラの GLB を作り、ゲームに差し込む。関連: [[decisions/ADR-0003-asset-pipeline-pixal3d]]

## ⚙️ 仕組み（ゲーム側は配線済み・turnkey）
- `island-vacation/public/models/avatar.glb` を**置くだけで自動検出**して使う
  （無ければ placeholder の棒人間）。フラグ編集は不要。
- 読み込み時に**身長 1.7m へ自動正規化＋足元を地面に接地**（`Avatar.fromGLTF`）。
- 向きがおかしい場合は `src/config/GameConfig.ts` の
  `avatar.modelYawOffset` を `Math.PI`（180°）等に。
- ⚠️ Pixal3D は**1枚画像→静止メッシュ**。リグ/アニメは付かないので、当面は
  歩行モーション無し（簡易な上下バウンスのみ）。歩き/待機アニメは別途リギングが必要。

## 🚀 生成ルート

### ルートA：オンラインデモ / HF Space（一番手軽・GPU不要・まず試すならこれ）
1. Pixal3D のオンラインデモ（GitHub README のリンク or Hugging Face Space）を開く。
2. キャラのコンセプト画像を1枚アップロード → 生成 → **GLB をダウンロード**。

### ルートB：ローカル（自分のGPUで・再現性/オフライン重視）
ComfyUI 版 [Saganaki22/Pixal3D-ComfyUI](https://github.com/Saganaki22/Pixal3D-ComfyUI)
が Windows/ローカル対応で扱いやすい。

#### VRAM の目安（RTX 4070 Super = 12GB の場合）
- **12GB でも動く**。ただし既定設定だと NAF 段階で OOM になりやすいので低VRAM設定にする:
  - `vram_mode=hybrid_low_vram`（または `native_low_vram`）… 速度/システムRAMと引き換えにVRAM削減
  - `load_moge=false` / `load_rembg=false`（不要モデルを読まない）
  - `camera_mode=manual`
  - `naf_target_size` を `256` か `128` に下げる（または NAF を無効化）
- **システムRAM 32GB+ 推奨**（低VRAMモードはRAMにオフロードするため）。
- Ada世代なので計算性能は十分。**制約はVRAM**で、速度は16〜24GB機より遅め。

## 🖼️ 入力画像のコツ
- 正面向き・全身・**背景は無地/透過**が安定（背景は rembg で除去可）。
- 4〜5頭身のデフォルメ体型を狙うなら、その比率の絵を入れる（出力は入力に忠実）。
- トゥーン調の平坦な塗りの絵だと、ローポリ・トゥーンの世界観に馴染みやすい。

## 📥 取り込み手順
1. 生成した GLB を `island-vacation/public/models/avatar.glb` として保存。
2. `npm run dev` で確認（コンソールに `[avatar] using generated avatar.glb`）。
3. 向きが変なら `GameConfig.avatar.modelYawOffset` を調整。
4. 大きすぎ/小さすぎは自動正規化されるが、極端なら入力画像の構図を見直す。
5. 良ければコミット（GLB はサイズに注意。大きい場合は Draco 圧縮を検討
   → `AssetManager` に DRACO シーム有り）。

## ✅ 完了の定義
春の草原を、生成アバターで歩き回れる（カメラ追従・接地・向き正しい）。
