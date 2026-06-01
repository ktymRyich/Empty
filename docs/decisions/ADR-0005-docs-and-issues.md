---
tags: [decision, adr, process]
date: 2026-06-01
status: accepted
---

# ADR-0005 docs（Obsidian vault）と GitHub Issues の役割分担

## 文脈
進捗・計画・チャットの重要事項をプロジェクト内に分かりやすく残したい。Obsidian の
wiki を参考に。Issues も効率的に使いたい。

## 決定
- **`docs/` = リポジトリ直下の Obsidian 互換 Markdown vault**（versioning される
  ナレッジベース）。設計・決定（ADR）・チャット要点・ロードマップを置く。
- **GitHub Issues = タスク**（バグ・機能・次やること）。開いて閉じる情報。
- 設計の長文は Issue に書かず docs にリンク。コミットに `closes #N` で連携。

## 理由
- 「消えない情報」と「消える情報」を分けると、両方が散らからない。
- GitHub Wiki は別リポジトリで「プロジェクト内に保存」要望に反するため不採用。

## 運用ルール
- 意思決定したら `docs/decisions/` に ADR を1枚（[[templates/decision]] をコピー）。
- チャットの要点は [[chat-highlights]] に日付つきで追記。
- ロードマップの各項目は Issue 化（ラベル `area:*` / `type:*`、Stage=Milestone）。
  → [[roadmap]]
