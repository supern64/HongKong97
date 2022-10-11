import { AnimatedSprite, Application, Container, Sprite, Spritesheet, Texture } from "pixi.js";
import { app, registerEffect } from "../..";
import QuickFlash from "../../effects/quickFlash";
import Bullet from "./bullet";
import Entity from "./entity";

class BasicEnemyGuy implements Entity {
    private container: Container;
    private texture: Texture;
    private effectSpriteSheet: Spritesheet;
    private initialX: number;
    private initialY: number;
    public sprite: Sprite;
    private animatedSprite: AnimatedSprite;
    private isActive = true;
    private isDead = false;
    private lastUpdate = 0;
    private lastCycle = 0;

    constructor(guyTexture: Texture, effectSpriteSheet: Spritesheet, x: number, y: number) {
        this.texture = guyTexture;
        this.effectSpriteSheet = effectSpriteSheet;
        this.initialX = x;
        this.initialY = y;
    }   

    init(app: Application, gameContainer: Container) {
        this.container = gameContainer;
        this.sprite = new Sprite(this.texture);
        this.sprite.x = this.initialX;
        this.sprite.y = this.initialY;
        this.sprite.scale.x = 2.3;
        this.sprite.scale.y = 2.3;
        
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
        this.sprite.y += 2 * delta;
        if (this.sprite.y > app.view.height) {
            this.isActive = false;
        }
    }

    setDead(): void {
        this.isDead = true;
    }
    
    signalHit(): void {
        this.isDead = true;
        this.sprite.visible = false;
        this.animatedSprite = new AnimatedSprite(this.effectSpriteSheet.animations["explosion"]);
        this.animatedSprite.x = this.sprite.x - this.animatedSprite.width / 2;
        this.animatedSprite.y = this.sprite.y;
        this.animatedSprite.scale.x = 2.5;
        this.animatedSprite.scale.y = 2.5;
        this.animatedSprite.animationSpeed = 0.2;
        this.animatedSprite.loop = false;

        this.animatedSprite.onComplete = () => {
            this.container.removeChild(this.animatedSprite);
            this.sprite.anchor.x = 0;
            this.sprite.scale.x = Math.abs(this.sprite.scale.x);
            this.sprite.texture = this.effectSpriteSheet.textures["corpseflash.png"]
            this.sprite.x = this.sprite.x - this.sprite.width / 2;
            this.sprite.visible = true;
            registerEffect("quickFlash" + this.sprite.x * this.sprite.y, new QuickFlash(this.sprite, 20, () => {
                this.isActive = false;
            }))
        }

        this.container.addChild(this.animatedSprite);
        this.animatedSprite.play();
    }

    cleanup(app: Application, gameContainer: Container): void {
        gameContainer.removeChild(this.sprite);
    }

    getIsActive(): boolean {
        return this.isActive;
    }

    getIsDead(): boolean {
        return this.isDead;
    }
}

export default BasicEnemyGuy;