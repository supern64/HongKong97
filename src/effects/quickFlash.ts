import { DisplayObject } from "pixi.js";
import Effect from "./effect";

class QuickFlash implements Effect {
    private isActive: boolean;
    private object: DisplayObject;
    private onEnd: Function;
    private maxTime = 0;
    private lastUpdate = 0;
    private lastCycle = 0;

    constructor(object: DisplayObject, maxTime?: number, onEnd?: Function) {
        this.isActive = true;
        this.object = object;
        this.maxTime = maxTime;
        this.onEnd = onEnd;
    }

    update(delta: number) {
        if (!this.isActive) return;
        if (this.lastUpdate - this.lastCycle > 2) {
            this.lastCycle = this.lastUpdate;
            this.object.renderable = !this.object.renderable;
        }
        if (this.maxTime != 0 && this.lastUpdate > this.maxTime) {
            this.object.renderable = true;
            if (this.onEnd) this.onEnd();
            this.isActive = false;
        }
        this.lastUpdate += delta;
    }

    getIsActive(): boolean {
        return this.isActive;
    }
}

export default QuickFlash;