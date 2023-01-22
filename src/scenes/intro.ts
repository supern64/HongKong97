import { Assets, Application, Spritesheet, Sprite, utils, Container } from "pixi.js";
import Scene from "./scene";
import { app, registerEffect, setCurrentScene } from "..";
import * as ScreensSheetData from '../assets/screens.json';
import * as TextSheetData from '../assets/text.json';
import FadeIn from "../effects/fadeIn";
import FadeOut from "../effects/fadeOut";
import Game from "./game";
import * as SelectLang from "./selectLang";

class Intro implements Scene {
    private container: Container;
    private currentImage: number;
    private pictureSprite: Sprite;
    private textSprite: Sprite;
    private spritesheet: Spritesheet;
    private textSpritesheet: Spritesheet;
    private isGameOver = false;
    private hasIntroLooped = true;
    private transitionComplete = false;
    private currentTimeout: NodeJS.Timeout;

    constructor(isGameOver: boolean) {
        this.isGameOver = isGameOver;
        this.hasIntroLooped = !isGameOver;
    }

    init(app: Application): void {
        this.container = new Container();
        utils.clearTextureCache(); // pixi only uses this for from, fromFrame and fromImage methods
        this.spritesheet = SelectLang.screensSpritesheet;
        this.textSpritesheet = SelectLang.textSpritesheet;
        
        if (this.isGameOver) {
            this.currentImage = 9;
        } else {
            this.currentImage = 1;
        }
    
        this.pictureSprite = new Sprite();
        this.textSprite = new Sprite();
        
        this.textSprite.visible = false;
        this.container.alpha = 0;

        this.container.addChild(this.pictureSprite, this.textSprite);
        app.stage.addChild(this.container);
        
        // fix skip to game to default to english
        if (!this.spritesheet?.textures || !this.textSpritesheet?.textures) {
            Assets.loadBundle(["screens", "en"]).then(async (assets) => {
                this.spritesheet = new Spritesheet(assets.screens.screens, ScreensSheetData);
                await this.spritesheet.parse();
                this.textSpritesheet = new Spritesheet(assets.en.en, TextSheetData);
                await this.textSpritesheet.parse();
                this.runScreen();
            });
        } else { this.runScreen();  }
    }

    runScreen() {
        this.transitionComplete = false;
        if (this.currentImage > 4 && this.currentImage < 9) {
            this.textSprite.visible = true;
            this.pictureSprite.texture = this.spritesheet.textures[this.currentImage.toString() + ".png"];
            this.textSprite.texture = this.textSpritesheet.textures[this.currentImage.toString() + ".png"];
            this.textSprite.width = app.screen.width;
            this.textSprite.scale.y = 3;
            this.textSprite.y = app.view.height - this.textSprite.height;
            this.pictureSprite.height = this.textSprite.y - 1;
        } else {
            this.textSprite.visible = false;
            this.pictureSprite.width = app.screen.width;
            this.pictureSprite.height = app.screen.height;
            if (this.currentImage < 4) {
                this.pictureSprite.texture = this.textSpritesheet.textures[this.currentImage.toString() + ".png"];
            } else {
                this.pictureSprite.texture = this.spritesheet.textures[this.currentImage.toString() + ".png"];
            }
        }
        
        registerEffect("intro-fadeIns", new FadeIn(this.container, 1, () => {
            this.transitionComplete = true;
            this.currentTimeout = setTimeout(() => {
                this.fadeNextScreen();
            }, (this.isGameOver ? 3000 : 5000));
        }));
    }

    fadeNextScreen() {
        this.transitionComplete = false;
        registerEffect("intro-fadeOuts", new FadeOut(this.container, 1, () => {
            this.currentImage += 1;
            if (this.currentImage == 5) this.hasIntroLooped = true;
            if (this.currentImage > 8 && this.hasIntroLooped) {
                // continue to game
                setCurrentScene(new Game());
            } else {
                if (this.currentImage > 11) {
                    this.currentImage = 4;
                }
                this.runScreen();
            }
        }));
    }

    cleanup(app: Application): void {
        app.stage.removeChild(this.container);
    }

    onKeyDown(event: KeyboardEvent): void {
        if (event.code === "KeyZ" && this.transitionComplete) {
            clearTimeout(this.currentTimeout);
            this.fadeNextScreen();
        }
    }
}

export default Intro;