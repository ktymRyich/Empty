---
tags: [decision, adr, island-vacation]
date: 2026-06-01
status: accepted
---

# ADR-0001 ゲームエンジンは Three.js（Unity ではない）

## 文脈
Island Vacation のエンジン選定。Unity と Three.js を比較。

## 決定
**Three.js** を採用する。

## 理由
- 既存リポジトリ／デプロイ環境（Vite/TS/GitHub Pages）にそのまま乗る。
- テキストの TS コードなので AI（Claude）が反復しやすい。Unity はシーンがバイナリ＆
  エディタ前提で AI 反復に不向き。
- Pixal3D 等で生成した glTF/テクスチャを Web で軽量に配信できる。
- Unity は物理・アニメ・地形が標準装備で本格3Dに強いが、WebGL ビルドが重く、この
  AI 主導・Web 配信ワークフローには噛み合わない。

## 影響
- 物理・キャラ操作は重いエンジンに頼らず軽量ライブラリ／自前実装で補う。
- 必要になれば Rapier（WASM 物理）を後から導入（[[projects/island-vacation]] の
  CharacterController が差し替え点）。

関連: [[decisions/ADR-0002-project-isolation]]
