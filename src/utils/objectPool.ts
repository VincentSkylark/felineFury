interface PooledObject {
    reset(): void;
    update(deltaTime: number): void;
    activate(...args: any[]): boolean;
    isActive: boolean;
}

export class ObjectPool<T extends PooledObject>{
    private objectsArray: T[];
    private objectConstructor: {new (...args: any[]): T};
    private initialSize: number;
    private growthRate: number;
    private maxSize: number = 1024;

    constructor(objectConstructor: { new (...args: any[]): T }, initialSize: number, growthRate: number, maxSize: number) {
        this.objectsArray = [];
        this.objectConstructor = objectConstructor;
        this.initialSize = initialSize;
        this.growthRate = growthRate;
        this.maxSize = maxSize;

        for (let i = 0; i < initialSize; i++) {
            this.objectsArray.push(new objectConstructor());
        }
    }

    public getObject(...args: any[]): T {
        for (let i = 0; i < this.objectsArray.length; i++) {
            if (!this.objectsArray[i].isActive) {
                this.objectsArray[i].reset();
                this.objectsArray[i].activate(...args);
                return this.objectsArray[i];
            }
        }

        if (this.objectsArray.length < this.maxSize) {
            for (let i = 0; i < this.growthRate; i++) {
                if (this.objectsArray.length >= this.maxSize) {
                    break;
                }
                this.objectsArray.push(new this.objectConstructor());
            }
        }

        // If we still can't find an object, throw an error
        throw new Error('Object pool is exhausted!');
    }

    public update(deltaTime: number): void {
        for (let i = 0; i < this.objectsArray.length; i++) {
            this.objectsArray[i].update(deltaTime);
        }
    }

}