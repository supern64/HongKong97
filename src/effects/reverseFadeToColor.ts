import { ColorOverlayFilter } from "@pixi/filter-color-overlay";
import { DisplayObject } from "pixi.js";
import Effect from "./effect";

declare type Color = number | number[] | Float32Array;

class ReverseFadeToColor implements Effect {
    private isActive: boolean;
    private filter: ColorOverlayFilter;
    private initialAlpha: number;
    private object: DisplayObject;
    private onEnd: Function;

    constructor(object: DisplayObject, onEnd?: Function) {
        this.isActive = true;
        this.object = object;
        this.onEnd = onEnd;

        if (!this.object.filters || !this.object.filters.find(r => r instanceof ColorOverlayFilter)) {
            this.isActive = false; // no colors to unfade
            return;
        }
        
        this.filter = this.object.filters.find(r => r instanceof ColorOverlayFilter) as ColorOverlayFilter;
        this.initialAlpha = this.filter.alpha;
    }

    update(delta: number) {
        if (!this.isActive) return;
        if (this.filter.alpha <= 0) {
            let indexOfFilter = this.object.filters.findIndex(r => r instanceof ColorOverlayFilter);
            this.object.filters.splice(indexOfFilter, 1);
            if (this.onEnd) this.onEnd();
            this.isActive = false;
        }
        this.filter.alpha -= 0.02 * this.initialAlpha;
    }

    getIsActive(): boolean {
        return this.isActive;
    }
}

export default ReverseFadeToColor;