import { Animation, Frame } from './animation';
import { assetLoader } from '../core/asset-loader';
import { BlackCat } from './cat';
import { Enemy } from './enemy';

const FLIPPERS_WIDTH = 16;
const FLIPPERS_HEIGHT = 16;

export type PathFunction = (time: number) => { x: number, y: number };

export class Flippers extends Enemy {
    private animations: Map<string, Animation> = new Map();
    protected currentAnimation!: Animation;
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
        flippedCanvas.width = FLIPPERS_WIDTH;
        flippedCanvas.height = FLIPPERS_HEIGHT;
        const ctx = flippedCanvas.getContext('2d');

        if (ctx) {
            ctx.translate(FLIPPERS_WIDTH, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(originalImage, 0, 0);
        }

        const frames: Frame[] = [
            [originalImage, 300],
            [flippedCanvas, 100],
        ];
        const animation = new Animation('default', frames);
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
