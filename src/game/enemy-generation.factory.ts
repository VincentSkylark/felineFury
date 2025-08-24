import { drawEngine } from '@/core/draw-engine';
import { Enemy } from './enemy';
import { Cucumber } from './cucumber';

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

        const reflectedCucumbers = this.enemies.filter(
            e => e instanceof Cucumber && (e as Cucumber).isReflected && !e.isDead
        );
        const otherEnemies = this.enemies.filter(
            e => !reflectedCucumbers.includes(e) && !e.isDead
        );
        
        if (reflectedCucumbers.length > 0) {
            for (const cucumber of reflectedCucumbers) {
                for (const enemy of otherEnemies) {
                    if (
                        cucumber.x < enemy.x + enemy.width &&
                        cucumber.x + cucumber.width > enemy.x &&
                        cucumber.y < enemy.y + enemy.height &&
                        cucumber.y + cucumber.height > enemy.y
                    ) {
                        cucumber.isDead = true;
                        enemy.isDead = true;
                        break;
                    }
                }
            }
        }

        // 3. Garbage collect off-screen or dead enemies
        this.enemies = this.enemies.filter(enemy => 
             enemy.y < drawEngine.canvasHeight && enemy.y > -enemy.height && !enemy.isDead
        );
    }

    public draw() {
        this.enemies.forEach(enemy => enemy.draw());
    }
}
