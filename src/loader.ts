import { Assets } from '@pixi/assets';
import Screens from './assets/screens.png';
import Backgrounds from './assets/bg.png';
import Player from './assets/player.png';
import EnemiesAndItems from './assets/eneitems.png';
import Effects from './assets/effects.png';

export default function registerBundles() {
    Assets.addBundle('screens', {
        screens: Screens
    })
    Assets.addBundle('game', {
        backgrounds: Backgrounds,
        player: Player,
        enemiesAndItems: EnemiesAndItems,
        effects: Effects
    })
}