import { Assets, AnimatedSprite, Application, Container, Sprite, Spritesheet, utils } from "pixi.js";
import * as Audio from "../audio";
import * as ScreensSheetData from '../assets/screens.json';
import * as EnemySheetData from '../assets/eneitems.json';
import * as TextSheetData from '../assets/text.json';
import Scene from "./scene";
import { registerEffect, setCurrentScene } from "..";
import FadeIn from "../effects/fadeIn";
import FadeOut from "../effects/fadeOut";
import Intro from "./intro";

export let screensSpritesheet: Spritesheet;
export let textSpritesheet: Spritesheet;

class SelectLanguage implements Scene {
    private container: Container;
    private selectPointer: AnimatedSprite;
    private currentIndex = 0;
    private hasChosen = false;
    private fadeInComplete = false;
    private readonly POSSIBLE_OPTIONS = ["jp", "zh", "en"];

    init(app: Application): void {
        Audio.playInBuffer();
        utils.clearTextureCache();
        this.container = new Container();

        this.container.alpha = 0;
        Assets.loadBundle("screens").then(async (assets) => {
            screensSpritesheet = new Spritesheet(assets.screens, ScreensSheetData);
            // bg
            await screensSpritesheet.parse();
            const selectBackground = new Sprite(screensSpritesheet.textures["select.png"])
            selectBackground.width = app.view.width ;
            selectBackground.height = app.view.height;
            // pointer
            const enemySpritesheet = new Spritesheet(assets.pointer, EnemySheetData);
            await enemySpritesheet.parse();
            this.selectPointer = new AnimatedSprite(enemySpritesheet.animations["ptr"])
            this.selectPointer.scale.x = 3;
            this.selectPointer.scale.y = 3;
            this.selectPointer.x = 170;
            this.selectPointer.y = 355;
            this.selectPointer.animationSpeed = 0.2;

            this.selectPointer.play();
            this.container.addChild(selectBackground, this.selectPointer);
            registerEffect("selectLang-fadeIn", new FadeIn(this.container, 1, () => this.fadeInComplete = true));
        })
        app.stage.addChild(this.container);
    }

    onKeyDown(event: KeyboardEvent): void {
        if (event.repeat) return;
        if (!this.hasChosen) {
            if (event.code === "ArrowDown") {
                this.currentIndex += 1;
                if (this.currentIndex >= this.POSSIBLE_OPTIONS.length) this.currentIndex = 0;
            }
            if (event.code === "ArrowUp") {
                this.currentIndex -= 1;
                if (this.currentIndex < 0) this.currentIndex = this.POSSIBLE_OPTIONS.length - 1;
            } 
            if (event.code === "KeyZ" && this.fadeInComplete) {
                this.hasChosen = true;
                const language = this.POSSIBLE_OPTIONS[this.currentIndex];
                registerEffect("selectLang-fadeOut", new FadeOut(this.container, 1, () => {
                    Assets.loadBundle(language).then(async (assets) => {
                        textSpritesheet = new Spritesheet(assets[language], TextSheetData);
                        await textSpritesheet.parse();
                        setCurrentScene(new Intro(false));
                    })
                }));
            }
            this.selectPointer.y = 355 + this.currentIndex * this.selectPointer.height;
        }
    }

    cleanup(app: Application): void {
        app.stage.removeChild(this.container);
    }
}

export default SelectLanguage;