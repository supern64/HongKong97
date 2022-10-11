import { DisplayObject } from "pixi.js";
import Effect from './effect';

class FadeIn implements Effect {
    private isActive: boolean;
    private object: DisplayObject;
    private speed = 1;
    private onEnd: Function;

    constructor(object: DisplayObject, speed?: number, onEnd?: Function) {
        this.object = object;
        this.isActive = true;
        if (speed) this.speed = speed;
        this.onEnd = onEnd;
    }

    update(delta: number) {
        if (!this.isActive) return;
        if (this.object.alpha >= 1) {
            this.object.alpha = 1;
            if (this.onEnd) this.onEnd();
            this.isActive = false;
        }
        this.object.alpha += 0.02 * this.speed;
    }
    
    getIsActive(): boolean {
        return this.isActive;
    }
}

export default FadeIn;