import { ColorOverlayFilter } from "@pixi/filter-color-overlay";
import { DisplayObject } from "pixi.js";
import Effect from "./effect";

declare type Color = number | number[] | Float32Array;

class FadeToColor implements Effect {
    private isActive: boolean;
    private filter: ColorOverlayFilter;
    private color: Color;
    private alpha: number;
    private object: DisplayObject;
    private onEnd: Function;

    constructor(object: DisplayObject, color: Color, alpha: number, onEnd?: Function) {
        this.isActive = true;
        this.object = object;
        this.color = color;
        this.alpha = alpha;
        this.onEnd = onEnd;
        this.filter = new ColorOverlayFilter(color, 0.0);

        if (!this.object.filters) this.object.filters = [];
        this.object.filters.push(this.filter);
    }

    update(delta: number) {
        if (!this.isActive) return;
        if (this.filter.alpha >= this.alpha) {
            this.filter.alpha = this.alpha;
            if (this.onEnd) this.onEnd();
            this.isActive = false;
        }
        this.filter.alpha += 0.02 * this.alpha;
    }

    getIsActive(): boolean {
        return this.isActive;
    }
}

export default FadeToColor;