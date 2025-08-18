import { State } from '@/core/state';
import { drawEngine } from '@/core/draw-engine';
import { controls } from '@/core/controls';
import { gameStateMachine } from '@/game-state-machine';
import { gameState } from './game.state';

class MenuState implements State {
  private isStartSelected = true;

  onUpdate(timeElapsed: number) {
    this.updateControls();
  }

  onDraw() {
    const xCenter = drawEngine.context.canvas.width / 2;
    drawEngine.drawText('Menu', 40, xCenter, 80);
    drawEngine.drawText('Start Game', 24, xCenter, 200, this.isStartSelected ? 'white' : 'gray');
    drawEngine.drawText('Toggle Fullscreen', 24, xCenter, 240, this.isStartSelected ? 'gray' : 'white');
  }

  updateControls() {
    if ((controls.isUp && !controls.previousState.isUp)
      || (controls.isDown && !controls.previousState.isDown)) {
      this.isStartSelected = !this.isStartSelected;
    }

    if (controls.isConfirm && !controls.previousState.isConfirm) {
      if (this.isStartSelected) {
        gameStateMachine.setState(gameState);
      } else {
        this.toggleFullscreen();
      }
    }
  }

  // eslint-disable-next-line class-methods-use-this
  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }
}

export const menuState = new MenuState();
