import { loadImage } from '../utils/load-image';

interface SpriteFrame {
    x: number;
    y: number;
    w: number;
    h: number;
}

type SpriteFrames = Record<string, SpriteFrame>;

const SPRITE_FRAMES: SpriteFrames = {
    "attack-16.png": { "x": 1, "y": 1, "w": 16, "h": 16 },
    "bookshelf-16.png": { "x": 19, "y": 1, "w": 16, "h": 16 },
    "boss-anger.png": { "x": 37, "y": 1, "w": 36, "h": 48 },
    "boss-base.png": { "x": 1, "y": 51, "w": 36, "h": 48 },
    "boss-defeat.png": { "x": 39, "y": 51, "w": 36, "h": 48 },
    "boss-hurt.png": { "x": 75, "y": 1, "w": 36, "h": 48 },
    "cabinet-16.png": { "x": 113, "y": 1, "w": 16, "h": 16 },
    "cat-12-24.png": { "x": 1, "y": 19, "w": 12, "h": 24 },
    "cucumber-16.png": { "x": 15, "y": 19, "w": 16, "h": 16 },
    "flippers-16.png": { "x": 113, "y": 19, "w": 16, "h": 16 },
    "robot-16.png": { "x": 113, "y": 37, "w": 16, "h": 16 }
};

class SpritesheetLoader {
    private spritesheet: HTMLImageElement | null = null;
    private spriteCache: Map<string, HTMLCanvasElement> = new Map();
    private imageCache: Map<string, HTMLImageElement> = new Map();

    public async loadSpritesheet(imagePath: string): Promise<void> {
        // Only load the image, data is already embedded
        this.spritesheet = await loadImage(imagePath);
    }

    public getSprite(spriteName: string): HTMLCanvasElement {
        if (!this.spritesheet) {
            throw new Error('Spritesheet not loaded. Call loadSpritesheet() first.');
        }

        // Check cache first
        if (this.spriteCache.has(spriteName)) {
            return this.spriteCache.get(spriteName)!;
        }

        const frame = SPRITE_FRAMES[spriteName];
        if (!frame) {
            throw new Error(`Sprite "${spriteName}" not found in spritesheet.`);
        }

        // Create a canvas for this sprite
        const canvas = document.createElement('canvas');
        canvas.width = frame.w;
        canvas.height = frame.h;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Could not get 2D context for sprite canvas');
        }

        // Extract the sprite from the spritesheet
        ctx.drawImage(
            this.spritesheet,
            frame.x, frame.y, frame.w, frame.h,  // source
            0, 0, frame.w, frame.h               // destination
        );

        // Cache the sprite
        this.spriteCache.set(spriteName, canvas);

        return canvas;
    }

    public getSpriteAsImage(spriteName: string): HTMLImageElement {
        // For compatibility, return the canvas as an HTMLImageElement
        // since Canvas can be used as an image source in drawImage()
        const canvas = this.getSprite(spriteName);
        return canvas as any as HTMLImageElement;
    }

    public isLoaded(): boolean {
        return this.spritesheet !== null;
    }
}

export const spritesheetLoader = new SpritesheetLoader();
