import { State } from '@/core/state';
import { drawEngine } from '@/core/draw-engine';
import { controls } from '@/core/controls';
import { gameStateMachine } from '@/game-state-machine';
import { gameState } from './game.state';
import { audioEngine } from '@/core/audio-engine';
import { finalMusic } from '../sounds';

class OverState implements State {
  private isVictory = false;
  private enterTime = 0;
  private readonly INPUT_DELAY = 2000;

  onEnter(isVictory?: boolean) {
    this.isVictory = isVictory || false;
    this.enterTime = performance.now();
    audioEngine.stopAllLoops();
    if (this.isVictory) {
      audioEngine.play(finalMusic, 1.2);
    }
  }

  onUpdate() {
    this.updateControls();
  }

  onDraw() {
    const xCenter = drawEngine.context.canvas.width / 2;
    const finalScore = gameState.getScore();
    const scoreText = finalScore.toString().padStart(8, '0');

    // Draw black background for victory
    if (this.isVictory) {
      drawEngine.context.fillStyle = 'black';
      drawEngine.context.fillRect(0, 0, drawEngine.context.canvas.width, drawEngine.context.canvas.height);
    }

    const title = this.isVictory ? 'Victory!' : 'Game Over';

    drawEngine.drawText(title, 30, xCenter, 80);
    drawEngine.drawText(`Final Score: ${scoreText}`, 18, xCenter, 140, 'white');
    drawEngine.drawText('Start Over', 18, xCenter, 200, 'white');
  }

  updateControls() {
    // Check if enough time has passed since entering this state
    const currentTime = performance.now();
    if (currentTime - this.enterTime < this.INPUT_DELAY) {
      return; // Ignore input during delay period
    }

    if ((controls.isConfirm && !controls.previousState.isConfirm) ||
      (controls.isAttacking && !controls.previousState.isAttacking)) {
      gameStateMachine.setState(gameState);
    }
  }

  onExit() {
    audioEngine.stopAllLoops();
  }
}

export const overState = new OverState();
