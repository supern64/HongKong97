import { Assets } from "@pixi/assets";
import { Application, BitmapText, Container, Sprite, Spritesheet, filters, AnimatedSprite } from "pixi.js";
import { app, PRESSED_KEYS, registerEffect, setCurrentScene } from "..";
import * as BackgroundSheetData from "../assets/bg.json";
import * as PlayerSheetData from "../assets/player.json";
import * as EnemySheetData from "../assets/eneitems.json";
import * as EffectSheetData from "../assets/effects.json";
import FadeIn from "../effects/fadeIn";
import Bullet from "./entity/bullet";
import Entity from "./entity/entity";
import Scene from "./scene";
import BasicEnemyGuy from "./entity/basicEnemyGuy";
import FadeOut from "../effects/fadeOut";
import Intro from "./intro";


class Game implements Scene {
    private container: Container;

    public score: number = 0;
    private isInvincible = false;
    private isPlayerDead = false;
    private scoreText: BitmapText;
    private player: AnimatedSprite;
    private playerSpriteSheet: Spritesheet;
    private enemySpriteSheet: Spritesheet;
    private effectSpriteSheet: Spritesheet;

    private lastUpdate = 0;
    private lastEnemySpawn = 0;

    readonly entities: Entity[] = [];

    init(app: Application): void {
        // load, load, load!
        this.container = new Container();
        this.container.sortableChildren = true;

        Assets.loadBundle("game").then((assets) => {
            this.container.alpha = 0;
            // draw bg
            const bgNum = Math.floor((Math.random() * 6) - 0.01) + 1;
            const bgSpritesheet = new Spritesheet(assets.backgrounds, BackgroundSheetData);

            bgSpritesheet.parse().then(() => {
                const bgSprite = new Sprite(bgSpritesheet.textures[bgNum.toString()]);
                bgSprite.width = app.view.width;
                bgSprite.height = app.view.height;

                /*const colorMatrix = new filters.ColorMatrixFilter();
                bgSprite.filters = [colorMatrix];
                colorMatrix.brightness(3, true)
                colorMatrix.tint(0xFF2222);*/
                
                bgSprite.zIndex = -1;
                this.container.addChild(bgSprite);
            });

            const playerSpritesheet = new Spritesheet(assets.player, PlayerSheetData);
            playerSpritesheet.parse().then(() => {
                this.playerSpriteSheet = playerSpritesheet;
                this.player = new AnimatedSprite(playerSpritesheet.animations["chin"])
                this.player.gotoAndStop(0);

                this.player.animationSpeed = 0.2;
                this.player.onLoop = () => {
                    this.player.gotoAndPlay(2);
                }

                this.player.y = app.view.height - 140;
                this.player.x = app.view.width / 2 - this.player.width / 2;
                this.player.scale.x = 2.3;
                this.player.scale.y = 2.3;

                this.container.addChild(this.player);
            });

            const enemySpritesheet = new Spritesheet(assets.enemiesAndItems, EnemySheetData);
            enemySpritesheet.parse().then(() => {
                this.enemySpriteSheet = enemySpritesheet;
            });

            const effectSpritesheet = new Spritesheet(assets.effects, EffectSheetData);
            effectSpritesheet.parse().then(() => {
                this.effectSpriteSheet = effectSpritesheet;
            });

            // score
            this.scoreText = new BitmapText(this.score.toString().padStart(9, '0'), {fontName: "score", fontSize: 40})
            this.scoreText.x = 400;
            this.scoreText.y = 30;
            this.scoreText.zIndex = 4;
            this.container.addChild(this.scoreText);

            registerEffect("game-fadeIn", new FadeIn(this.container));
        });
        app.stage.addChild(this.container);
    }
    updateAndDraw(app: Application, delta: number): void {
        if (this.isPlayerDead) return;
        // update score ui
        if (this.scoreText) this.scoreText.text = this.score.toString().padStart(9, '0');
        // inputs
        if (PRESSED_KEYS["ArrowRight"]) {
            if (this.player.x + 7 * delta + this.player.width > app.view.width) {
                this.player.x = app.view.width - this.player.width;
            } else {
                this.player.x += 7 * delta;
            }
        }
        if (PRESSED_KEYS["ArrowLeft"]) {
            if (this.player.x - 7 * delta < 0) {
                this.player.x = 0;
            } else {
                this.player.x -= 7 * delta;
            }
        }
        if (PRESSED_KEYS["ArrowUp"]) {
            if (this.player.y - 7 * delta < 0) {
                this.player.y = 0;
            } else {
                this.player.y -= 7 * delta;
            }
        }
        if (PRESSED_KEYS["ArrowDown"]) {
            if (this.player.y + 7 * delta + this.player.height > app.view.height) {
                this.player.y = app.view.height - this.player.height;
            } else {
                this.player.y += 7 * delta;
            }
        }
        // process entities
        for (let i = 0; i < this.entities.length; i++) {
            if (!this.entities[i].getIsActive()) {
                this.despawnEntityByIndex(i);
            } else {
                this.entities[i].update(delta);
            }
        }
        // player collision (cause fuck you im not doing player in a separate file)
        for (let enemy of this.entities.filter(r => r instanceof BasicEnemyGuy)) {
            if (this.player.getBounds().intersects((enemy as BasicEnemyGuy).sprite.getBounds())) {
                if (!(enemy as BasicEnemyGuy).getIsDead()) {
                    if (this.isInvincible) {
                        (enemy as BasicEnemyGuy).signalHit();
                        this.score += 12;
                    } else {
                        this.isPlayerDead = true;
                        (enemy as BasicEnemyGuy).setDead();
                        registerEffect("game-fadeout", new FadeOut(this.container, 1, () => {
                            this.player.gotoAndStop(0);
                            setCurrentScene(new Intro(true));
                        }))
                    }
                }
                
            }
        }
        // now spawn more of em
        if (this.lastUpdate - this.lastEnemySpawn > 15) {
            if (Math.random() > 0.6) {
                this.spawnEntity(new BasicEnemyGuy(this.enemySpriteSheet.textures["guy_1.png"], this.effectSpriteSheet, Math.floor(Math.random() * app.view.width), 0));
            }
            this.lastEnemySpawn = this.lastUpdate;
        }
        this.lastUpdate += delta;
    }
    cleanup(app: Application): void {
        app.stage.removeChild(this.container);
    }
    onKeyDown(event: KeyboardEvent): void {
        if (event.repeat || this.isPlayerDead) return;
        if (event.code === "ArrowUp" && !PRESSED_KEYS["ArrowRight"] && !PRESSED_KEYS["ArrowLeft"]) {
            this.player.gotoAndStop(1);
        }
        if (event.code === "ArrowRight") {
            this.player.scale.x = -Math.abs(this.player.scale.x);
            this.player.anchor.x = 1;
            this.player.gotoAndPlay(2);
        }
        if (event.code === "ArrowLeft") {
            this.player.scale.x = Math.abs(this.player.scale.x);
            this.player.anchor.x = 0;
            this.player.gotoAndPlay(2);
        }
        if (event.code === "KeyZ") {
            this.spawnEntity(new Bullet(this, this.playerSpriteSheet.textures["bullet.png"], this.player.x + this.player.width / 2, this.player.y))
        }
    }
    onKeyUp(event: KeyboardEvent): void {
        if (event.repeat) return;
        if ((event.code === "ArrowRight" || event.code === "ArrowLeft" || event.code === "ArrowUp") && (!PRESSED_KEYS["ArrowRight"] || !PRESSED_KEYS["ArrowLeft"] || !PRESSED_KEYS["ArrowUp"])) {
            this.player.gotoAndStop(0);
        }
    }
    spawnEntity(entity: Entity, assets?: any): void {
        entity.init(app, this.container, assets);
        this.entities.push(entity);
    }
    despawnEntity(entity: Entity) {
        entity.cleanup(app, this.container);
        this.entities.splice(this.entities.indexOf(entity), 1);
    }
    despawnEntityByIndex(index: number) {
        this.entities[index].cleanup(app, this.container);
        this.entities.splice(index, 1);
    }
}

export default Game;