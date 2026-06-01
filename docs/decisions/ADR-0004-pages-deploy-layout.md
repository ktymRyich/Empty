---
tags: [decision, adr, deploy, ci]
date: 2026-06-01
status: accepted
---

# ADR-0004 Pages は結合公開（particle はルート、island はサブパス）

## 文脈
両プロジェクトを GitHub Pages でプレビューしたい。だが Pages は **1リポジトリ＝
1サイト**。

## 決定
**1本の結合ワークフロー**（`.github/workflows/deploy.yml`）で両方をビルドし、
1つの artifact に同梱して公開する。
- particle-ecosystem → サイトルート `/<repo>/`（**URL 不変**）
- island-vacation → サブパス `/<repo>/island-vacation/`

プレビューのため、当面この開発ブランチ
`claude/game-design-island-exploration-nZstc` でも発火させる。

## 理由
- 単一 Pages サイト・`concurrency: group: pages` の制約に素直に従える。
- particle-ecosystem の既存 URL を壊さない（base は環境変数 `GITHUB_PAGES_BASE`
  を読むのでコード変更不要）。

## 公開 URL（目安）
- particle-ecosystem: `https://<owner>.github.io/Empty/`
- island-vacation: `https://<owner>.github.io/Empty/island-vacation/`

## 影響 / 未確認
- リポジトリ設定で Pages の Source = **GitHub Actions** になっている前提。
  未設定なら Settings → Pages で有効化が必要。
