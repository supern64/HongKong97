import { DisplayObject } from "pixi.js";
import Effect from './effect';

class FadeContinuous implements Effect {
    private isActive: boolean;
    private isReturning: boolean;
    private object: DisplayObject;

    constructor(object: DisplayObject) {
        this.isActive = true;
        this.object = object;
    }

    update(delta: number) {
        if (this.object.alpha <= 0.2) {
            this.isReturning = true;
        } else if (this.object.alpha >= 1.0) {
            this.isReturning = false;
        }
        if (this.isReturning) {
            this.object.alpha += delta * 0.02;
        } else {
            this.object.alpha -= delta * 0.01;
        }
    }

    getIsActive(): boolean {
        return this.isActive;
    }
}

export default FadeContinuous;