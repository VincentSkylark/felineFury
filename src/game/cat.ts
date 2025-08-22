import { GameAnimation, Frame } from './animation';
import { controls } from '../core/controls';
import { assetLoader } from '../core/asset-loader';
import { GameObject } from './gameObject';

const CHARACTER_SPEED = 2;
const CHARACTER_WIDTH = 12;
const CHARACTER_HEIGHT = 24;

export class BlackCat implements GameObject {
  private animations: Map<string, GameAnimation> = new Map();
  private currentAnimation!: GameAnimation;
  public width = CHARACTER_WIDTH;
  public height = CHARACTER_HEIGHT;
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
  }

  public update(deltaTime: number) {
    this.handleMovement();
    this.currentAnimation.update(deltaTime);
  }

  private handleMovement() {
    if (controls.isLeft) {
      this.x -= CHARACTER_SPEED;
    }
    if (controls.isRight) {
      this.x += CHARACTER_SPEED;
    }
    if (controls.isUp) {
      this.y -= CHARACTER_SPEED;
    }
    if (controls.isDown) {
      this.y += CHARACTER_SPEED;
    }

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
  }
}
