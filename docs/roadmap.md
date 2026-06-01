---
tags: [roadmap, island-vacation]
updated: 2026-06-01
---

# 🗺️ ロードマップ（Island Vacation）

各項目は GitHub Issues に対応（起票後に番号をリンク）。Stage は Milestone に対応。

## ✅ 完了（第1スライス）
- [x] Stage 0–5 動く土台（[[projects/island-vacation]] 参照）

## ⏳ 次（優先度順）
GitHub Issues: https://github.com/ktymRyich/Empty/issues

- [ ] [#3](https://github.com/ktymRyich/Empty/issues/3) 生成アバター投入：Pixal3D で `avatar.glb` →
      `useGeneratedAvatar=true`、`idle`/`walk` clip → [[decisions/ADR-0003-asset-pipeline-pixal3d]]
- [ ] [#4](https://github.com/ktymRyich/Empty/issues/4) 夏の地域（ビーチ・海）を `world/regions/` に追加
- [ ] [#5](https://github.com/ktymRyich/Empty/issues/5) 秋の地域（紅葉の森・山道）
- [ ] [#6](https://github.com/ktymRyich/Empty/issues/6) 冬の地域（雪山・氷原）
- [ ] [#7](https://github.com/ktymRyich/Empty/issues/7) 中央の火山（ランドマーク）
- [ ] [#8](https://github.com/ktymRyich/Empty/issues/8) 地域別の移動手段（カヤック等）を別コントローラで
- [ ] [#9](https://github.com/ktymRyich/Empty/issues/9) トゥーン・アウトライン後処理（vite-plugin-glsl 再導入）、影
- [ ] [#10](https://github.com/ktymRyich/Empty/issues/10) Pages 公開の有効化確認・公開URL検証

## 推奨ラベル / Milestone
- ラベル: `area:character` `area:world` `area:assets` `area:camera`
  `area:ci` `type:feature` `type:bug` `type:docs`
- Milestone: `Stage: 夏地域` `Stage: 秋地域` `Stage: 冬地域` `Stage: 火山`
  `Stage: 移動手段` `Stage: 仕上げ`

> Issue を起票したら、各行に `(#12)` のように番号を付けて追跡する。
