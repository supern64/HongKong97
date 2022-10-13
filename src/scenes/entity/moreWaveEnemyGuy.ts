import { app } from "../..";
import Game from "../game";
import BulletEnemy from "./bulletEnemy";
import WaveEnemy from "./waveEnemyGuy";

class MoreWaveEnemy extends WaveEnemy {
    private willSpawnBullet: boolean;
    private willTargetPlayer: boolean;
    private lastBullet = 0;

    constructor(game: Game, x: number, y: number) {
        super(game, x, y)
        this.willSpawnBullet = Math.random() > 0.55;
        this.willTargetPlayer = Math.random() > 0.6;
        this.texture = game.getEnemySpriteSheet().textures["guy_3.png"];
    }   

    update(delta: number) {
        if (this.isDead) return;
        const movement = Math.cos(this.lastSineUpdate) * 13;

        if (this.lastUpdate - this.lastCycle > 6) {
            this.lastCycle = this.lastUpdate;
            this.sprite.scale.x = -this.sprite.scale.x;
            if (this.sprite.anchor.x === 0) {
                this.sprite.anchor.x = 1;
            } else {
                this.sprite.anchor.x = 0;
            }
        }

        if (this.lastUpdate - this.lastBullet > 10 && Math.random() > (this.willTargetPlayer ? 0.75 : 0.6) && this.willSpawnBullet) {
            let willSpawn = true;
            this.lastBullet = this.lastUpdate;
            let momentumX, momentumY;
            const playerSprite = this.game.getPlayerSprite();
            if (this.willTargetPlayer) {
                let deltaX = playerSprite.x - this.sprite.x;
                let deltaY = playerSprite.y - this.sprite.y;

                if (deltaY < -20) {
                    willSpawn = false;
                } else {
                    // magnitude of vector
                    const magnitude = Math.sqrt(deltaX**2 + deltaY**2);
                    // normalize
                    if (magnitude > 0) {
                        deltaX /= magnitude;
                        deltaY /= magnitude;
                    }
                    momentumX = deltaX * 8;
                    momentumY = deltaY * 8;
                }
            } else {
                momentumX = movement * 1.25;
                momentumY = 8;
            }
            if (willSpawn) this.game.spawnEntity(new BulletEnemy(this.game, this.sprite.x + this.sprite.width / 2, this.sprite.y + this.sprite.width, false, momentumX, momentumY))
        }

        this.lastUpdate += delta;
        this.lastSineUpdate += delta / 20;
        this.sprite.x += movement;
        this.sprite.y += 5 * delta;
        if (this.sprite.y > app.view.height) {
            this.isActive = false;
        }
    }
}

export default MoreWaveEnemy;