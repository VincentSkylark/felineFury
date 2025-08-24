import { drawEngine } from '@/core/draw-engine';
import { Enemy } from './enemy';

export type EnemyGenerator = () => Enemy;

interface EnemyType {
    generator: EnemyGenerator;
    spawnInterval: number; // in ms
    lastSpawn: number;
}

export class EnemyGenerationFactory {
    public enemies: Enemy[] = [];
    private enemyTypes: EnemyType[] = [];
    private isSpawning = true;

    public registerEnemyType(generator: EnemyGenerator, spawnInterval: number) {
        this.enemyTypes.push({
            generator,
            spawnInterval,
            lastSpawn: 0,
        });
    }

    public start() {
        this.isSpawning = true;
    }

    public stop() {
        this.isSpawning = false;
    }

    public clear() {
        this.enemies = [];
    }

    public update(deltaTime: number) {
        // 1. Spawn new enemies
        if(this.isSpawning) {
            const now = performance.now();
            this.enemyTypes.forEach(type => {
                if (now - type.lastSpawn > type.spawnInterval) {
                    type.lastSpawn = now;
                    this.enemies.push(type.generator());
                }
            });
        }

        // 2. Update existing enemies
        this.enemies.forEach(enemy => enemy.update(deltaTime));

        // 3. Garbage collect off-screen enemies
        this.enemies = this.enemies.filter(enemy => 
             enemy.y < drawEngine.canvasHeight
        );
    }

    public draw() {
        this.enemies.forEach(enemy => enemy.draw());
    }
}
