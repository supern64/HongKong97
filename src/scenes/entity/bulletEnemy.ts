import { AnimatedSprite, Application, Container, DisplayObject, Sprite, Spritesheet } from "pixi.js";
import { app } from "../..";
import Game from "../game";
import Enemy from "./enemy";

class BulletEnemy extends Enemy {
    public sprite: AnimatedSprite | Sprite;
    private spritesheet: Spritesheet;
    private initialX: number;
    private initialY: number;
    private momentumX: number = 0;
    private momentumY: number = 0;
    private isLandmine: boolean;

    constructor(game: Game, x: number, y: number, isLandmine: boolean, momentumX?: number, momentumY?: number) {
        super();
        this.spritesheet = game.getEnemySpriteSheet();
        this.initialX = x;
        this.initialY = y;
        this.isLandmine = isLandmine;
        // option ignored w/ landmines
        this.momentumX = momentumX ? momentumX : 0;
        this.momentumY = momentumY ? momentumY : 0;
    }

    init(app: Application, gameContainer: Container<DisplayObject>): void {
        if (this.isLandmine) {
            // enemy spritesheet
            const animatedSprite = new AnimatedSprite(this.spritesheet.animations["ptr"]);
            this.sprite = animatedSprite;
            
            animatedSprite.animationSpeed = 0.2;
            animatedSprite.play();
            this.momentumX = 0;
            this.momentumY = 2;
        } else {
            this.sprite = new Sprite(this.spritesheet.textures["bullet.png"])
        }
        this.sprite.x = this.initialX;
        this.sprite.y = this.initialY;
        this.sprite.scale.x = 2.5;
        this.sprite.scale.y = 2.5;

        gameContainer.addChild(this.sprite);

    }
    update(delta: number): void {
        this.sprite.x += this.momentumX * delta;
        this.sprite.y += this.momentumY * delta;
        if (this.sprite.x > app.view.width || this.sprite.x < 0 || this.sprite.y > app.view.height || this.sprite.y < 0) {
            this.isActive = false;
        }
    }
    cleanup(app: Application, gameContainer: Container<DisplayObject>): void {
        gameContainer.removeChild(this.sprite);
    }
    hit(): boolean {
        return false;
    }
}

export default BulletEnemy;