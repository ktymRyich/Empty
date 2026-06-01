# Island Vacation — 企画＋設計

ひとつの島(春夏秋冬＋中央火山)をゆるく歩き回る、「Go Vacation × Wii Sports Resort」風の
3D探索ゲーム。Three.js + TypeScript + Vite。リポジトリ `Empty` の **2つ目のプロジェクト**で、
既存の `particle-ecosystem/` とは完全に独立(フォルダ・依存・ビルド・デプロイすべて別)。

---

## 企画 (Concept)

- **ジャンル**: ゆるい3Dオープン探索 ＋ アクティビティ集
- **舞台**: ひとつの島。中央に**火山**、その周囲を放射状に四季の地域が囲む
  - 🌸 春: 草原・花畑・桜 — *最初に実装したスライス領域*
  - 🌊 夏: ビーチ・海・南国
  - 🍁 秋: 紅葉の森・山道
  - ❄️ 冬: 雪山・氷原
  - 🌋 中央: 火山(ランドマーク／見せ場)
- **キャラ**: 4〜5頭身のデフォルメ・アバター。基本は徒歩。
- **将来の方向性(企画のみ／未実装)**:
  - 地域ごとの移動手段: 春=馬/自転車、夏=カヤック/水上バイク、秋=ハンググライダー/MTB、
    冬=スキー/スノーモービル、火山=登攀/ロープウェイ
  - コアループ: 探索 → スポット発見 → アクティビティ/ミニゲーム → 収集(スタンプ/写真)
- **アート**: ローポリ ＋ トゥーン(`MeshToonMaterial`、明るい配色、後でアウトライン後処理)
- **アセット制作パイプ**: images2.0 でコンセプト/テクスチャ → pixal3d で glTF/GLB →
  `public/models|textures/` に投下 → `src/assets/manifest.ts` にキー追加で差し替え

---

## 技術選定

**Three.js** を採用(Unity ではなく)。理由:
- 既存リポジトリ／デプロイ環境(Vite/TS/GitHub Pages)にそのまま乗る
- テキストの TS コードなので AI(Claude)が反復しやすい
- 生成 glTF/テクスチャを Web で軽量に配信できる

物理・キャラ操作は重いエンジンを使わず軽量ライブラリ／自前実装で補う方針。

---

## アーキテクチャ

core はファクトリ関数、ゲームオブジェクトはクラス。

```
src/
  main.ts                 合成ルート: core+world+player+loop を結線
  core/
    Renderer.ts           createRenderer(): WebGLRenderer, dpr<=2, resize
    SceneManager.ts       createScene(): scene, Hemi+Directional ライト, FogExp2, 空
    Loop.ts               固定タイムステップ(accumulator)ループ ★最重要
    Input.ts              キーボード状態 + gamepad シーム(no-op)
  camera/FollowCamera.ts  追従三人称カメラ(damp 平滑化)
  entities/
    Player.ts             移動する Object3D / velocity / previousPosition
    Avatar.ts             見た目: placeholder プリミティブ or 生成 glTF
  controllers/CharacterController.ts  キネマティック移動 + 地面レイキャスト
  world/
    World.ts              全 Region を保持, sampleGround(x,z), regionAt(x,z)
    Region.ts             Region interface(id/season/bounds/load/unload/update/getGround)
    Ground.ts             raycastDown(x,z) 抽象
    regions/SpringGrassland.ts  スライス唯一の地域(地面+小道具+春の色)
  assets/
    AssetManager.ts       GLTFLoader + キャッシュ, DRACO シーム
    manifest.ts           キー→URL の唯一の差し替え点
  animation/AnimationController.ts  AnimationMixer ラッパ(clip 無しなら no-op)
  ui/Hud.ts               FPS/座標/region デバッグ表示, lil-gui シーム
  utils/math.ts           damp/lerp/clamp(フレームレート非依存平滑化)
  config/GameConfig.ts    速度/カメラ/重力/アバター寸法など tunables
public/models|textures/   生成 .glb / テクスチャの投下先
```

### 「序盤でつまづかない」ための設計判断
- **固定タイムステップ・ループ**: 移動/物理は `fixedDt=1/60` のみで積分。`alpha`/`previousPosition`
  は描画補間の継ぎ目として用意済み。将来 Rapier(固定ステップ前提)を入れてもループ形状不変。
- **キャラ移動はキネマティック＋地面レイキャスト**(Rapier は今は入れない)。
  `CharacterController.update()` の狭いインターフェースが**物理差し替え点**。
- **移動はカメラ相対**。コントローラは抽象 `moveVector` のみ参照 → gamepad/タッチは加算的に追加可。
- **World は単一島の常時ロード方式**(レベル切替ではなく空間サブゾーン)。`regionAt` で内包判定。
- **地面は Ground 抽象越し**。スライスは手続き Plane、将来は sculpted glTF 地形に差し替えるだけ
  (火山の崖/オーバーハングも mesh レイキャストで扱える)。
- **placeholder アバター**で生成前から動く。`Avatar.fromGLTF()` が canonical 寸法へ正規化 →
  `GameConfig.useGeneratedAvatar` を true にするだけで下流無変更で差し替え。
- **アニメは clip 無しで no-op**。後で `idle`/`walk` clip と速度しきい値を足すだけ。

---

## 実装ロードマップ

- [x] **Stage 0** Bootstrap(config, index.html, lit ground)
- [x] **Stage 1** 固定ループ + 入力 + カメラ相対移動
- [x] **Stage 2** 地面スナップ + 境界クランプ + SpringGrassland
- [x] **Stage 3** 追従カメラ(damp 平滑)
- [x] **Stage 4** 4〜5頭身トゥーン・アバター + 向き + HUD
- [x] **Stage 5** アセット/アニメのシーム(placeholder 駆動)
- [ ] 生成 avatar.glb 投入 → `useGeneratedAvatar=true`, `idle/walk` clip マップ
- [ ] 他地域(夏/秋/冬)＋火山
- [ ] 地域別の移動手段コントローラ
- [ ] トゥーン・アウトライン後処理(vite-plugin-glsl 再導入)、影
- [ ] デプロイ(両プロジェクトをサブパスに同梱する結合ワークフロー)

---

## 開発

```bash
cd island-vacation
npm install
npm run dev        # http://localhost:5173 — WASD/矢印で移動
npm run typecheck  # tsc --noEmit
npm run build      # tsc + vite build
```

## デプロイ(将来)
既存 `deploy.yml` は `particle-ecosystem` 固定＋単一 Pages サイト。ライブにする際は、
両プロジェクトを `GITHUB_PAGES_BASE=/<repo>/<proj>/` でそれぞれビルドし 1 artifact に同梱する
結合ワークフローへ置き換える(`base` は既に env を読むのでコード変更不要)。スライス段階ではスコープ外。
