import { GameAnimation, Frame } from './animation';
import { assetLoader } from '../core/asset-loader';
import { BlackCat } from './cat';
import { Enemy } from './enemy';

const FLIPPERS_SPRITE_WIDTH = 16;
const FLIPPERS_SPRITE_HEIGHT = 16;
const FLIPPERS_WIDTH = 24;
const FLIPPERS_HEIGHT = 24;

export type PathFunction = (time: number) => { x: number, y: number };

export class Flippers extends Enemy {
    private animations: Map<string, GameAnimation> = new Map();
    protected currentAnimation!: GameAnimation;
    private time = 0;
    public width = FLIPPERS_WIDTH;
    public height = FLIPPERS_HEIGHT;

    constructor(
        context: CanvasRenderingContext2D,
        private path: PathFunction,
        mainCharacter: BlackCat,
    ) {
        super(context, mainCharacter);
        this.load();
    }

    private load() {
        const originalImage = assetLoader.getImage('/flippers-16.png');

        const flippedCanvas = document.createElement('canvas');
        flippedCanvas.width = FLIPPERS_SPRITE_WIDTH;
        flippedCanvas.height = FLIPPERS_SPRITE_HEIGHT;
        const ctx = flippedCanvas.getContext('2d');

        if (ctx) {
            ctx.translate(FLIPPERS_SPRITE_WIDTH, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(originalImage, 0, 0);
        }

        const frames: Frame[] = [
            [originalImage, 500],
            [flippedCanvas, 300],
        ];
        const animation = new GameAnimation('default', frames);
        this.animations.set('default', animation);
        this.currentAnimation = animation;
    }

    public update(deltaTime: number) {
        this.time += deltaTime;
        const newPosition = this.path(this.time);
        this.x = newPosition.x;
        this.y = newPosition.y;
        super.update(deltaTime);
    }
}
