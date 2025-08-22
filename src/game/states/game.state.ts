import { State } from '@/core/state';
import { drawEngine } from '@/core/draw-engine';
import { BlackCat } from '../cat';
import { Background } from '../background';
import { Robot } from '../robot';
import { Flippers } from '../flippers';
import { Cucumber } from '../cucumber';
import { EnemyGenerationFactory } from '../enemy-generation.factory';

class GameState implements State {
  private character!: BlackCat;
  private background!: Background;
  private enemyFactory!: EnemyGenerationFactory;

  onEnter() {
    this.character = new BlackCat(drawEngine.context, 120, 300);
    this.background = new Background(drawEngine);
    this.enemyFactory = new EnemyGenerationFactory();
    this.enemyFactory.registerEnemyType(() => {
        const x = Math.random() * drawEngine.canvasWidth;
        const speed = 0.05 + Math.random() * 0.1;
        const path = (time: number) => ({
            x: x,
            y: time * speed,
        });
        return new Robot(drawEngine.context, path, this.character);
    }, 1000);

    this.enemyFactory.registerEnemyType(() => {
      const x = Math.random() * drawEngine.canvasWidth;
      const speed = 0.05 + Math.random() * 0.1;
      const path = (time: number) => ({
          x: x,
          y: time * speed,
      });
      return new Cucumber(drawEngine.context, path, this.character);
  }, 1000);

    this.enemyFactory.registerEnemyType(() => {
      const initialX = Math.random() * drawEngine.canvasWidth;
      const vx = (Math.random() - 0.5) * 0.05; // horizontal velocity
      const vy = 0.05 + Math.random() * 0.05; // vertical velocity
      const amplitude = 40 * Math.random() + 20;
      const frequency = (Math.random() * 0.002) + 0.001;
      const phase = Math.random() * Math.PI * 2;

      const path = (time: number) => ({
        x: initialX + vx * time,
        y: vy * time - 16 + amplitude * Math.sin(frequency * time + phase), // Start at y = -16
      });
      return new Flippers(drawEngine.context, path, this.character);
    }, 2000);
  }

  onUpdate(timeElapsed: number) {
    this.background.update(timeElapsed);
    this.character.update(timeElapsed);
    this.enemyFactory.update(timeElapsed);
  }

  onDraw() {
    this.background.draw();
    this.character.draw();
    this.enemyFactory.draw();
  }

  onExit() {
    // Clean up resources if needed
  }
}

export const gameState = new GameState();
