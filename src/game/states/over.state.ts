import { State } from '@/core/state';
import { drawEngine } from '@/core/draw-engine';
import { controls } from '@/core/controls';
import { gameStateMachine } from '@/game-state-machine';
import { gameState } from './game.state';

class OverState implements State {
  onUpdate() {
    this.updateControls();
  }

  onDraw() {
    const xCenter = drawEngine.context.canvas.width / 2;
    drawEngine.drawText('Game Over', 40, xCenter, 80);
    drawEngine.drawText('Start Over', 24, xCenter, 200, 'white');
  }

  updateControls() {
    if (controls.isConfirm && !controls.previousState.isConfirm) {
      gameStateMachine.setState(gameState);
    }
  }
}

export const overState = new OverState();
