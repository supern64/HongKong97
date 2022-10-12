import { Application, Container, Sprite, Spritesheet, Texture } from "pixi.js";
import Game from "../game";
import BasicEnemy from "./basicEnemyGuy";
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
        this.sprite.scale.x = 2.3;
        this.sprite.scale.y = 2.3;
        
        gameContainer.addChild(this.sprite);
    }

    update(delta: number): void {
        this.sprite.y -= 8 * delta;
        if (this.sprite.y < 0) {
            this.isActive = false;
        }
        
        // bullet collision
        for (let enemy of this.game.entities.filter(r => r instanceof BasicEnemy)) {
            if (this.sprite.getBounds().intersects((enemy as BasicEnemy).sprite.getBounds()) && !(enemy as BasicEnemy).getIsDead()) {
                this.isActive = false;
                if ((enemy as BasicEnemy).hit()) {
                    this.game.enemiesDefeated += 1;
                    this.game.score += 6;
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