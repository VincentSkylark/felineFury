import { DrawEngine } from '../core/draw-engine';
import { loadImage } from '../utils/load-image';
import cabinetUrl from '/cabinet-16.png';
import bookshelfUrl from '/bookshelf-16.png';

export class Background {
  private y = 0;
  private speed = 0.03; // 1 pixel per frame
  private patternHeight = 0;
  private pattern: CanvasPattern | null = null;
  private cabinetImage: HTMLImageElement | undefined;
  private bookshelfImage: HTMLImageElement | undefined;

  constructor(private drawEngine: DrawEngine) {
    this.loadAssets();
  }

  private async loadAssets() {
    [this.cabinetImage, this.bookshelfImage] = await Promise.all([
      loadImage(cabinetUrl),
      loadImage(bookshelfUrl),
    ]);
    this.createPattern();
  }

  private createPattern() {
    if (!this.cabinetImage || !this.bookshelfImage) {
      return;
    }

    const cabinetPatternCanvas = document.createElement('canvas');
    cabinetPatternCanvas.width = 32;
    cabinetPatternCanvas.height = 48;
    const cabinetCtx = cabinetPatternCanvas.getContext('2d');
    if (cabinetCtx) {
      cabinetCtx.drawImage(this.cabinetImage, 0, 0, 32, 48);
    }

    const bookshelfPatternCanvas = document.createElement('canvas');
    bookshelfPatternCanvas.width = 32;
    bookshelfPatternCanvas.height = 64;
    const bookshelfCtx = bookshelfPatternCanvas.getContext('2d');
    if (bookshelfCtx) {
      bookshelfCtx.drawImage(this.cabinetImage, 0, 22, 32, 32);
      bookshelfCtx.drawImage(this.bookshelfImage, 0, 0, 32, 32);
    }

    const { canvasWidth, canvasHeight } = this.drawEngine;

    this.patternHeight = canvasHeight * 2;
    const patternCanvas = document.createElement('canvas');
    patternCanvas.width = canvasWidth;
    patternCanvas.height = this.patternHeight;

    const pctx = patternCanvas.getContext('2d');

    if (!pctx) {
      return;
    }

    const rectHeight = 16;
    const rectWidth = 96;
    pctx.fillStyle = '#8f563b';
    pctx.strokeStyle = '#45283c';
    pctx.lineWidth = 1;

    for (let y = 0; y < patternCanvas.height; y += rectHeight) {
      const xOffset = (y / rectHeight) % 2 === 0 ? 0 : -rectWidth / 2;
      for (let x = xOffset; x < patternCanvas.width; x += rectWidth) {
        pctx.fillRect(x, y, rectWidth, rectHeight);
        pctx.strokeRect(x, y, rectWidth, rectHeight);
      }
    }

    const assetSpawnRate = 128;
    for (let y = 0; y < patternCanvas.height; y += assetSpawnRate) {
      const x = Math.random() * (canvasWidth - 32);
      if (Math.random() < 0.5) {
        pctx.drawImage(bookshelfPatternCanvas, x, y);
      } else {
        pctx.drawImage(cabinetPatternCanvas, x, y);
      }
    }

    this.pattern = this.drawEngine.context.createPattern(patternCanvas, 'repeat-y');
  }

  update(deltaTime: number) {
    if (this.patternHeight > 0) {
      this.y = (this.y + this.speed * deltaTime) % this.patternHeight;
    }
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
