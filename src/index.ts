
import { menuState } from './game/states/menu.state';
import { createGameStateMachine, gameStateMachine } from './game-state-machine';
import { controls } from '@/core/controls';
import { assetLoader } from './core/asset-loader';
import { drawEngine } from './core/draw-engine';
import { createGameState } from './game/states/game.state';

async function main() {
  const { context, canvasWidth, canvasHeight } = drawEngine;
  context.fillStyle = 'black';
  context.fillRect(0, 0, canvasWidth, canvasHeight);

  await assetLoader.loadImages([
    '/cat-16-24.png',
    '/robot-16.png',
  ]);

  createGameState();
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
