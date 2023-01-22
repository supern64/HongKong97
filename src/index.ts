import { Application, Assets, BitmapFont, BaseTexture, Text, TextStyle, SCALE_MODES } from 'pixi.js';
import * as FontFaceObserver from 'fontfaceobserver';
import './style.css';
import Scene from './scenes/scene';
import Warning from './scenes/warning';
import registerBundles from './loader';
import Effect from './effects/effect';
import ScoreFontData from './assets/score.xml';
import ScoreLocation from './assets/score.png';


export const app = new Application();
export let isDebugMode = process.env.NODE_ENV === "development";
const registeredEffects: Array<{ name: string; effect: Effect }> = [];
let currentStage: Scene | null;
(app.view as HTMLCanvasElement).id = "canvas";
app.stage.sortableChildren = true;
app.ticker.maxFPS = 60;
document.body.appendChild(app.view as HTMLCanvasElement);

BaseTexture.defaultOptions.scaleMode = SCALE_MODES.NEAREST;
export const TEXT_STYLE = new TextStyle({fontFamily: "DotGothic16", fill: "#ffffff", wordWrap: true, wordWrapWidth: app.view.width - 100, lineHeight: 40, padding: 4});

// boilerplate update and input logic, runs at 60fps
export const PRESSED_KEYS: { [key: string]: boolean } = {};
window.addEventListener("keydown", (ev) => {
  if (currentStage?.onKeyDown) currentStage.onKeyDown(ev);
  PRESSED_KEYS[ev.code] = true;
});
window.addEventListener("keyup", (ev) => {
  if (currentStage?.onKeyUp) currentStage.onKeyUp(ev);
  PRESSED_KEYS[ev.code] = false;
});

app.ticker.add((delta) => {
  if (currentStage?.updateAndDraw) currentStage.updateAndDraw(app, delta);
  for (let i = 0; i < registeredEffects.length; i++) {
    if (!registeredEffects[i].effect.getIsActive()) { // remove inactive effects
      registeredEffects.splice(i, 1);
    } else {
      registeredEffects[i].effect.update(delta);
    }
  }
})

// util functions
export function setCurrentScene(scene: Scene) {
  currentStage?.cleanup(app);
  scene.init(app);
  currentStage = scene;
}
export function registerEffect(name: string, effect: Effect) {
  registeredEffects.push({name, effect});
}
export function removeEffect(name: String) {
  registeredEffects.splice(registeredEffects.findIndex((n) => n.name == name), 1)
}
export function enterDebugMode() {
  isDebugMode = true;
  const debugText = new Text("Debug Mode", TEXT_STYLE);
  debugText.x = app.view.width - debugText.width - 5;
  debugText.y = app.view.height - debugText.height;
  debugText.zIndex = 5;
  app.stage.addChild(debugText);
}

// init
const font = new FontFaceObserver("DotGothic16");
registerBundles();
font.load().then(() => {
  Assets.add("score", ScoreLocation);
  Assets.load("score").then((scoreFontTexture) => {
    const data = (new DOMParser()).parseFromString(ScoreFontData, "application/xml");
    BitmapFont.install(data, scoreFontTexture);
    setCurrentScene(new Warning());
    if (process.env.NODE_ENV === "development") {
      enterDebugMode();
    }
  });
});

