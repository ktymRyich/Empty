# Particle Ecosystem — 宇宙パーティクル人工生態系シミュレーター

## コンセプト

Three.js + WebGL を用いた宇宙空間を舞台にした人工生態系シミュレーター。
ネオングローする7種以上のパーティクル種が捕食・群れ・繁殖を繰り返し、星雲・ブラックホール・小惑星帯といった環境要素と相互作用する。マウスとUIパネルでリアルタイムに干渉可能。

---

## 技術スタック

| 役割 | ライブラリ |
|---|---|
| ビルドツール | Vite |
| 3Dレンダリング | Three.js |
| シェーダー | カスタム GLSL (vertex / fragment) |
| UIコントロール | lil-gui |
| 言語 | TypeScript |

---

## 生態系設計

### 種の一覧（8種）

| # | 種名 | 役割 | 行動 | カラー |
|---|---|---|---|---|
| 1 | **Plankton** | 生産者（エネルギー源） | 星雲エリアで光合成的に増殖、ゆっくり漂う | 黄緑〜エメラルドグリーン |
| 2 | **Crystallite** | 草食 | Planktonを追跡・捕食 | シアン〜水色 |
| 3 | **Swarmer** | 群れ草食 | Boidsフロッキング、Planktonを集団で捕食 | マゼンタ〜紫 |
| 4 | **Hunter** | 小型肉食 | CrystalliteとSwarmerを単独追跡 | オレンジ〜琥珀 |
| 5 | **Alpha** | 大型頂点捕食者 | Hunter・Swarmerを捕食、縄張り行動 | 深紅〜赤紫 |
| 6 | **Ghost** | 透明寄生種 | 他種に近づきエネルギーを吸収、回避行動優先 | 白〜淡青（高透明度） |
| 7 | **Decomposer** | 分解者 | 死亡個体に集まりエネルギー回収・Planktonに変換 | 暗紫〜マゼンタ |
| 8 | **Hybrid** | 雑食（オプション） | エネルギー残量に応じて草食↔肉食を切り替え | グラデーション変化 |

### 行動ルール

#### Boidsフロッキング（Swarmer / Hunter群れに適用）
- **分離 (Separation)**: 近すぎる個体から離れる
- **整列 (Alignment)**: 近隣個体の平均速度に合わせる
- **凝集 (Cohesion)**: 近隣重心に引き寄せられる

#### 捕食システム
- 各個体はエネルギー (HP) を持つ
- 捕食射程内に餌種が入ると追跡 → 接触で捕食、HPを獲得
- HPが0になると死亡（Decomposer対象になる）

#### 繁殖・増殖
- HPが閾値を超えると確率的に分裂・産卵
- Planktonは星雲エリア内で時間経過により自然増殖

#### 進化フック（拡張可能構造）
- 現在は固定パラメータで動作
- `SpeciesConfig` オブジェクトに速度・捕食射程・フロッキング重みなどを集約
- 繁殖時に `mutationRate` パラメータを渡すだけで各値に微小変異を加えられる設計
- UIスライダーで `mutationRate: 0.0 → 0.1` に変更するだけで進化モードON

---

## 環境要素

### 星雲・ガス雲 (Nebula)
- シェーダーで描画するボリュームフォグ的なエリア
- エリア内の Plankton の増殖速度が上昇
- 色: ディープブルー〜紫グラデーション、半透明

### ブラックホール・重力井戸 (BlackHole)
- 1〜3個配置、強力な引力を発生
- 距離に応じた引力（逆二乗則）で全パーティクルに作用
- 中心に吸い込まれたパーティクルは消滅
- ビジュアル: レンズ歪み風のグロー + 螺旋状オービットパーティクル

### 障害物・小惑星帯 (Asteroid Belt)
- 静的なコライダー群（球体）でパーティクルが回避
- ステアリング回避行動で自然に迂回
- ビジュアル: 暗い岩肌テクスチャ or 暗灰色のインスタンスドメッシュ

### 背景星空
- Three.js Points で数千の静的背景星
- 遠近感のため奥行き異なる2〜3レイヤー

---

## ビジュアル設計

### パーティクルシェーダー
- **頂点シェーダー**: サイズをカメラ距離に応じてスケール、HP比率でサイズ変化
- **フラグメントシェーダー**: 
  - 中心から外に向かうソフトグロー（ラジアルグラデーション）
  - 種ごとのベースカラー + エネルギー状態で輝度変化（HP高いほど明るい）
  - `THREE.AdditiveBlending` で重なり部分が加算発光
- 各種ごとにトレイルエフェクト（残像）: 直前フレームのバッファをブレンド

### ポストプロセッシング
- **Bloom**: Three.js の `UnrealBloomPass` でネオングローを強調
- **色収差 (Chromatic Aberration)**: 画面端にわずかなRGBずれ（任意）

### カラーパレット設計

```
背景:          #000010 〜 #05000f（ほぼ黒の深宇宙）
星雲:          #1a0033 〜 #003366（深紫〜深青）
Plankton:      #00ff88 〜 #88ff00（ネオングリーン）
Crystallite:   #00ffff 〜 #0088ff（シアン）
Swarmer:       #ff00ff 〜 #8800ff（マゼンタ〜紫）
Hunter:        #ff8800 〜 #ffdd00（オレンジ〜琥珀）
Alpha:         #ff0044 〜 #cc00ff（深紅〜赤紫）
Ghost:         #ffffff 〜 #aaddff（白、低opacity）
Decomposer:    #8800aa 〜 #ff00aa（暗紫〜マゼンタ）
BlackHole:     #000000（中心）〜 #4400ff（外縁グロー）
```

---

## インタラクション設計

### マウス操作

| 操作 | 効果 |
|---|---|
| 左クリック＆ホールド | カーソル位置に引力フィールド生成（パーティクルが引き寄せられる） |
| 右クリック＆ホールド | カーソル位置に斥力フィールド生成（パーティクルが弾き飛ばされる） |
| マウスホイール | ズームイン / アウト |
| 左ドラッグ（背景） | カメラ回転（OrbitControls） |

### lil-gui コントロールパネル

```
[Simulation]
  Speed multiplier        0.1x — 5.0x
  Reset                   [Button]

[Species Population Limits]
  Max Plankton            100 — 2000
  Max Crystallite         50 — 500
  Max Swarmer             50 — 500
  Max Hunter              10 — 200
  Max Alpha               5 — 50
  Max Ghost               10 — 100
  Max Decomposer          10 — 200

[Flocking (Swarmer/Hunter)]
  Separation weight       0.0 — 3.0
  Alignment weight        0.0 — 3.0
  Cohesion weight         0.0 — 3.0
  Perception radius       10 — 200

[Environment]
  BlackHole gravity       0.0 — 5.0
  Nebula boost factor     1.0 — 5.0

[Evolution (拡張フック)]
  Mutation rate           0.0 — 0.1
  Enable natural selection [Toggle]

[Visuals]
  Bloom intensity         0.0 — 3.0
  Particle size scale     0.5 — 3.0
  Trail length            0 — 20 frames
```

---

## パフォーマンス設計

### 目標
- 数千〜**最大10,000個**のパーティクルで60fps維持

### 手法

| 課題 | 対策 |
|---|---|
| 近傍探索O(n²) | **SpatialHashGrid**: ワールドをセル分割、各フレームで再構築。O(n)近傍取得 |
| ドローコール最小化 | 種ごとに `THREE.Points` (1ドローコール/種) またはInstancedMesh |
| CPU負荷分散 | 全パーティクルを同一フレームで更新せず、偶数/奇数フレームで交互更新（任意） |
| メモリ | 死亡個体はプールに戻してリサイクル（Object Pooling） |

---

## ディレクトリ構成

```
particle-ecosystem/
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
├── PLAN.md
└── src/
    ├── main.ts                  # エントリポイント
    ├── core/
    │   ├── Renderer.ts          # WebGLRenderer + PostProcessing セットアップ
    │   ├── SceneManager.ts      # Scene, Camera, OrbitControls
    │   └── Loop.ts              # requestAnimationFrame ループ管理
    ├── entities/
    │   ├── SpeciesConfig.ts     # 全種のパラメータ定義（進化フックの起点）
    │   ├── Particle.ts          # 個体データ構造（位置・速度・HP・種別）
    │   └── ParticleSystem.ts    # 全個体の更新・描画管理
    ├── behaviors/
    │   ├── Flocking.ts          # Boids アルゴリズム
    │   ├── Predation.ts         # 捕食・逃避ロジック
    │   ├── Reproduction.ts      # 繁殖・死亡処理
    │   └── Evolution.ts         # 変異フック（mutationRate に基づく）
    ├── environment/
    │   ├── Nebula.ts            # ガス雲エリア（増殖ブーストゾーン）
    │   ├── BlackHole.ts         # 重力井戸
    │   └── AsteroidBelt.ts      # 静的障害物群
    ├── shaders/
    │   ├── particle.vert        # パーティクル頂点シェーダー
    │   ├── particle.frag        # グロー・カラーフラグメントシェーダー
    │   ├── nebula.vert
    │   └── nebula.frag
    ├── ui/
    │   └── Controls.ts          # lil-gui パネル定義
    └── utils/
        ├── SpatialHashGrid.ts   # 近傍探索の空間ハッシュグリッド
        └── ObjectPool.ts        # パーティクルオブジェクトプール
```

---

## 実装フェーズ（Opus への指示用）

### Phase 1 — 基盤構築
- Vite + Three.js + TypeScript プロジェクト初期化
- Renderer / SceneManager / Loop の実装
- 背景星空の描画

### Phase 2 — パーティクルシステム基盤
- `Particle` データ構造と `ParticleSystem`
- `SpeciesConfig` で全8種のパラメータ定義
- カスタムGLSLシェーダー（グロー効果）
- 基本的な移動（ランダムウォーク）の確認

### Phase 3 — 行動ロジック
- `SpatialHashGrid` による近傍探索
- `Flocking` (Boids) 実装
- `Predation` 捕食・追跡ロジック
- `Reproduction` 繁殖・死亡・オブジェクトプール

### Phase 4 — 環境要素
- `Nebula` (シェーダー描画 + 増殖ブースト)
- `BlackHole` (引力計算 + ビジュアル)
- `AsteroidBelt` (静的コライダー + 回避ステアリング)

### Phase 5 — インタラクション & UI
- OrbitControls (カメラ操作)
- マウス引力・斥力フィールド
- lil-gui パネル（全パラメータ接続）

### Phase 6 — ポストプロセッシング & 仕上げ
- UnrealBloomPass によるネオングロー
- トレイルエフェクト
- パフォーマンスチューニング
- `Evolution.ts` の変異フック最終確認

---

## 拡張ロードマップ（将来）

- **本格的な自然選択**: 世代ごとの形質記録、系統樹表示
- **音響フィードバック**: Web Audio API で個体数に応じたアンビエントサウンド
- **シナリオモード**: 「大絶滅イベント」「新種の侵入」などのトリガー
- **録画機能**: Canvas を MediaRecorder でMP4出力
- **3D空間への拡張**: 現在は2D平面想定、Z軸を加えた完全3D生態系
