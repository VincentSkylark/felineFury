import { State } from '@/core/state';
import { drawEngine } from '@/core/draw-engine';
import { controls } from '@/core/controls';
import { gameStateMachine } from '@/game-state-machine';
import { gameState, GameConfig } from './game.state';

class MenuState implements State {
  private selectedOption = 0; // 0: Start Game, 1: Music, 2: Fullscreen
  private musicEnabled = true;

  onUpdate(timeElapsed: number) {
    this.updateControls();
  }

  onDraw() {
    const xCenter = drawEngine.context.canvas.width / 2;
    drawEngine.drawText('Feline Fury', 36, xCenter, 80);

    // Start Game option
    drawEngine.drawText('Start Game', 24, xCenter, 180, this.selectedOption === 0 ? 'white' : 'gray');

    // Music option - clear area first to prevent shadow text
    const musicText = `Music: ${this.musicEnabled ? 'ON' : 'OFF'}`;
    const ctx = drawEngine.context;
    ctx.fillStyle = 'black';
    ctx.fillRect(xCenter - 100, 200, 200, 30); // Clear the music text area
    drawEngine.drawText(musicText, 24, xCenter, 220, this.selectedOption === 1 ? 'white' : 'gray');

    // Fullscreen option
    drawEngine.drawText('Toggle Fullscreen', 24, xCenter, 260, this.selectedOption === 2 ? 'white' : 'gray');
  }

  updateControls() {
    if (controls.isUp && !controls.previousState.isUp) {
      this.selectedOption = (this.selectedOption - 1 + 3) % 3;
    }

    if (controls.isDown && !controls.previousState.isDown) {
      this.selectedOption = (this.selectedOption + 1) % 3;
    }

    if ((controls.isConfirm && !controls.previousState.isConfirm) ||
      (controls.isAttacking && !controls.previousState.isAttacking)) {
      switch (this.selectedOption) {
        case 0: // Start Game
          gameState.onEnter({ music: this.musicEnabled });
          gameStateMachine.setState(gameState);
          break;
        case 1: // Music Toggle
          this.musicEnabled = !this.musicEnabled;
          break;
        case 2: // Fullscreen
          this.toggleFullscreen();
          break;
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
