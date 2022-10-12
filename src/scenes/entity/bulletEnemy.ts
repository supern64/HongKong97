import { AnimatedSprite, Application, Container, DisplayObject, Sprite, Spritesheet, Texture } from "pixi.js";
import { app, registerEffect } from "../..";
import QuickFlash from "../../effects/quickFlash";
import Game from "../game";
import BasicEnemy from "./basicEnemyGuy";
import Enemy from "./enemy";
import Entity from "./entity";

class BulletEnemy extends Enemy {
    public sprite: AnimatedSprite | Sprite;
    private spritesheet: Spritesheet;
    private initialX: number;
    private initialY: number;
    private isEnder: boolean;

    constructor(game: Game, x: number, y: number, isEnder: boolean) {
        if (isEnder === false) throw new Error("non-ender bullets not implemented");
        super();
        this.spritesheet = game.getEnemySpriteSheet();
        this.initialX = x;
        this.initialY = y;
        this.isEnder = isEnder;
    }

    init(app: Application, gameContainer: Container<DisplayObject>): void {
        if (this.isEnder) {
            // enemy spritesheet
            const animatedSprite = new AnimatedSprite(this.spritesheet.animations["ptr"]);
            this.sprite = animatedSprite;
            animatedSprite.x = this.initialX;
            animatedSprite.y = this.initialY
            animatedSprite.scale.x = 2.3;
            animatedSprite.scale.y = 2.3;
            animatedSprite.animationSpeed = 0.2;
            animatedSprite.play();
        } else {
            // i have no idea where the enemy bullet sprite is... recreation time?
            //this.sprite = new Sprite(this.spritesheet.textures["bullet.png"])
        }
        gameContainer.addChild(this.sprite);

    }
    update(delta: number): void {
        if (this.isEnder) {
            this.sprite.y += 2 * delta;
            if (this.sprite.y > app.view.height) {
                this.isActive = false;
            }
        } else {
            // not implemented yet
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