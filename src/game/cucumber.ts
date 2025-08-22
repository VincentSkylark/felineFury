import { GameAnimation, Frame } from './animation';
import { assetLoader } from '../core/asset-loader';
import { BlackCat } from './cat';
import { Enemy } from './enemy';

const CUCUMBER_WIDTH = 16;
const CUCUMBER_HEIGHT = 16;

export type PathFunction = (time: number) => { x: number, y: number };

export class Cucumber extends Enemy {
    private animations: Map<string, GameAnimation> = new Map();
    protected currentAnimation!: GameAnimation;
    private time = 0;
    private angle = 0;
    public width = CUCUMBER_WIDTH;
    public height = CUCUMBER_HEIGHT;

    constructor(
        context: CanvasRenderingContext2D,
        private path: PathFunction,
        mainCharacter: BlackCat,
    ) {
        super(context, mainCharacter);
        this.load();
    }

    private load() {
        const originalImage = assetLoader.getImage('/cucumber-16.png');

        const frames: Frame[] = [
            [originalImage, 100],
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
        this.angle += 0.005 * deltaTime;
        super.update(deltaTime);
    }

    public draw() {
        this.context.save();
        this.context.translate(this.x + this.width / 2, this.y + this.height / 2);
        this.context.rotate(this.angle);
        this.context.drawImage(this.currentAnimation.currentFrameImage, -this.width / 2, -this.height / 2);
        this.context.restore();
    }
}
