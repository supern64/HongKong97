import { AnimatedSprite, Application, Container, Spritesheet } from "pixi.js";
import { app } from "../..";
import Game from "../game";
import Entity from "./entity";

class Needle implements Entity {
    private enemySpriteSheet: Spritesheet;
    private initialX: number;
    private initialY: number;
    public sprite: AnimatedSprite;
    private isActive = true;
    private hasBeenUsed = false;

    constructor(game: Game, x: number, y: number) {
        this.enemySpriteSheet = game.getEnemySpriteSheet();
        this.initialX = x;
        this.initialY = y;
    }   

    init(app: Application, gameContainer: Container) {
        this.sprite = new AnimatedSprite(this.enemySpriteSheet.animations.needle);
        this.sprite.x = this.initialX;
        this.sprite.y = this.initialY;
        this.sprite.scale.x = 2.5;
        this.sprite.scale.y = 2.5;
        this.sprite.anchor.x = 0.5;
        this.sprite.anchor.y = 0.5;
        this.sprite.animationSpeed = 0.3;
        
        this.sprite.onLoop = () => {
            this.sprite.angle += 90;
        }
        
        gameContainer.addChild(this.sprite);
        this.sprite.play();
    }

    update(delta: number): void {
        this.sprite.y += 3 * delta;
        if (this.sprite.y > app.view.height) {
            this.isActive = false;
        }
    }

    cleanup(app: Application, gameContainer: Container): void {
        gameContainer.removeChild(this.sprite);
    }

    getHasBeenUsed(): boolean {
        return this.hasBeenUsed;
    }

    getIsActive(): boolean {
        return this.isActive;
    }

    use(): void {
        this.hasBeenUsed = true;
        this.isActive = false;
    }
}

export default Needle;