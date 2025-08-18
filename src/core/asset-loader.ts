import { loadImage } from '../utils/load-image';

class AssetLoader {
  private images: Map<string, HTMLImageElement> = new Map();

  public async loadImages(urls: string[]): Promise<void> {
    const promises = urls.map(url => loadImage(url).then(img => this.images.set(url, img)));
    await Promise.all(promises);
  }

  public getImage(url: string): HTMLImageElement {
    const image = this.images.get(url);
    if (!image) {
      throw new Error(`Image not found: ${url}. Make sure to preload it.`);
    }
    return image;
  }
}

export const assetLoader = new AssetLoader();
