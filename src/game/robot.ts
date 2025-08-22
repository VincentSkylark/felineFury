import { Animation, Frame } from './animation';
import { assetLoader } from '../core/asset-loader';
import { BlackCat } from './cat';
import { Enemy } from './enemy';

const ROBOT_SPRITE_WIDTH = 16;
const ROBOT_SPRITE_HEIGHT = 16;
const ROBOT_WIDTH = 24;
const ROBOT_HEIGHT = 24;

export type PathFunction = (time: number) => { x: number, y: number };

export class Robot extends Enemy {
    private animations: Map<string, Animation> = new Map();
    protected currentAnimation!: Animation;
    private time = 0;
    public width = ROBOT_WIDTH;
    public height = ROBOT_HEIGHT;

    constructor(
        context: CanvasRenderingContext2D,
        private path: PathFunction,
        mainCharacter: BlackCat,
    ) {
        super(context, mainCharacter);
        this.load();
    }

    private load() {
        const originalImage = assetLoader.getImage('/robot-16.png');

        const flippedCanvas = document.createElement('canvas');
        flippedCanvas.width = ROBOT_SPRITE_WIDTH;
        flippedCanvas.height = ROBOT_SPRITE_HEIGHT;
        const ctx = flippedCanvas.getContext('2d');

        if (ctx) {
            ctx.translate(ROBOT_SPRITE_WIDTH, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(originalImage, 0, 0);
            ctx.fillStyle = '#B13E53';
            ctx.fillRect(6, 5, 2, 2);
        }

        const frames: Frame[] = [
            [originalImage, 200],
            [flippedCanvas, 200],
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
