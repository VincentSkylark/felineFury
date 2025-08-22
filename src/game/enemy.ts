import { GameObject } from './gameObject';
import { Animation } from './animation';
import { BlackCat } from './cat';
import { gameStateMachine } from '@/game-state-machine';
import { menuState } from './states/menu.state';

export abstract class Enemy implements GameObject {
    public x = 0;
    public y = 0;
    public abstract width: number;
    public abstract height: number;
    protected abstract currentAnimation: Animation;

    constructor(
        protected context: CanvasRenderingContext2D,
        protected mainCharacter: BlackCat,
    ) {}

    public update(deltaTime: number): void {
        this.currentAnimation.update(deltaTime);
        this.checkCollision();
    }

    protected checkCollision(): void {
        const cat = this.mainCharacter;
        if (
            this.x < cat.x + cat.width &&
            this.x + this.width > cat.x &&
            this.y < cat.y + cat.height &&
            this.y + this.height > cat.y
        ) {
            gameStateMachine.setState(menuState);
        }
    }

    public draw(): void {
        this.context.drawImage(this.currentAnimation.currentFrameImage, this.x, this.y, this.width, this.height);
    }
}
