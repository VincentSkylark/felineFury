import { State } from '@/core/state';
import { drawEngine } from '@/core/draw-engine';
import { controls } from '@/core/controls';
import { gameStateMachine } from '@/game-state-machine';
// import { menuState } from '@/game/states/menu.state';
import { Background } from '@/game/background';
import { menuState } from './menu.state';
import { MainCharacter } from '../cat';

class GameState implements State {
  private background: Background;
  private mainCharacter: MainCharacter;

  constructor() {
    this.background = new Background(drawEngine);
    this.mainCharacter = new MainCharacter(drawEngine.context, 120, 300);
  }

  onUpdate(timeElapsed: number) {
    this.background.update(timeElapsed);
    this.mainCharacter.update(timeElapsed);

    if (controls.isEscape) {
      gameStateMachine.setState(menuState);
    }
  }

  onDraw() {
    drawEngine.context.clearRect(0, 0, drawEngine.canvasWidth, drawEngine.canvasHeight);
    this.background.draw();
    this.mainCharacter.draw();
  }
}

export let gameState: GameState;

export function createGameState() {
  gameState = new GameState();
}
