import { drawEngine } from '@/core/draw-engine';
import { Enemy } from './enemy';
import { Cucumber } from './cucumber';

export type EnemyGenerator = () => Enemy;

interface EnemyType {
    generator: EnemyGenerator;
    spawnInterval: number; // in ms
    lastSpawn: number;
    score: number; // points awarded for this enemy type
}

export class EnemyGenerationFactory {
    public enemies: Enemy[] = [];
    private enemyTypes: EnemyType[] = [];
    private isSpawning = true;
    private scoreCallback?: (score: number) => void;
    private enemyScoreMap = new Map<Enemy, number>();

    public registerEnemyType(generator: EnemyGenerator, spawnInterval: number, score: number) {
        this.enemyTypes.push({
            generator,
            spawnInterval,
            lastSpawn: 0,
            score,
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
        this.enemyScoreMap.clear();
    }

    public setScoreCallback(callback: (score: number) => void) {
        this.scoreCallback = callback;
    }

    public update(deltaTime: number) {
        // 1. Spawn new enemies
        if (this.isSpawning) {
            const now = performance.now();
            this.enemyTypes.forEach(type => {
                if (now - type.lastSpawn > type.spawnInterval) {
                    type.lastSpawn = now;
                    const enemy = type.generator();
                    this.enemies.push(enemy);
                    this.enemyScoreMap.set(enemy, type.score);
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

        // 3. Garbage collect off-screen or dead enemies and award scores
        const enemiesToRemove = this.enemies.filter(enemy =>
            enemy.y >= drawEngine.canvasHeight || enemy.y <= -enemy.height || enemy.isDead
        );

        // Award scores for collected enemies
        enemiesToRemove.forEach(enemy => {
            const baseScore = this.enemyScoreMap.get(enemy) || 0;
            if (this.scoreCallback && baseScore > 0) {
                if (enemy.isDead) {
                    // Enemy was killed: award 5x score
                    this.scoreCallback(baseScore * 5);
                } else {
                    // Enemy went off-screen: award base score
                    this.scoreCallback(baseScore);
                }
            }
            this.enemyScoreMap.delete(enemy);
        });

        this.enemies = this.enemies.filter(enemy =>
            enemy.y < drawEngine.canvasHeight && enemy.y > -enemy.height && !enemy.isDead
        );
    }

    public draw() {
        this.enemies.forEach(enemy => enemy.draw());
    }
}
