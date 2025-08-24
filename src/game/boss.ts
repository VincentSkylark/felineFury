import { GameAnimation, Frame } from './animation';
import { assetLoader } from '../core/asset-loader';
import { BlackCat } from './cat';
import { Enemy } from './enemy';
import { drawEngine } from '@/core/draw-engine';

const BOSS_WIDTH = 36;
const BOSS_HEIGHT = 48;
const REPOSITION_SPEED = 2;

type PathFunction = (time: number) => { x: number, y: number };

export class Boss extends Enemy {
    private animations: Map<string, GameAnimation> = new Map();
    protected currentAnimation!: GameAnimation;
    private time = 0;
    public width = BOSS_WIDTH;
    public height = BOSS_HEIGHT;
    
    private health = 10;
    private stage = 1;
    private state!: 'anger' | 'hurt' | 'defeat' | 'repositioning';
    
    private paths: Map<string, PathFunction> = new Map();

    private isInvincible = false;
    private invincibilityTime = 0;
    private hurtTime = 0;

    constructor(
        context: CanvasRenderingContext2D,
        mainCharacter: BlackCat,
    ) {
        super(context, mainCharacter);
        this.load();
        this.setupPaths();
        this.setState('anger');
    }

    private load() {
        const baseImage = assetLoader.getImage('/boss-base.png');
        const angerImage = assetLoader.getImage('/boss-anger.png');
        const hurtImage = assetLoader.getImage('/boss-hurt.png');
        const defeatImage = assetLoader.getImage('/boss-defeat.png');

        const createStateCanvas = (overlay: HTMLImageElement) => {
            const canvas = document.createElement('canvas');
            canvas.width = BOSS_WIDTH;
            canvas.height = BOSS_HEIGHT;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(baseImage, 0, 0, BOSS_WIDTH, BOSS_HEIGHT);
                ctx.drawImage(overlay, 0, 0, BOSS_WIDTH, BOSS_HEIGHT);
            }
            return canvas;
        };

        const angerCanvas = createStateCanvas(angerImage);
        const hurtCanvas = createStateCanvas(hurtImage);
        const defeatCanvas = createStateCanvas(defeatImage);

        this.animations.set('anger', new GameAnimation('anger', [[angerCanvas, 200]]));
        this.animations.set('hurt', new GameAnimation('hurt', [[hurtCanvas, 200]]));
        this.animations.set('defeat', new GameAnimation('defeat', [[defeatCanvas, 200]]));
    }

    private setupPaths() {
        // Stage 1
        const circlePath: PathFunction = (time: number) => {
            const centerX = drawEngine.canvasWidth / 2 - this.width / 2;
            const centerY = 120;
            const radius = 60;
            return {
                x: centerX + Math.cos(time / 500) * radius,
                y: centerY + Math.sin(time / 500) * radius,
            };
        };
        this.paths.set('stage1_anger', circlePath);

        // Stage 2
        const zigzagPath: PathFunction = (time: number) => {
            const centerX = drawEngine.canvasWidth / 2 - this.width / 2;
            const horizontalMovement = Math.sin(time / 1000) * (drawEngine.canvasWidth / 2 - this.width / 2 - 20);
            const verticalMovement = Math.sin(time / 300) * 30;
            return {
                x: centerX + horizontalMovement,
                y: 80 + verticalMovement,
            };
        };
        this.paths.set('stage2_anger', zigzagPath);
        
        // Stage 3
        const defeatPath: PathFunction = (time: number) => ({
            x: this.x,
            y: this.y < drawEngine.canvasHeight ? this.y + 1 : this.y,
        });
        this.paths.set('stage3_defeat', defeatPath);

        // Generic hurt path
        const hurtPath: PathFunction = () => ({ x: this.x, y: this.y });
        this.paths.set('hurt', hurtPath);
    }

    public update(deltaTime: number) {
        this.time += deltaTime;
        this.updateTimers(deltaTime);
        this.updateStageAndState();

        if (this.state === 'repositioning') {
            this.handleRepositioning();
        } else {
            this.handleMovement();
        }

        // We call super.update to keep the animation running
        super.update(deltaTime);
    }

    private updateTimers(deltaTime: number) {
        if (this.isInvincible) {
            this.invincibilityTime -= deltaTime;
            if (this.invincibilityTime <= 0) {
                this.isInvincible = false;
            }
        }
        if (this.hurtTime > 0) {
            this.hurtTime -= deltaTime;
            if (this.hurtTime <= 0 && this.stage < 3) {
                this.setState('anger');
            }
        }
    }

    private updateStageAndState() {
        const previousStage = this.stage;
        
        if (this.health > 5) {
            this.stage = 1;
        } else if (this.health > 0) {
            this.stage = 2;
        } else {
            this.stage = 3;
            this.setState('defeat');
        }

        if (this.stage === 2 && previousStage === 1) {
            this.setState('repositioning');
        }
    }
    
    private handleRepositioning() {
        const targetX = drawEngine.canvasWidth / 2 - this.width / 2;
        const targetY = 80;
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < REPOSITION_SPEED) {
            this.x = targetX;
            this.y = targetY;
            this.setState('anger');
        } else {
            this.x += (dx / distance) * REPOSITION_SPEED;
            this.y += (dy / distance) * REPOSITION_SPEED;
        }
    }

    private handleMovement() {
        let pathKey = `stage${this.stage}_${this.state}`;
        if (this.state === 'hurt') {
            pathKey = 'hurt';
        }
        
        const path = this.paths.get(pathKey);
        if (path) {
            const newPosition = path(this.time);
            this.x = newPosition.x;
            this.y = newPosition.y;
        }
    }

    protected checkCollision(): void {
        if (this.state === 'defeat' || this.isInvincible) { return; }
        
        const cat = this.mainCharacter;
        if (
            this.x < cat.x + cat.width &&
            this.x + this.width > cat.x &&
            this.y < cat.y + cat.height &&
            this.y + this.height > cat.y
        ) {
            this.takeDamage();
        }
    }

    public takeDamage() {
        if(this.health > 0) {
            this.health--;
        }
        this.isInvincible = true;
        this.invincibilityTime = 1000;
        this.setState('hurt');
        this.hurtTime = 200;
    }

    public setState(state: 'anger' | 'hurt' | 'defeat' | 'repositioning') {
        if (this.state === state) return;

        if (this.state === 'defeat' && state !== 'defeat') return;
        this.state = state;

        const animation = this.animations.get(state);
        if (animation) {
            this.currentAnimation = animation;
        } else if (state === 'repositioning') {
            // Repositioning can use anger animation
            this.currentAnimation = this.animations.get('anger')!;
        }
    }
}
