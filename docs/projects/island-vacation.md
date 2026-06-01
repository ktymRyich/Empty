---
tags: [project, threejs, game]
status: active
updated: 2026-06-01
---

# 🏝️ Island Vacation

ひとつの島（春夏秋冬＋中央火山）をゆるく歩き回る「Go Vacation × Wii Sports
Resort」風の 3D 探索ゲーム。リポジトリ `Empty` の2つ目のプロジェクト。

- コード: `island-vacation/`
- 詳細設計: `island-vacation/PLAN.md`
- 技術: Three.js + TypeScript + Vite、アート=ローポリ・トゥーン
- 関連決定: [[decisions/ADR-0001-engine-three-js]], [[decisions/ADR-0002-project-isolation]], [[decisions/ADR-0003-asset-pipeline-pixal3d]]

## 現状（第1スライス：完了）
`npm run dev` で「4〜5頭身トゥーン・アバターを追従カメラ付きで春の草原を歩かせる」
動く土台が完成。typecheck / build / dev すべて通過。

実装済みの土台:
- 固定タイムステップ・ループ（決定的な移動、物理導入に耐える）
- キネマティック・キャラ操作（カメラ相対 WASD ＋ 地面レイキャスト）= 将来の物理差し替え点
- 追従三人称カメラ（damp 平滑）
- World / Region / Ground 抽象（地域・移動手段を作り直さず追加できる継ぎ目）
- placeholder アバター ＋ アセット(GLTFLoader/manifest/DRACO シーム)・アニメ(no-op)継ぎ目

## 次の一手 → [[roadmap]]

## アセット制作
[[decisions/ADR-0003-asset-pipeline-pixal3d]] 参照。Pixal3D で生成した GLB を
`island-vacation/public/models/` に置き、`src/assets/manifest.ts` にキー追加。
