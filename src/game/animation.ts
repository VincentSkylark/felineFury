export type Frame = [CanvasImageSource, number]; // [image, duration in milliseconds]

export class GameAnimation {
  private frameIndex = 0;
  private timer = 0;
  public isFinished = false;

  constructor(
    public name: string,
    private frames: Frame[],
    private loops = true
  ) {}

  public update(deltaTime: number): void {
    if (this.isFinished || this.frames.length <= 1) {
      return;
    }

    this.timer += deltaTime;
    const [, frameDuration] = this.frames[this.frameIndex];

    if (this.timer >= frameDuration) {
      this.timer -= frameDuration;
      if (this.frameIndex === this.frames.length - 1) {
        if (this.loops) {
          this.frameIndex = 0;
        } else {
          this.isFinished = true;
        }
      } else {
        this.frameIndex++;
      }
    }
  }

  public get currentFrameImage(): CanvasImageSource {
    return this.frames[this.frameIndex][0];
  }

  public reset(): void {
    this.frameIndex = 0;
    this.timer = 0;
    this.isFinished = false;
  }
}
