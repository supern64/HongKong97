import { Assets, Application, BitmapText, Container, Sprite, Spritesheet, filters, AnimatedSprite, utils, Graphics } from "pixi.js";
import { app, isDebugMode, PRESSED_KEYS, registerEffect, removeEffect, setCurrentScene } from "..";
import * as BackgroundSheetData from "../assets/bg.json";
import * as PlayerSheetData from "../assets/player.json";
import * as EnemySheetData from "../assets/eneitems.json";
import * as EffectSheetData from "../assets/effects.json";
import FadeIn from "../effects/fadeIn";
import Bullet from "./entity/bulletPlayer";
import Entity from "./entity/entity";
import Scene from "./scene";
import BasicEnemy from "./entity/basicEnemyGuy";
import Car from "./entity/car";
import FadeOut from "../effects/fadeOut";
import Intro from "./intro";
import Needle from "./entity/needle";
import QuickFlash from "../effects/quickFlash";
import Enemy from "./entity/enemy";
import WaveEnemy from "./entity/waveEnemyGuy";
import MoreWaveEnemy from "./entity/moreWaveEnemyGuy";
import Boss from "./entity/boss";

let currentBackground = 0;

class Game implements Scene {
    private container: Container;

    public score = 0;
    public enemiesDefeated = 0;
    private invincibleFramesLeft = 0;
    private isPlayerDead = false;

    private scoreText: BitmapText;
    private player: AnimatedSprite;
    private background: Sprite;
    private boundingBoxDisplay: Graphics;
    private playerSpriteSheet: Spritesheet;
    private enemySpriteSheet: Spritesheet;
    private effectSpriteSheet: Spritesheet;

    private lastUpdate = 0;
    private lastZPress = 0;
    private lastAutoShoot = 0;
    private lastNormalEnemySpawn = 0;
    private lastWaveyEnemySpawn = 0;
    private lastMoreWaveyEnemySpawn = 0;
    private lastBossHitWithInvincibility = 0;
    private lastCarSpawn = 0;
    private lastFrameInputs: { [key: string]: boolean } = {};

    readonly entities: Entity[] = [];

    init(app: Application): void {
        // load, load, load!
        this.container = new Container();
        this.container.sortableChildren = true;

        Assets.loadBundle("game").then((assets) => {
            utils.clearTextureCache();
            this.container.alpha = 0;
            // draw bg
            const bgNum = (currentBackground % 6) + 1;
            const bgSpritesheet = new Spritesheet(assets.backgrounds, BackgroundSheetData);

            bgSpritesheet.parse().then(() => {
                this.background = new Sprite(bgSpritesheet.textures[bgNum.toString() + ".png"]);
                this.background.width = app.view.width;
                this.background.height = app.view.height;
                this.background.zIndex = -1;
                this.container.addChild(this.background);
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
                this.player.scale.x = 2.5;
                this.player.scale.y = 2.5;
                this.player.zIndex = 2;

                if (isDebugMode) {
                    this.boundingBoxDisplay = new Graphics();
                    let bb = this.player.getBounds();
                    this.boundingBoxDisplay.zIndex = 3;
                    this.boundingBoxDisplay.renderable = false;
                    this.container.addChild(this.boundingBoxDisplay);
                }

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

        if (this.boundingBoxDisplay && isDebugMode) {
            this.boundingBoxDisplay.renderable = PRESSED_KEYS["ShiftLeft"] ? true : false
            if (PRESSED_KEYS["ShiftLeft"]) {
                let bb = this.player.getBounds();
                this.boundingBoxDisplay.clear();
                this.boundingBoxDisplay.lineStyle(2, 0xFF0000);
                this.boundingBoxDisplay.drawRect(0, 0, bb.width, bb.height);
                this.boundingBoxDisplay.x = bb.x;
                this.boundingBoxDisplay.y = bb.y;
            }
        }

        // inputs
        if (PRESSED_KEYS["ArrowRight"]) {
            if (this.player.x + 6 * delta + this.player.width > app.view.width) {
                this.player.x = app.view.width - this.player.width;
            } else {
                this.player.x += 6 * delta;
            }
        }
        if (PRESSED_KEYS["ArrowLeft"]) {
            if (this.player.x - 6 * delta < 0) {
                this.player.x = 0;
            } else {
                this.player.x -= 6 * delta;
            }
        }
        if (PRESSED_KEYS["ArrowUp"]) {
            if (this.player.y - 6 * delta < 0) {
                this.player.y = 0;
            } else {
                this.player.y -= 6 * delta;
            }
        }
        if (PRESSED_KEYS["ArrowDown"]) {
            if (this.player.y + 6 * delta + this.player.height > app.view.height) {
                this.player.y = app.view.height - this.player.height;
            } else {
                this.player.y += 6 * delta;
            }
        }
        if (PRESSED_KEYS["KeyZ"] && this.lastFrameInputs?.["KeyZ"] && (this.lastUpdate - this.lastZPress > 8 && this.lastUpdate - this.lastAutoShoot > 8)) {
            this.spawnEntity(new Bullet(this, this.player.x + this.player.width / 2, this.player.y));
            this.lastAutoShoot = this.lastUpdate;
        }

        // animation fixes
        if ((PRESSED_KEYS["ArrowLeft"] && PRESSED_KEYS["ArrowRight"]) || (PRESSED_KEYS["ArrowUp"] && PRESSED_KEYS["ArrowDown"])) {
            this.player.gotoAndStop(0);
        } else if (!this.player?.playing) {
            if (PRESSED_KEYS["ArrowUp"] && !PRESSED_KEYS["ArrowRight"] && !PRESSED_KEYS["ArrowLeft"]) {
                this.player.gotoAndStop(1);
            }
            if (PRESSED_KEYS["ArrowRight"]) {
                this.player.scale.x = -Math.abs(this.player.scale.x);
                this.player.anchor.x = 1;
                this.player.gotoAndPlay(2);
            }
            if (PRESSED_KEYS["ArrowLeft"]) {
                this.player.scale.x = Math.abs(this.player.scale.x);
                this.player.anchor.x = 0;
                this.player.gotoAndPlay(2);
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
        // prioritize invincibility items over enemies (because i'm nice)
        const needles = this.entities.filter(r => r instanceof Needle);
        if (needles.length > 0) {
            for (let needle of needles) {
                if (this.player.getBounds().intersects((needle as Needle).sprite.getBounds()) && !(needle as Needle).getHasBeenUsed()) {
                    (needle as Needle).use();
                    if (this.invincibleFramesLeft === 0) {
                        registerEffect("playerInvincibilityFlash", new QuickFlash(this.player))
                    }
                    this.invincibleFramesLeft += 500;
                }
            }
        }

        if (this.invincibleFramesLeft != 500) {
            for (let enemy of this.entities.filter(r => r instanceof Enemy)) {
                if (this.player.getBounds().intersects((enemy as Enemy).sprite.getBounds())) {
                    if (!(enemy as Enemy).getIsDead()) {
                        if (this.invincibleFramesLeft > 0) {
                            if (enemy instanceof Boss) {
                                if (this.lastUpdate - this.lastBossHitWithInvincibility > 12) {
                                    if ((enemy as Enemy).hit()) {
                                        this.score += 20;
                                        this.enemiesDefeated = 0;
                                    }
                                    this.lastBossHitWithInvincibility = this.lastUpdate;
                                }
                            } else {
                                if ((enemy as Enemy).hit()) {
                                    this.score += 12;
                                    this.enemiesDefeated += 1;
                                }
                            }
                        } else {
                            this.isPlayerDead = true;
                            (enemy as Enemy).setDead();
                            this.player.gotoAndStop(0);
                            removeEffect("playerInvincibilityFlash");
                            this.player.renderable = true;
                            currentBackground += 1;
                            registerEffect("game-fadeout", new FadeOut(this.container, 1, () => {
                                setCurrentScene(new Intro(true));
                            }))
                        }
                    }
                }
            }
        }

        // enemy spawn routine
        if (!this.entities.some(r => r instanceof Boss)) {
            let enemySpawnChance = Math.random();
            if (this.lastUpdate - this.lastNormalEnemySpawn > 30 && enemySpawnChance > 0.65) {
                this.spawnEntity(new BasicEnemy(this, Math.floor(Math.random() * (app.view.width - this.player.width)), 0));
                this.lastNormalEnemySpawn = this.lastUpdate;
            }
            if (this.lastUpdate - this.lastWaveyEnemySpawn > 45 && enemySpawnChance > 0.7) {
                this.spawnEntity(new WaveEnemy(this, Math.floor(Math.random() * (app.view.width - 200) + 200), 0));
                this.lastWaveyEnemySpawn = this.lastUpdate;
            }
            if (this.lastUpdate - this.lastMoreWaveyEnemySpawn > 70 && enemySpawnChance > 0.7) {
                this.spawnEntity(new MoreWaveEnemy(this, Math.floor(Math.random() * (app.view.width - 300) + 300), 0));
                this.lastMoreWaveyEnemySpawn = this.lastUpdate;
            }
            if (this.lastUpdate - this.lastCarSpawn > 250 && enemySpawnChance > 0.8) {
                this.spawnEntity(new Car(this, app.view.width, (Math.random() * (app.view.height - 60) + 30)))
                this.lastCarSpawn = this.lastUpdate;
            }
        }

        if (this.enemiesDefeated >= 30) {
            this.enemiesDefeated = 0;
            this.spawnEntity(new Boss(this, Math.floor(Math.random() * (app.view.width - 200)) + 100, 50));
        }

        // update player iframes
        if (this.invincibleFramesLeft > 0) {
            if (this.invincibleFramesLeft - delta <= 0) {
                this.invincibleFramesLeft = 0;
                removeEffect("playerInvincibilityFlash");
            } else {
                this.invincibleFramesLeft -= delta;
            }
        }
        
        this.lastFrameInputs = PRESSED_KEYS;
        this.lastUpdate += delta;
    }
    cleanup(app: Application): void {
        app.stage.removeChild(this.container);
    }
    onKeyDown(event: KeyboardEvent): void {
        if (event.repeat || this.isPlayerDead) return;
        if (event.code === "KeyZ") {
            this.spawnEntity(new Bullet(this, this.player.x + this.player.width / 2, this.player.y))
            this.lastZPress = this.lastUpdate;
        }
        if (event.code === "KeyI" && isDebugMode) {
            if (this.invincibleFramesLeft === 0) {
                registerEffect("playerInvincibilityFlash", new QuickFlash(this.player))
            }
            this.invincibleFramesLeft += 100000;
        }
        if (event.code === "KeyB" && !this.entities.some(r => r instanceof Boss) && isDebugMode) {
            this.spawnEntity(new Boss(this, Math.floor(Math.random() * (app.view.width - 200)) + 100, 50));
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
    getPlayerSprite(): AnimatedSprite {
        return this.player;
    }
    getBackgroundSprite(): Sprite {
        return this.background;
    }
    getGameContainer(): Container {
        return this.container;
    }
    getPlayerSpritesheet(): Spritesheet {
        return this.playerSpriteSheet;
    }
    getEnemySpriteSheet(): Spritesheet {
        return this.enemySpriteSheet;
    }
    getEffectSpriteSheet(): Spritesheet {
        return this.effectSpriteSheet;
    }
}

export default Game;