import { Application, Assets, Container, Text } from 'pixi.js';
import * as Audio from '../audio';
import { enterDebugMode, isDebugMode, registerEffect, removeEffect, setCurrentScene, TEXT_STYLE } from '..';
import FadeContinuous from '../effects/fadeContinuous';
import FadeOut from '../effects/fadeOut';
import Scene from './scene';
import Game from './game';
import SelectLanguage from './selectLang';


class Warning implements Scene {
    private container: Container;
    private name = "";
    private isLoadingComplete = false;
    private hasPressed = false;
    
    init(app: Application) {
        this.container = new Container();
        const warningTitle = new Text('HEY!', {fontSize: 40, fontFamily: "DotGothic16", fill: "#ff0000", padding: 4});
        const warningBody = new Text("This is a recreation of the game \"Hong Kong 97\".\n" + 
        "The original game (and this game in turn) contains disturbing imagery, and may cause triggers.\n" +
        "If you are disturbed by gore and dead bodies, you probably don't want to play this.\n" +
        "Also, this game is a work of fiction and I do not endorse any acts represented here.\n" +
        "If you dare play this, I can't really stop you. Don't blame me.", TEXT_STYLE);
        const continueText = new Text("Loading...", TEXT_STYLE);
        
        warningTitle.x = 50;
        warningTitle.y = 50;
        warningBody.x = 50;
        warningBody.y = 110;
        continueText.x = app.view.width / 2 - continueText.width / 2;
        continueText.y = 500;

        this.container.addChild(warningTitle);
        this.container.addChild(warningBody);
        this.container.addChild(continueText);

        registerEffect("warning-continueTextFade", new FadeContinuous(continueText));
        app.stage.addChild(this.container);

        Assets.loadBundle(["screens", "game"]).then(async () => {
            await Audio.load();
            continueText.text = "Press Z to Continue"
            continueText.x = app.view.width / 2 - continueText.width / 2;
            this.isLoadingComplete = true;
        });
    }

    onKeyDown(event: KeyboardEvent): void {
        if (this.hasPressed) return;
        if (event.code === "KeyZ" && this.isLoadingComplete) {
            removeEffect("warning-continueTextFade");
            this.hasPressed = true;
            registerEffect("warning-fadeOut", new FadeOut(this.container, 1, () => {
                setCurrentScene(new SelectLanguage());  
            }));
        } else if (event.code === "KeyG" && this.isLoadingComplete && isDebugMode) {
            removeEffect("warning-continueTextFade");
            this.hasPressed = true;
            registerEffect("warning-fadeOut", new FadeOut(this.container, 1, () => {
                setCurrentScene(new Game());
            }));
        } else if (!isDebugMode && /^[a-zA-Z ]$/i.test(event.key)) {
            const surname = ["n", "m", "a", "a", "t", "g", "i", "i", "b", "i", " ", "W", "o", "a", " ", "e", "j", "n", " ", "i", "n", "n", "e"];
            if (event.key === "W") this.name = "";
            this.name += event.key;
            this.name = this.name.split("").reverse().join("");
            if (this.name === surname.join("")) { // shhh, don't tell anyone! they could be the police!
                enterDebugMode();
            }
        }
    }

    cleanup(app: Application): void {
        app.stage.removeChild(this.container);
    }
}

export default Warning;