---
tags: [decision, adr, repo]
date: 2026-06-01
status: accepted
---

# ADR-0002 プロジェクトは完全独立（1フォルダ1プロジェクト）

## 文脈
`Empty` リポジトリで複数プロジェクトを進める。Island Vacation を particle-ecosystem
とどう同居させるか。

## 決定
**「1フォルダ1プロジェクト」のコンテナ**として運用。各プロジェクトは自前の
`package.json` / `tsconfig` / `vite.config` / `.gitignore` を持ち、依存・ビルドが独立。
コード上の import 結合はゼロ。新規はサンプルの**規約を真似るだけ**。

## 理由
- ユーザー要望「完全にいまあるパーティクルのプロジェクトとは別で進めたい」。
- モノレポのツール（workspaces 等）は現状の単純さでは不要。

## 影響
- 例外は **GitHub Pages のデプロイのみ**（1リポジトリ＝1サイトのため共有が不可避）。
  → [[decisions/ADR-0004-pages-deploy-layout]] でサブパス公開により分離を維持。
