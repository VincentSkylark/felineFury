
import { menuState } from './game/states/menu.state';
import { createGameStateMachine, gameStateMachine } from './game-state-machine';
import { controls } from '@/core/controls';
import { assetLoader } from './core/asset-loader';
import { drawEngine } from './core/draw-engine';
import { audioEngine } from './core/audio-engine';

async function main() {
  const { context, canvasWidth, canvasHeight } = drawEngine;
  context.fillStyle = 'black';
  context.fillRect(0, 0, canvasWidth, canvasHeight);

  let audioInitialized = false;
  const initAudio = () => {
    if (audioInitialized) {
      return;
    }
    audioEngine.init();
    audioInitialized = true;
  };

  document.body.addEventListener('keydown', initAudio);
  document.body.addEventListener('touchstart', initAudio);

  await assetLoader.loadImages([
    '/cat-12-24.png',
    '/attack-16.png',
    '/robot-16.png',
    '/flippers-16.png',
    '/cucumber-16.png',
    '/cabinet-16.png',
    '/bookshelf-16.png',
    '/boss-base.png',
    '/boss-anger.png',
    '/boss-hurt.png',
    '/boss-defeat.png',
  ]);

  createGameStateMachine(menuState);

  let previousTime = 0;

  (function draw(currentTime: number) {
    const delta = currentTime - previousTime;
    previousTime = currentTime;

    controls.queryController();
    // Although the game is currently set at 60fps, the state machine accepts a time passed to onUpdate
    // If you'd like to unlock the framerate, you can instead use an interval passed to onUpdate to
    // adjust your physics so they are consistent across all frame rates.
    // If you do not limit your fps or account for the interval your game will be far too fast or far too
    // slow for anyone with a different refresh rate than you.
    gameStateMachine.update(delta);
    gameStateMachine.getState().onDraw();
    requestAnimationFrame(draw);
  })(0);
}

main();
