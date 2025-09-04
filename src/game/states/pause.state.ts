import { State } from '@/core/state';
import { drawEngine } from '@/core/draw-engine';
import { controls } from '@/core/controls';
import { gameStateMachine } from '@/game-state-machine';

class PauseState implements State {
    private previousState: any = null;

    onEnter(previousState?: any) {
        this.previousState = previousState;
    }

    onUpdate() {
        this.updateControls();
    }

    onDraw() {
        if (this.previousState && typeof this.previousState.drawBackground === 'function') {
            this.previousState.drawBackground();
        }

        this.drawPauseOverlay();
    }

    private drawPauseOverlay() {
        const canvasWidth = drawEngine.context.canvas.width;
        const canvasHeight = drawEngine.context.canvas.height;
        const xCenter = canvasWidth / 2;
        const yCenter = canvasHeight / 2;

        // Draw semi-transparent overlay
        drawEngine.context.fillStyle = 'rgba(0, 0, 0, 0.7)';
        drawEngine.context.fillRect(0, 0, canvasWidth, canvasHeight);

        // Draw "Pause" text in center
        drawEngine.drawText('Pause', 48, xCenter, yCenter, 'white');
        drawEngine.drawText('Press ESC to resume', 18, xCenter, yCenter + 60, 'white');
    }

    private updateControls() {
        if (controls.isEscape && !controls.previousState.isEscape) {
            // Resume the previous state without calling onEnter (preserves game state)
            if (this.previousState) {
                gameStateMachine.resumeState(this.previousState);
            }
        }
    }

    onExit() {
    }
}

export const pauseState = new PauseState();
