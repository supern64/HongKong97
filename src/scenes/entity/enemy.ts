import { Application, Container, DisplayObject, Sprite } from "pixi.js";
import Entity from "./entity";

abstract class Enemy implements Entity {
    protected isDead = false;
    protected isActive = true;

    abstract sprite: Sprite; // required for calculating hitboxes

    abstract init(app: Application, gameContainer: Container<DisplayObject>, assets?: any): void;

    abstract update(delta: number): void

    abstract cleanup(app: Application, gameContainer: Container<DisplayObject>): void;

    abstract hit(): boolean;

    setDead(): void {
        this.isDead = true;
    }

    getIsDead(): boolean {
        return this.isDead;
    }

    getIsActive(): boolean {
        return this.isActive;
    }

}

export default Enemy;