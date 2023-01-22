import { Application } from 'pixi.js';

interface Scene {
    init(app: Application): void;
    updateAndDraw?(app: Application, delta: number): void;
    cleanup(app: Application): void;
    onKeyDown?(event: KeyboardEvent): void;
    onKeyUp?(event: KeyboardEvent): void;
}

export default Scene;