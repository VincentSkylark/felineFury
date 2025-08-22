import { DrawEngine } from '../core/draw-engine';

export class Background {
  private y = 0;
  private speed = 0.03; // 1 pixel per frame
  private rectHeight = 16;
  private rectWidth = 96;
  private pattern: CanvasPattern | null = null;

  constructor(private drawEngine: DrawEngine) {
    this.createPattern();
  }

  private createPattern() {
    const patternCanvas = document.createElement('canvas');
    patternCanvas.width = this.rectWidth;
    patternCanvas.height = this.rectHeight * 2;
    const pctx = patternCanvas.getContext('2d');

    if (!pctx) {
      return;
    }

    pctx.fillStyle = '#8f563b';
    pctx.strokeStyle = '#45283c';
    pctx.lineWidth = 1;

    // Row 0
    pctx.fillRect(0, 0, this.rectWidth, this.rectHeight);
    pctx.strokeRect(0, 0, this.rectWidth, this.rectHeight);

    // Row 1 (offset)
    pctx.fillRect(-this.rectWidth / 2, this.rectHeight, this.rectWidth, this.rectHeight);
    pctx.strokeRect(-this.rectWidth / 2, this.rectHeight, this.rectWidth, this.rectHeight);
    pctx.fillRect(this.rectWidth / 2, this.rectHeight, this.rectWidth, this.rectHeight);
    pctx.strokeRect(this.rectWidth / 2, this.rectHeight, this.rectWidth, this.rectHeight);

    this.pattern = this.drawEngine.context.createPattern(patternCanvas, 'repeat');
  }

  update(deltaTime: number) {
    this.y = (this.y + this.speed * deltaTime) % (this.rectHeight * 2);
  }

  draw() {
    const { context, canvasWidth, canvasHeight } = this.drawEngine;
    if (!this.pattern) {
      return;
    }

    context.save();
    context.translate(0, this.y);
    context.fillStyle = this.pattern;
    context.fillRect(0, -this.y, canvasWidth, canvasHeight);
    context.restore();
  }
}
