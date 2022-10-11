import * as PIXI from 'pixi.js';
import { Assets } from '@pixi/assets';
import { registerEffect, removeEffect, setCurrentScene, TEXT_STYLE } from '..';
import FadeContinuous from '../effects/fadeContinuous';
import FadeOut from '../effects/fadeOut';
import Scene from './scene';
import Intro from './intro';
import Game from './game';

class Warning implements Scene {
    private container: PIXI.Container;
    private isLoadingComplete: boolean = false;
    
    init(app: PIXI.Application) {
        this.container = new PIXI.Container();
        const warningTitle = new PIXI.Text('HEY!', {fontSize: 40, fontFamily: "DotGothic16", fill: "#ff0000", padding: 4});
        const warningBody = new PIXI.Text("This is a recreation of the game \"Hong Kong 97\".\n" + 
        "The original game (and this game in turn) contains disturbing imagery, and may cause triggers.\n" +
        "If you are disturbed by gore and dead bodies, you probably don't want to play this.\n" +
        "If you dare though, I can't really stop you. Don't blame me.", TEXT_STYLE);
        const continueText = new PIXI.Text("Loading...", TEXT_STYLE);
        
        warningTitle.x = 50;
        warningTitle.y = 50;
        warningBody.x = 50;
        warningBody.y = 110;
        continueText.x = app.view.width / 2 - continueText.width / 2;
        continueText.y = 450;

        this.container.addChild(warningTitle);
        this.container.addChild(warningBody);
        this.container.addChild(continueText);

        registerEffect("warning-continueTextFade", new FadeContinuous(continueText));
        app.stage.addChild(this.container);

        Assets.loadBundle("intro").then(() => {
            continueText.text = "Press Enter to Continue"
            continueText.x = app.view.width / 2 - continueText.width / 2;
            this.isLoadingComplete = true;
        });
    }

    updateAndDraw(app: PIXI.Application, delta: number): void {
    }

    onKeyDown(event: KeyboardEvent): void {
        if (event.key === "Enter" && this.isLoadingComplete) {
            removeEffect("warning-continueTextFade");
            registerEffect("warning-fadeOut", new FadeOut(this.container, 1, () => {
                setCurrentScene(new Intro(false));
            }));
        }
    }

    cleanup(app: PIXI.Application): void {
        app.stage.removeChild(this.container);
    }
}

export default Warning;