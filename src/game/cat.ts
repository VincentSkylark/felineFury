import { GameAnimation, Frame } from './animation';
import { controls } from '../core/controls';
import { assetLoader } from '../core/asset-loader';
import { GameObject } from './gameObject';
import { audioEngine } from '@/core/audio-engine';
import { attackSound } from './sounds';

const CHARACTER_SPEED = 2;
const CHARACTER_WIDTH = 12;
const CHARACTER_HEIGHT = 24;

export class BlackCat implements GameObject {
  private animations: Map<string, GameAnimation> = new Map();
  private currentAnimation!: GameAnimation;
  private attackAnimation!: GameAnimation;
  public width = CHARACTER_WIDTH;
  public height = CHARACTER_HEIGHT;
  public isAttacking = false;
  private attackCooldown = 1000; // ms
  private attackTimer = this.attackCooldown;
  private isLoaded = false;

  constructor(
    private context: CanvasRenderingContext2D,
    public x: number,
    public y: number,
  ) {
    this.load();
  }

  private load() {
    const originalImage = assetLoader.getImage('/cat-12-24.png');

    const flippedCanvas = document.createElement('canvas');
    flippedCanvas.width = CHARACTER_WIDTH;
    flippedCanvas.height = CHARACTER_HEIGHT;
    const ctx = flippedCanvas.getContext('2d');

    if (ctx) {
      ctx.translate(CHARACTER_WIDTH, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(originalImage, 0, 0);
    }

    const normalFrames: Frame[] = [
      [originalImage, 200],
      [flippedCanvas, 200],
    ];
    const normalAnimation = new GameAnimation('normal', normalFrames);
    this.animations.set('normal', normalAnimation);
    this.currentAnimation = normalAnimation;

    const attackImage = assetLoader.getImage('/attack-16.png');

    const flippedAttackCanvas = document.createElement('canvas');
    flippedAttackCanvas.width = 16;
    flippedAttackCanvas.height = 16;
    const attackCtx = flippedAttackCanvas.getContext('2d');

    if (attackCtx) {
      attackCtx.translate(16, 0);
      attackCtx.scale(-1, 1);
      attackCtx.drawImage(attackImage, 0, 0);
    }

    const attackFrames: Frame[] = [
      [attackImage, 100],
      [flippedAttackCanvas, 100],
    ];
    this.attackAnimation = new GameAnimation('attack', attackFrames, false);
  }

  public update(deltaTime: number) {
    this.attackTimer += deltaTime;

    if (controls.isAttacking && !this.isAttacking && this.attackTimer >= this.attackCooldown) {
      this.isAttacking = true;
      this.attackAnimation.reset();
      this.attackTimer = 0;
      audioEngine.play(attackSound, 1.5);
    }

    if (this.isAttacking) {
      this.attackAnimation.update(deltaTime);
      if (this.attackAnimation.isFinished) {
        this.isAttacking = false;
      }
    }

    this.handleMovement();
    this.currentAnimation.update(deltaTime);
  }

  private handleMovement() {
    // Use analog input for smoother movement
    this.x += controls.inputDirection.x * CHARACTER_SPEED;
    this.y += controls.inputDirection.y * CHARACTER_SPEED;

    // Collision detection
    if (this.x < 0) {
      this.x = 0;
    }
    if (this.x > this.context.canvas.width - CHARACTER_WIDTH) {
      this.x = this.context.canvas.width - CHARACTER_WIDTH;
    }
    if (this.y < 0) {
      this.y = 0;
    }
    if (this.y > this.context.canvas.height - CHARACTER_HEIGHT) {
      this.y = this.context.canvas.height - CHARACTER_HEIGHT;
    }
  }

  public draw() {
    this.context.drawImage(this.currentAnimation.currentFrameImage, this.x, this.y);
    if (this.isAttacking) {
      const attackX = this.x + (this.width / 2) - (16 / 2);
      const attackY = this.y - 24;
      this.context.drawImage(this.attackAnimation.currentFrameImage, attackX, attackY);
    }
  }

  public getAttackCooldownProgress(): number {
    // Returns a value between 0 and 1, where 1 means ready to attack
    return Math.min(this.attackTimer / this.attackCooldown, 1);
  }

  public isAttackReady(): boolean {
    return this.attackTimer >= this.attackCooldown;
  }
}
