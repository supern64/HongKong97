import { AnimatedSprite, Application, Container, DisplayObject, Spritesheet } from "pixi.js";
import { app, registerEffect } from "../..";
import FadeToColor from "../../effects/fadeToColor";
import QuickFlash from "../../effects/quickFlash";
import ReverseFadeToColor from "../../effects/reverseFadeToColor";
import Game from "../game";
import Enemy from "./enemy";

enum BossAttackPhase {
    FIND,
    WAIT,
    ATTACK
}

enum Direction {
    RIGHT = 1,
    LEFT = -1
}

class Boss extends Enemy {
    private game: Game;
    public sprite: AnimatedSprite;
    private gameContainer: Container;

    private initialX: number;
    private initialY: number;

    private direction: Direction;
    private health = 100;
    private move = false;
    private dropping = false;
    private nextDrop: number;
    private lastUpdate = 0;
    private lastAttackStart = 0;
    private startWaitPhase = 0;
    private lastMovement = 0;
    private sineTimer = 0;
    private attackPhase = BossAttackPhase.FIND;

    constructor(game: Game, x: number, y: number) {
        super();
        this.game = game;
        this.gameContainer = game.getGameContainer();
        this.initialX = x;
        this.initialY = y;
    }

    init(app: Application, gameContainer: Container<DisplayObject>): void {
        this.nextDrop = this.getNextDrop();
        // init animated sprite
        this.sprite = new AnimatedSprite(this.game.getEnemySpriteSheet().animations["dxp"])
        this.sprite.x = this.initialX;
        this.sprite.y = this.initialY;
        this.sprite.scale.x = 2.5;
        this.sprite.scale.y = 2.5;
        this.sprite.animationSpeed = 0.2;
        this.sprite.play();
        
        gameContainer.addChild(this.sprite);
        // set screen filter fade on gameContainer
        registerEffect("bossQuickFlash", new QuickFlash(this.sprite, () => this.move = true, 55, 6));
        registerEffect("bossFadeScreenToRed", new FadeToColor(this.game.getBackgroundSprite(), [0.8, 0.2, 0.2], 0.5));

        // whoo fun boss programming logic!
        this.direction = this.initialX > app.view.width / 2 ? Direction.LEFT : Direction.RIGHT;
    }

    update(delta: number): void {
        if (this.isDead || !this.move) return;
        const value = Math.sin(this.sineTimer);
        // finding phase
        if (this.attackPhase === BossAttackPhase.FIND) {
            if (this.direction === Direction.LEFT) {
                this.sprite.y = value * 50 + this.initialY;
                this.sprite.x -= delta * 3;
                if (this.sprite.x <= 70) {
                    this.direction = Direction.RIGHT;
                }
            } else {
                this.sprite.y = value * 50 + this.initialY;
                this.sprite.x += delta * 3;
                if (this.sprite.x + this.sprite.width + 70 > app.view.width) {
                    this.direction = Direction.LEFT;
                }
            }
            const isCloseToPlayer = Math.abs(this.sprite.x - this.game.getPlayerSprite().x) < 100;
            if (this.lastUpdate - this.lastAttackStart > this.nextDrop && Math.random() > (isCloseToPlayer ? 0.35 : 0.6)) {
                this.attackPhase = BossAttackPhase.WAIT;
                this.startWaitPhase = this.lastUpdate;
            }
            this.sineTimer += delta / 8;
        } else if (this.attackPhase === BossAttackPhase.WAIT) {
            this.sprite.y = value * 15 + this.initialY;
            this.sineTimer += delta / 2;
            if (this.lastUpdate - this.startWaitPhase > 30) {
                this.dropping = true;
                this.attackPhase = BossAttackPhase.ATTACK;
            }
        } else if (this.attackPhase === BossAttackPhase.ATTACK) {
            if (this.sprite.y < app.view.height - this.sprite.height - 25 && this.dropping) {
                this.sprite.y += delta * 18;
                this.lastMovement = this.lastUpdate;
            } else {
                this.dropping = false;
                if (this.lastUpdate - this.lastMovement > 30) {
                    const target = value * 50 + this.initialY;
                    if (this.sprite.y > target) {
                        this.sprite.y -= delta * 3;
                    } else {
                        this.lastAttackStart = this.lastUpdate;
                        this.nextDrop = this.getNextDrop();
                        this.attackPhase = BossAttackPhase.FIND;
                    }
                }
            }
        }
        
        this.lastUpdate += delta;
    }

    cleanup(app: Application, gameContainer: Container<DisplayObject>): void {
        gameContainer.removeChild(this.sprite);
    }

    hit(): boolean {
        this.health -= 1;
        if (this.health > 0) return false;
        this.isDead = true;
        this.runWaves();
        registerEffect("bossDeadQuickFlash", new QuickFlash(this.sprite, () => {
            this.isActive = false;
        }, 150, 6));
        registerEffect("bossDeadFadeBack", new ReverseFadeToColor(this.game.getBackgroundSprite()));
        return true;
    }
    
    private getNextDrop(): number {
        return Math.floor(Math.random() * (170 - 100) + 100);
    }

    // all of this below is for the explosion effect btw. lol.
    async runWaves() {
        const explosionContainer = new Container();
        this.gameContainer.addChild(explosionContainer);

        for (let i = 0; i < 4; i++) {
            await new Promise((resolve, reject) => {
                this.spawnWaveExplosionSprite(Math.floor(Math.random() * 12 + 4), explosionContainer, resolve)
            });
        }
    }

    spawnWaveExplosionSprite(amount: number, explosionContainer: Container, resolve: Function) {
        let detonated = 0;
        for (let i = 0; i < amount; i++) {
            const explosionSprite = new AnimatedSprite(this.game.getEffectSpriteSheet().animations["explosion"]);
            explosionSprite.x = Math.floor((Math.random() * (this.sprite.width - explosionSprite.width / 2)) + this.sprite.x);
            explosionSprite.y = Math.floor((Math.random() * (this.sprite.height - explosionSprite.height / 2)) + this.sprite.y);
            explosionSprite.scale.x = 2.5;
            explosionSprite.scale.y = 2.5;
            explosionSprite.animationSpeed = 0.2;
            explosionSprite.pivot.x = 0.5;
            explosionSprite.pivot.y = 0.5;
            explosionSprite.loop = false;
            explosionContainer.addChild(explosionSprite);
            explosionSprite.play();
            
            explosionSprite.onComplete = () => {
                detonated += 1;
                explosionContainer.removeChild(explosionSprite);
                if (detonated === amount) {
                    resolve();
                }
            }
        }
        
    }
}

export default Boss;