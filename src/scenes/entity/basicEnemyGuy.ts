import { AnimatedSprite, Application, Container, Sprite, Spritesheet, Texture } from "pixi.js";
import { app, registerEffect } from "../..";
import QuickFlash from "../../effects/quickFlash";
import Game from "../game";
import BulletEnemy from "./bulletEnemy";
import Enemy from "./enemy";

class BasicEnemy extends Enemy {
    protected game: Game;
    protected container: Container;
    protected texture: Texture;
    protected effectSpriteSheet: Spritesheet;
    protected initialX: number;
    protected initialY: number;
    public sprite: Sprite;
    protected animatedSprite: AnimatedSprite;
    protected isActive = true;
    protected isDead = false;
    protected lastUpdate = 0;
    protected lastCycle = 0;

    constructor(game: Game, x: number, y: number) {
        super()
        this.game = game;
        this.texture = game.getEnemySpriteSheet().textures["guy_1.png"];
        this.effectSpriteSheet = game.getEffectSpriteSheet();
        this.initialX = x;
        this.initialY = y;
    }   

    init(app: Application, gameContainer: Container) {
        this.container = gameContainer;
        this.sprite = new Sprite(this.texture);
        this.sprite.x = this.initialX;
        this.sprite.y = this.initialY;
        this.sprite.scale.x = 2.5;
        this.sprite.scale.y = 2.5;
        
        gameContainer.addChild(this.sprite);
    }

    update(delta: number): void {
        if (this.isDead) return;
        if (this.lastUpdate - this.lastCycle > 10) {
            this.lastCycle = this.lastUpdate;
            this.sprite.scale.x = -this.sprite.scale.x;
            if (this.sprite.anchor.x === 0) {
                this.sprite.anchor.x = 1;
            } else {
                this.sprite.anchor.x = 0;
            }
        }
        this.lastUpdate += delta;
        this.sprite.y += 3 * delta;
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
        this.animatedSprite.scale.x = 3.2;
        this.animatedSprite.scale.y = 3.2;
        this.animatedSprite.animationSpeed = 0.2;
        this.animatedSprite.loop = false;

        if (Math.random() > 0.8) {
            this.game.spawnEntity(new BulletEnemy(this.game, this.sprite.x + this.sprite.width / 2, this.sprite.y + this.sprite.height / 2, true))
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

    cleanup(app: Application, gameContainer: Container): void {
        gameContainer.removeChild(this.sprite);
    }
}

export default BasicEnemy;