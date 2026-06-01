---
tags: [moc, index]
updated: 2026-06-01
---

# 🏝️ Empty リポジトリ Wiki（Home）

このフォルダは Obsidian で開けるナレッジベース（vault）です。コードと一緒に
git 管理され、GitHub 上でもそのまま読めます。**消えない情報（設計・決定・要点）**を
ここに、**消える情報（タスク）**は GitHub Issues に置きます。

> Obsidian で開く: このリポジトリの `docs/` フォルダを Vault として開いてください。
> `[[二重括弧]]` はノート間リンク、`#タグ` で横断できます。

## 🗂️ Map of Content

### プロジェクト
- [[projects/island-vacation|🏝️ Island Vacation]] — 島探索ゲーム（Three.js）
- [[projects/particle-ecosystem|✨ Particle Ecosystem]] — パーティクル生態系シミュレータ

### エリア設計
- [[areas/_index|🗺️ エリア設計インデックス]]（全7エリア＋共通システム）
- [[areas/marine|🌊 マリン]] / [[areas/snow|❄️ スノー]] / [[areas/mountain|⛰️ マウンテン]] / [[areas/city|🏙️ シティ]]

### 決定ログ（ADR）
- [[decisions/ADR-0001-engine-three-js|ADR-0001 エンジンは Three.js]]
- [[decisions/ADR-0002-project-isolation|ADR-0002 プロジェクトは完全独立]]
- [[decisions/ADR-0003-asset-pipeline-pixal3d|ADR-0003 アセットは Pixal3D（外部ツール）]]
- [[decisions/ADR-0004-pages-deploy-layout|ADR-0004 Pages は結合公開（サブパス）]]
- [[decisions/ADR-0005-docs-and-issues|ADR-0005 docs と Issues の役割分担]]
- [[decisions/ADR-0006-regions-restructure|ADR-0006 エリア構成の刷新（季節廃止）]]

### ガイド
- [[guides/avatar-pipeline|🧍 アバター生成パイプライン（Pixal3D → avatar.glb）]]

### 運用
- [[roadmap|🗺️ ロードマップ]] — Stage と Issue へのリンク
- [[chat-highlights|💬 チャット重要事項ログ]]
- [[templates/decision|📄 決定ログ テンプレ]]

## 📌 使い方メモ
- 新しい意思決定をしたら `decisions/` に ADR を1枚追加（[[templates/decision]] をコピー）。
- チャットで決めた要点は [[chat-highlights]] に日付つきで追記。
- 「次にやること」は GitHub Issues へ。設計の詳細は Issue に書かず、この vault にリンク。
