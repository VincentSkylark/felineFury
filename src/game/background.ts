import { DrawEngine } from '../core/draw-engine';

export class Background {
  private y = 0;
  private speed = 0.05; // 1 pixel per frame

  constructor(private drawEngine: DrawEngine) { }

  update(deltaTime: number) {
    this.y = (this.y + this.speed * deltaTime) % 120;
  }

  draw() {
    const { context, canvasWidth, canvasHeight } = this.drawEngine;
    context.save();


    context.strokeStyle = '#fff'; // Horizontal lines
    context.lineWidth = 2;

    for (let i = 0; i < canvasHeight / 120 + 1; i++) {
      const lineY = this.y + i * 120;
      context.beginPath();
      context.moveTo(0, lineY);
      context.lineTo(canvasWidth, lineY);
      context.stroke();
    }
    context.restore();
  }
}
