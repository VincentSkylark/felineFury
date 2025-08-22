export interface GameObject {
    x: number;
    y: number;
    width: number;
    height: number;
    update(deltaTime: number): void;
    draw(): void;
}
