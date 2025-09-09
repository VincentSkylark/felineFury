import { loadImage } from '../utils/load-image';
import { spritesheetLoader } from './spritesheet-loader';

class AssetLoader {
  private images: Map<string, HTMLImageElement> = new Map();
  private usesSpritesheet = false;

  public async loadImages(urls: string[]): Promise<void> {
    const promises = urls.map(url => loadImage(url).then(img => this.images.set(url, img)));
    await Promise.all(promises);
  }

  public async loadSpritesheet(imagePath: string): Promise<void> {
    await spritesheetLoader.loadSpritesheet(imagePath);
    this.usesSpritesheet = true;
  }

  public getImage(url: string): HTMLImageElement {
    // First, always check if we have this image directly loaded
    if (this.images.has(url)) {
      return this.images.get(url)!;
    }

    // If we have a spritesheet loaded, try to get it from there
    if (this.usesSpritesheet) {
      try {
        // For spritesheet sprites, always use the filename without leading slash
        const spriteName = url.startsWith('/') ? url.substring(1) : url;
        const spriteCanvas = this.getSprite(spriteName);

        // Canvas can be used as HTMLImageElement in drawImage calls
        // Cast it to HTMLImageElement for type compatibility
        const spriteAsImage = spriteCanvas as any as HTMLImageElement;

        // Cache it in our images map for faster future access
        this.images.set(url, spriteAsImage);

        return spriteAsImage;
      } catch (error) {
        // If sprite not found in spritesheet, fall through to error below
      }
    }

    throw new Error(`Image not found: ${url}. Make sure to preload it.`);
  }

  public getSprite(spriteName: string): HTMLCanvasElement {
    if (!this.usesSpritesheet) {
      throw new Error('Spritesheet not loaded. Call loadSpritesheet() first.');
    }
    return spritesheetLoader.getSprite(spriteName);
  }

  public getSpriteAsImage(spriteName: string): HTMLImageElement {
    if (!this.usesSpritesheet) {
      throw new Error('Spritesheet not loaded. Call loadSpritesheet() first.');
    }
    return spritesheetLoader.getSpriteAsImage(spriteName);
  }
}

export const assetLoader = new AssetLoader();
