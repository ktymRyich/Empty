---
tags: [log, highlights]
updated: 2026-06-01
---

# 💬 チャット重要事項ログ

チャットで決まった/分かった重要事項を日付つきで追記する場所。詳細な意思決定は
`decisions/` の ADR へ、ここはダイジェスト。

## 2026-06-01 — Island Vacation 立ち上げ
- リポジトリで2つ目のプロジェクトを開始。エンジンは **Three.js** に決定
  → [[decisions/ADR-0001-engine-three-js]]
- particle-ecosystem とは **完全独立**（コード結合なし）
  → [[decisions/ADR-0002-project-isolation]]
- 企画: 春夏秋冬＋中央火山の島、4〜5頭身アバター、地域別の移動手段、ローポリ・トゥーン。
  Go Vacation / Wii Sports Resort 参照。詳細は `island-vacation/PLAN.md`。
- **第1スライス完成**: 歩行＋追従カメラ＋春の草原（typecheck/build/dev 通過）。
- アセットは **Pixal3D**（外部ツール、取り込まない。出力 GLB だけ取り込む）
  → [[decisions/ADR-0003-asset-pipeline-pixal3d]]
  - ⚠️ 商用時は重みのライセンスを HF で要確認。
- **Pages 結合公開**: particle はルート、island は `/island-vacation/` サブパス
  → [[decisions/ADR-0004-pages-deploy-layout]]
- **docs(Obsidian vault) と Issues の役割分担**を採用
  → [[decisions/ADR-0005-docs-and-issues]]

<!-- 次の追記はこの上に新しい日付見出しで -->
