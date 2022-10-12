import { Application, Spritesheet, Sprite, utils } from "pixi.js";
import { Assets } from "@pixi/assets";
import Scene from "./scene";
import * as Audio from "../audio";
import * as ScreensSheetData from '../assets/screens.json';
import { registerEffect, setCurrentScene } from "..";
import FadeIn from "../effects/fadeIn";
import FadeOut from "../effects/fadeOut";
import Game from "./game";

class Intro implements Scene {
    private currentImage: number;
    private sprite: Sprite;
    private spritesheet: Spritesheet;
    private isGameOver = false;
    private hasIntroLooped = true;

    constructor(isGameOver: boolean) {
        this.isGameOver = isGameOver;
        this.hasIntroLooped = !isGameOver;
    }

    init(app: Application): void {
        utils.clearTextureCache(); // pixi only uses this for from, fromFrame and fromImage methods
        Assets.loadBundle("screens").then((assets) => {
            if (!this.isGameOver) Audio.playInBuffer();
            this.spritesheet = new Spritesheet(assets.screens, ScreensSheetData);
            this.spritesheet.parse().then(() => {
                if (this.isGameOver) {
                    this.currentImage = 9;
                } else {
                    this.currentImage = 1;
                }
            
                this.sprite = new Sprite();
                this.sprite.alpha = 0;
                this.sprite.width = app.screen.width;
                this.sprite.height = app.screen.height;
    
                app.stage.addChild(this.sprite);
                this.nextScreen();
            });
        });
    }

    nextScreen() {
        this.sprite.texture = this.spritesheet.textures[this.currentImage.toString()];
        registerEffect("intro-fadeIns", new FadeIn(this.sprite, 1, () => {
            setTimeout(() => {
                registerEffect("intro-fadeOuts", new FadeOut(this.sprite, 1, () => {
                    this.currentImage += 1;
                    if (this.currentImage == 5) this.hasIntroLooped = true;
                    if (this.currentImage > 8 && this.hasIntroLooped) {
                        // continue to game
                        setCurrentScene(new Game());
                    } else {
                        if (this.currentImage > 11) {
                            this.currentImage = 4;
                        }
                        this.nextScreen();
                    }
                }));
            }, (this.isGameOver ? 3000 : 5000));
        }));
    }

    updateAndDraw(app: Application, delta: number): void {
    }

    cleanup(app: Application): void {
        app.stage.removeChild(this.sprite);
    }
}

export default Intro;