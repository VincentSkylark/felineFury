import { State } from '@/core/state';
import { drawEngine } from '@/core/draw-engine';
import { controls } from '@/core/controls';
import { gameStateMachine } from '@/game-state-machine';
import { gameState } from './game.state';
import { audioEngine } from '@/core/audio-engine';

class MenuState implements State {
  private selectedOption = 0; // 0: Start Game, 1: Music, 2: Fullscreen
  private lastToggleTime = 0;
  private readonly TOGGLE_THROTTLE_MS = 300;

  onUpdate(_timeElapsed: number) {
    this.updateControls();
  }

  onDraw() {
    const xCenter = drawEngine.context.canvas.width / 2;
    drawEngine.drawText('Feline Fury', 36, xCenter, 80);

    // Start Game option
    drawEngine.drawText('Start Game', 24, xCenter, 180, this.selectedOption === 0 ? 'white' : 'gray');

    // Music option - clear area first to prevent shadow text
    const musicText = `Music: ${audioEngine.isMusicEnabled() ? 'ON' : 'OFF'}`;
    const ctx = drawEngine.context;
    ctx.fillStyle = 'black';
    ctx.fillRect(xCenter - 100, 200, 200, 30);
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
      const currentTime = performance.now();
      
      switch (this.selectedOption) {
        case 0: // Start Game
          gameStateMachine.setState(gameState);
          break;
        case 1: // Music Toggle
          if (currentTime - this.lastToggleTime > this.TOGGLE_THROTTLE_MS) {
            audioEngine.setMusicEnabled(!audioEngine.isMusicEnabled());
            this.lastToggleTime = currentTime;
          }
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
