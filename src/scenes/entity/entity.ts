import { Application, Container } from "pixi.js";

interface Entity {
    init(app: Application, gameContainer: Container, assets?: any): void;
    update(delta: number): void;
    cleanup(app: Application, gameContainer: Container): void;
    getIsActive(): boolean;
}

export default Entity;