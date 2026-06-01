import { GameConfig } from './config/GameConfig.ts';
import { createScene } from './core/SceneManager.ts';
import { createRenderer } from './core/Renderer.ts';
import { Loop } from './core/Loop.ts';
import { createInput } from './core/Input.ts';
import { FollowCamera } from './camera/FollowCamera.ts';
import { World } from './world/World.ts';
import { SpringGrassland } from './world/regions/SpringGrassland.ts';
import { Avatar } from './entities/Avatar.ts';
import { Player } from './entities/Player.ts';
import { CharacterController } from './controllers/CharacterController.ts';
import { AnimationController } from './animation/AnimationController.ts';
import { AssetManager } from './assets/AssetManager.ts';
import { mountHud } from './ui/Hud.ts';

/**
 * Composition root: wires the engine, world, player and loop. Everything below
 * depends only on the abstractions, so regions / transports / generated assets
 * grow in without reshaping this file.
 */
async function main(): Promise<void> {
  const container = document.getElementById('app');
  if (!container) throw new Error('#app container not found');

  const { scene } = createScene();
  const { renderer, resize: resizeRenderer } = createRenderer(container);
  const camera = new FollowCamera(container.clientWidth / container.clientHeight);

  // --- World: one island, currently a single region ---
  const world = new World({ scene });
  world.registerRegion(new SpringGrassland());
  await world.activate('spring-grassland');

  // --- Avatar: placeholder, or generated glTF when the flag + asset exist ---
  let avatar: Avatar;
  if (GameConfig.useGeneratedAvatar) {
    const assets = new AssetManager();
    avatar = Avatar.fromGLTF(await assets.load('avatar'));
  } else {
    avatar = Avatar.createPlaceholder();
  }

  const player = new Player(avatar);
  scene.add(player.object);

  // Spawn on the ground at the origin and seat the camera behind instantly.
  const spawn = world.sampleGround(0, 0);
  player.position.set(0, spawn ? spawn.y : 0, 0);
  player.grounded = true;
  camera.snapTo(player.position);

  const controller = new CharacterController();
  const anim = new AnimationController(avatar.root, avatar.clips);
  const input = createInput();
  const hud = mountHud();

  const onResize = (): void => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    resizeRenderer(w, h);
    camera.resize(w / h);
  };
  window.addEventListener('resize', onResize);

  const loop = new Loop(
    {
      update: (fixedDt) => {
        input.pollGamepad();
        controller.update(fixedDt, input, camera, world, player);
        world.update(fixedDt);
      },
      render: (_alpha, frameDt) => {
        camera.update(frameDt, player.position);
        avatar.update(frameDt, player.speedXZ);
        anim.updateLocomotion(player.speedXZ);
        anim.update(frameDt);
        renderer.render(scene, camera.camera);

        const region = world.regionAt(player.position.x, player.position.z);
        hud.update({
          position: player.position,
          region: region ? region.id : '—',
          fps: 1 / Math.max(frameDt, 1e-4),
        });
      },
    },
    GameConfig.fixedDt,
  );

  loop.start();
}

void main();
