import { GameObject } from './gameObject';
import { GameAnimation } from './animation';
import { BlackCat } from './cat';
import { gameStateMachine } from '@/game-state-machine';
import { overState } from './states/over.state';

export abstract class Enemy implements GameObject {
    public x = 0;
    public y = 0;
    public abstract width: number;
    public abstract height: number;
    public isDead = false;
    protected abstract currentAnimation: GameAnimation;

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

        if (cat.isAttacking) {
            const attackWidth = 16;
            const attackHeight = 16;
            const attackX = cat.x + (cat.width / 2) - (attackWidth / 2);
            const attackY = cat.y - 24;

            if (
                this.x < attackX + attackWidth &&
                this.x + this.width > attackX &&
                this.y < attackY + attackHeight &&
                this.y + this.height > attackY
            ) {
                this.isDead = true;
                return;
            }
        }

        if (
            this.x < cat.x + cat.width &&
            this.x + this.width > cat.x &&
            this.y < cat.y + cat.height &&
            this.y + this.height > cat.y
        ) {
            gameStateMachine.setState(overState);
        }
    }

    public draw(): void {
        this.context.drawImage(this.currentAnimation.currentFrameImage, this.x, this.y, this.width, this.height);
    }
}
