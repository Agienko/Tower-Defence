import './style.css';
import {gsap} from "gsap";
import {PixiPlugin} from "gsap/PixiPlugin";
import * as PIXI from 'pixi.js';
import {Application, Assets} from "pixi.js";
import {Game} from "./game/game.js";
import {sound} from "@pixi/sound";
import {manifest} from "./config/manifest.js";
import {Menu} from "./menu/menu.js";

gsap.registerPlugin(PixiPlugin);
PixiPlugin.registerPIXI(PIXI);

export const app = new Application();

(async () => {
    await app.init({
        resolution: devicePixelRatio*2,
        autoDensity: true,
        antialias: false,
        preference: 'webgpu',
        backgroundColor: '#89A4A6',
    });
    document.body.append(app.canvas);
    await Assets.init({manifest});
    await Assets.loadBundle(['sounds', 'textures']);
    new Game(app.stage);
    new Menu(app.stage);
})();
globalThis.__PIXI_APP__ = app;
window.addEventListener('focus', () => { // sound resume fix
    const context = sound.context.audioContext;

    if (context.state === 'suspended' || context.state === 'interrupted') {
        const onResume = () => {
            window.removeEventListener('pointerdown', onResume)
            sound.resumeAll();
        }

        window.addEventListener('pointerdown', onResume, { once: true, passive: true });

    }
});
