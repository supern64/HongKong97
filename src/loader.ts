import { Assets } from 'pixi.js';
import Screens from './assets/screens.png';
import EnglishText from './assets/text_en.png';
import JapaneseText from './assets/text_jp.png';
import ChineseText from './assets/text_zh.png';
import Backgrounds from './assets/bg.png';
import Player from './assets/player.png';
import EnemiesAndItems from './assets/eneitems.png';
import Effects from './assets/effects.png';

export default function registerBundles() {
    Assets.addBundle('screens', {
        screens: Screens,
        pointer: EnemiesAndItems
    })
    Assets.addBundle('en', {
        en: EnglishText
    })
    Assets.addBundle('jp', {
        jp: JapaneseText
    })
    Assets.addBundle('zh', {
        zh: ChineseText
    })
    Assets.addBundle('game', {
        backgrounds: Backgrounds,
        player: Player,
        enemiesAndItems: EnemiesAndItems,
        effects: Effects
    })
}