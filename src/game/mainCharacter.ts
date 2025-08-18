import { Animation, Frame } from './animation';
import { controls } from '../core/controls';
import { assetLoader } from '../core/asset-loader';

const CHARACTER_SPEED = 2;
const CHARACTER_WIDTH = 16;
const CHARACTER_HEIGHT = 24;

export class MainCharacter {
  private animations: Map<string, Animation> = new Map();
  private currentAnimation!: Animation;
  private isLoaded = false;

  constructor(
    private context: CanvasRenderingContext2D,
    public x: number,
    public y: number,
  ) {
    this.load();
  }

  private load() {
    const normalFrames: Frame[] = [
      [assetLoader.getImage('/sample-16-24.png'), 100],
      [assetLoader.getImage('/sample-16-24-2.png'), 200],
    ];
    const normalAnimation = new Animation('normal', normalFrames);
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
