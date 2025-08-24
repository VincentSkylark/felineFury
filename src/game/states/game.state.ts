import { State } from '@/core/state';
import { drawEngine } from '@/core/draw-engine';
import { BlackCat } from '../cat';
import { Background } from '../background';
import { Robot } from '../robot';
import { Flippers } from '../flippers';
import { Cucumber } from '../cucumber';
import { Boss } from '../boss';
import { EnemyGenerationFactory } from '../enemy-generation.factory';
import { controls } from '@/core/controls';

class GameState implements State {
  private character!: BlackCat;
  private background!: Background;
  private enemyFactory!: EnemyGenerationFactory;
  private boss: Boss | null = null;
  private gameTime = 0;
  private bossFightStarted = false;
  private bossFightPending = false;

  onEnter() {
    this.character = new BlackCat(drawEngine.context, 120, 300);
    this.background = new Background(drawEngine);
    this.enemyFactory = new EnemyGenerationFactory();
    this.gameTime = 0;
    this.boss = null;
    this.bossFightStarted = false;
    this.bossFightPending = false;
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
  
  private startBossFight() {
    this.enemyFactory.stop();
    this.bossFightPending = true;
  }

  onUpdate(timeElapsed: number) {
    if (!this.bossFightStarted && this.gameTime > 10000) {
        this.bossFightStarted = true;
        this.startBossFight();
    }
    this.gameTime += timeElapsed;

    if (this.boss && controls.isDamageBoss) {
        this.boss.takeDamage();
    }

    this.background.update(timeElapsed);
    this.character.update(timeElapsed);
    this.enemyFactory.update(timeElapsed);

    if (this.bossFightPending && this.enemyFactory.enemies.length === 0) {
        this.boss = new Boss(drawEngine.context, this.character);
        this.bossFightPending = false;
    }

    if(this.boss) {
        this.boss.update(timeElapsed);
    }
  }

  onDraw() {
    this.background.draw();
    this.character.draw();
    this.enemyFactory.draw();
    if(this.boss) {
        this.boss.draw();
    }
  }

  onExit() {
    // Clean up resources if needed
  }
}

export const gameState = new GameState();
