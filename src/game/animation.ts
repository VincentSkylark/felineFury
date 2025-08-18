export type Frame = [HTMLImageElement, number]; // [image, duration in milliseconds]

export class Animation {
  private frameIndex = 0;
  private timer = 0;

  constructor(
    public name: string,
    private frames: Frame[],
  ) {}

  public update(deltaTime: number): void {
    if (this.frames.length <= 1) {
      return;
    }

    this.timer += deltaTime;
    const [, frameDuration] = this.frames[this.frameIndex];

    if (this.timer >= frameDuration) {
      this.timer -= frameDuration;
      this.frameIndex = (this.frameIndex + 1) % this.frames.length;
    }
  }

  public get currentFrameImage(): HTMLImageElement {
    return this.frames[this.frameIndex][0];
  }

  public reset(): void {
    this.frameIndex = 0;
    this.timer = 0;
  }
}
