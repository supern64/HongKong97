import { AnimatedSprite } from "pixi.js";
import { app, registerEffect } from "../..";
import QuickFlash from "../../effects/quickFlash";
import Game from "../game";
import BasicEnemy from "./basicEnemyGuy";
import BulletEnemy from "./bulletEnemy";
import Needle from "./needle";

class WaveEnemy extends BasicEnemy {
    private lastMovement: number;
    protected lastSineUpdate: number = 0;

    constructor(game: Game, x: number, y: number) {
        super(game, x, y)
        this.texture = game.getEnemySpriteSheet().textures["guy_2.png"];
    }   

    update(delta: number) {
        if (this.isDead) return;
        const movement = Math.cos(this.lastSineUpdate) * 7.5;

        if (this.lastMovement * movement < 0) {
            this.sprite.scale.x = -this.sprite.scale.x;
            if (this.sprite.anchor.x === 0) {
                this.sprite.anchor.x = 1;
            } else {
                this.sprite.anchor.x = 0;
            }
        }

        this.lastUpdate += delta;
        this.lastSineUpdate += delta / 10;
        this.sprite.x += movement;
        this.sprite.y += 5 * delta;
        this.lastMovement = movement;
        if (this.sprite.y > app.view.height) {
            this.isActive = false;
        }
    }

    hit(): boolean {
        this.isDead = true;
        this.sprite.visible = false;
        this.animatedSprite = new AnimatedSprite(this.effectSpriteSheet.animations["explosion"]);
        this.animatedSprite.x = this.sprite.x - this.animatedSprite.width / 2;
        this.animatedSprite.y = this.sprite.y;
        this.animatedSprite.scale.x = 2.75;
        this.animatedSprite.scale.y = 2.75;
        this.animatedSprite.animationSpeed = 0.2;
        this.animatedSprite.loop = false;

        const spawnChance = Math.random();
        if (spawnChance > 0.8) {
            if (spawnChance > 0.925) {
                this.game.spawnEntity(new Needle(this.game, this.sprite.x + this.sprite.width / 2, this.sprite.y + this.sprite.height / 2))
            } else {
                this.game.spawnEntity(new BulletEnemy(this.game, this.sprite.x + this.sprite.width / 2, this.sprite.y + this.sprite.height / 2, true))
            }  
        }

        this.animatedSprite.onComplete = () => {
            this.container.removeChild(this.animatedSprite);
            this.sprite.anchor.x = 0;
            this.sprite.scale.x = Math.abs(this.sprite.scale.x);
            this.sprite.texture = this.effectSpriteSheet.textures["corpseflash.png"]
            this.sprite.x = this.sprite.x - this.sprite.width / 2;
            this.sprite.visible = true;
            registerEffect("enemyCorpseFlash", new QuickFlash(this.sprite, () => {
                this.isActive = false;
            }, 28));
        }

        this.container.addChild(this.animatedSprite);
        this.animatedSprite.play();
        return true;
    }
}

export default WaveEnemy;