import { State } from '@/core/state';
import { drawEngine } from '@/core/draw-engine';
import { BlackCat } from '../cat';
import { Background } from '../background';
import { Robot } from '../robot';
import { Flippers } from '../flippers';
import { Cucumber } from '../cucumber';
import { Boss } from '../boss';
import { EnemyGenerationFactory } from '../enemy-generation.factory';
import { audioEngine } from '@/core/audio-engine';
import { backgroundMusic, bossBattleMusic, } from '../sounds';
import { gameStateMachine } from '@/game-state-machine';
import { overState } from './over.state';
import { controls } from '@/core/controls';
import { pauseState } from './pause.state';

export interface GameConfig {
  // Reserved for future game configuration options
}

class GameState implements State {
  private character!: BlackCat;
  private background!: Background;
  private enemyFactory!: EnemyGenerationFactory;
  private boss: Boss | null = null;
  private gameTime = 0;
  private bossFightStarted = false;
  private bossFightPending = false;
  private bossDefeated = false;
  private score = 0;

  onEnter() {
    audioEngine.stopAllLoops();
    audioEngine.playLoop(backgroundMusic, [1, 0.3, 0.6, 0.1]);
    this.character = new BlackCat(drawEngine.context, 120, 300);
    this.background = new Background(drawEngine);
    this.enemyFactory = new EnemyGenerationFactory();
    this.enemyFactory.setScoreCallback((score) => this.addScore(score));
    this.gameTime = 0;
    this.boss = null;
    this.bossFightStarted = false;
    this.bossFightPending = false;
    this.bossDefeated = false;
    this.score = 0;
    this.enemyFactory.registerEnemyType(() => {
      const initialX = Math.random() * drawEngine.canvasWidth;
      const verticalSpeed = 0.08 + Math.random() * 0.04;
      const zigzagAmplitude = 40 + Math.random() * 30; // 40–70 px
      const zigzagFrequency = 0.0015 + Math.random() * 0.0005; // 0.0015–0.002
      const path = (time: number) => ({
        x: initialX + Math.sin(time * zigzagFrequency) * zigzagAmplitude,
        y: time * verticalSpeed,
      });
      return new Robot(drawEngine.context, path, this.character);
    }, 1000, 500);

    this.enemyFactory.registerEnemyType(() => {
      const x = Math.random() * drawEngine.canvasWidth;
      const speed = 0.05 + Math.random() * 0.1;
      const path = (time: number) => ({
        x: x,
        y: time * speed,
      });
      return new Cucumber(drawEngine.context, path, this.character);
    }, 1000, 100);
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
    }, 2000, 800);
  }

  private startBossFight() {
    audioEngine.stopAllLoops();
    this.enemyFactory.stop();
    this.enemyFactory.clear();
    this.bossFightPending = true;

    // Register boss fight specific enemies
    this.registerBossFightEnemies();

    setTimeout(() => {
      audioEngine.playLoop(bossBattleMusic, [1, 0.3, 0.6, 0.1]);
      this.enemyFactory.start();
    }, 1000);
  }

  private registerBossFightEnemies() {
    // Example: Add faster, more aggressive enemies during boss fight
    this.enemyFactory.registerEnemyType(() => {
      const x = Math.random() * drawEngine.canvasWidth;
      const speed = 0.08 + Math.random() * 0.12; // Faster than normal
      const path = (time: number) => ({
        x: x,
        y: time * speed,
      });
      return new Cucumber(drawEngine.context, path, this.character);
    }, 800, 750);

  }

  onUpdate(timeElapsed: number) {
    // Handle pause toggle
    if (controls.isEscape && !controls.previousState.isEscape) {
      gameStateMachine.setState(pauseState, this);
      return;
    }

    if (!this.bossFightStarted && this.gameTime > 10000) {
      this.bossFightStarted = true;
      this.startBossFight();
    }
    this.gameTime += timeElapsed;

    if (this.boss && this.boss.checkAttackCollision()) {
      this.boss.takeDamage();
    }

    this.background.update(timeElapsed);
    this.character.update(timeElapsed);

    // Only update enemy factory if boss is not defeated
    if (!this.bossDefeated) {
      this.enemyFactory.update(timeElapsed);
    }

    if (this.bossFightPending && this.enemyFactory.enemies.length === 0) {
      this.boss = new Boss(drawEngine.context, this.character, () => this.triggerGameOver());
      this.bossFightPending = false;
    }

    if (this.boss) {
      this.boss.update(timeElapsed);
      this.checkReflectedCucumberBossCollision();

      // Check if boss just got defeated (health reached 0)
      if (!this.bossDefeated && this.boss.isDefeated()) {
        this.bossDefeated = true;
        // Stop enemy spawning immediately when boss is defeated
        this.enemyFactory.stop();
        this.enemyFactory.clear();
      }

      this.checkBossVictory();
    }
  }

  onDraw() {
    this.background.draw();
    this.character.draw();
    this.enemyFactory.draw();
    if (this.boss) {
      this.boss.draw();
    }
    this.drawUI();
  }

  drawBackground() {
    // Draw the current game state without updating - for pause overlay
    this.background.draw();
    this.character.draw();
    this.enemyFactory.draw();
    if (this.boss) {
      this.boss.draw();
    }
    this.drawUI();
  }

  private drawUI() {
    const scoreText = this.score.toString().padStart(8, '0');
    const canvasWidth = drawEngine.context.canvas.width;
    const canvasHeight = drawEngine.context.canvas.height;

    // Draw score in top right
    drawEngine.drawText(scoreText, 16, canvasWidth - 10, 25, 'white', 'right');

    // Draw attack cooldown progress bar in bottom left
    const progressBarWidth = 120;
    const progressBarHeight = 8;
    const progressBarX = 10;
    const progressBarY = canvasHeight - 20;

    const cooldownProgress = this.character.getAttackCooldownProgress();
    const isReady = this.character.isAttackReady();

    drawEngine.context.fillStyle = 'rgba(0, 0, 0, 0.5)';
    drawEngine.context.fillRect(progressBarX - 2, progressBarY - 2, progressBarWidth + 4, progressBarHeight + 4);

    drawEngine.context.strokeStyle = 'white';
    drawEngine.context.lineWidth = 1;
    drawEngine.context.strokeRect(progressBarX, progressBarY, progressBarWidth, progressBarHeight);

    const fillWidth = progressBarWidth * cooldownProgress;
    drawEngine.context.fillStyle = isReady ? '#00ff00' : '#ffff00';
    drawEngine.context.fillRect(progressBarX, progressBarY, fillWidth, progressBarHeight);

    drawEngine.drawText('Attack', 12, progressBarX, progressBarY - 5, 'white', 'left');
  }

  onExit(): void {
    audioEngine.stopAllLoops();
  }

  getScore(): number {
    return this.score;
  }

  private addScore(points: number): void {
    this.score += points;
  }

  private triggerGameOver(): void {
    gameStateMachine.setState(overState, false); // Pass false for defeat
  }

  private checkReflectedCucumberBossCollision(): void {
    if (!this.boss) return;

    const reflectedCucumbers = this.enemyFactory.enemies.filter(
      e => e instanceof Cucumber && (e as Cucumber).isReflected && !e.isDead
    );

    for (const cucumber of reflectedCucumbers) {
      if (
        cucumber.x < this.boss.x + this.boss.width &&
        cucumber.x + cucumber.width > this.boss.x &&
        cucumber.y < this.boss.y + this.boss.height &&
        cucumber.y + cucumber.height > this.boss.y
      ) {
        cucumber.isDead = true;
        this.boss.takeDamage();
        break; // Only one cucumber can hit per frame
      }
    }
  }

  private checkBossVictory(): void {
    if (!this.boss) return;

    // Check if boss is defeated and has moved off screen
    if (this.bossDefeated && this.boss.y > drawEngine.context.canvas.height) {
      // Award victory bonus points
      this.addScore(10000);

      // Clear boss reference
      this.boss = null;

      // Transition to game over (victory) state
      gameStateMachine.setState(overState, true); // Pass true for victory
    }
  }
}

export const gameState = new GameState();
