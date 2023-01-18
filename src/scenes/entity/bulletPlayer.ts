import { Application, Container, Sprite, Texture } from "pixi.js";
import Game from "../game";
import Boss from "./boss";
import Enemy from "./enemy";
import Entity from "./entity";

class Bullet implements Entity {
    private game: Game;
    private texture: Texture;
    private initialX: number;
    private initialY: number;
    private sprite: Sprite;
    private isActive = true;

    constructor(game: Game, x: number, y: number) {
        this.game = game;
        this.texture = game.getPlayerSpritesheet().textures["bullet.png"];
        this.initialX = x;
        this.initialY = y;
    }   

    init(app: Application, gameContainer: Container) {
        this.sprite = new Sprite(this.texture);
        this.sprite.x = this.initialX;
        this.sprite.y = this.initialY;
        this.sprite.scale.x = 2.5;
        this.sprite.scale.y = 2.5;
        
        gameContainer.addChild(this.sprite);
    }

    update(delta: number): void {
        this.sprite.y -= 8 * delta;
        if (this.sprite.y < 0) {
            this.isActive = false;
        }
        
        // bullet collision
        for (let enemy of this.game.entities.filter(r => r instanceof Enemy)) {
            if (this.sprite.getBounds().intersects((enemy as Enemy).sprite.getBounds()) && !(enemy as Enemy).getIsDead()) {
                this.isActive = false;
                if ((enemy as Enemy).hit()) {
                    if (enemy instanceof Boss) {
                        this.game.enemiesDefeated = 0;
                    } else {
                        this.game.enemiesDefeated += 1;
                    }
                    this.game.score += (enemy instanceof Boss) ? 20 : 6;
                }
            }
        }
        
    }

    cleanup(app: Application, gameContainer: Container): void {
        gameContainer.removeChild(this.sprite);
    }

    getIsActive(): boolean {
        return this.isActive;
    }
}

export default Bullet;