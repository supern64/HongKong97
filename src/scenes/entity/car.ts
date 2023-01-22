import Game from "../game";
import BasicEnemy from "./basicEnemyGuy";

class Car extends BasicEnemy {
    private speed = 1;

    constructor(game: Game, x: number, y: number) {
        super(game, x, y);
        this.texture = game.getEnemySpriteSheet().textures["car.png"];
    }   

    update(delta: number): void {
        if (this.isDead) return;
        this.lastUpdate += delta;
        this.sprite.x -= 4 * delta * this.speed;
        if (this.sprite.x < 0) {
            this.isActive = false;
        }
    }

    hit(): boolean {
        this.speed = 2;
        return false;
    }
}

export default Car;