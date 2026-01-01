import {flashBack, resizer} from "../main.js";
import {sound} from "@pixi/sound";

export class GameOver{
    constructor(cb) {
        this.cb = cb;
        flashBack.style.pointerEvents = 'auto';
        flashBack.style.opacity = '0.5';
        flashBack.textContent = 'GAME OVER';

        sound.play('over', {volume: 0.05});
        window.addEventListener('resize', this.onResize);
        flashBack.addEventListener('pointerdown', this.onPointerDown, {once: true});
        this.onResize();
    }

    onPointerDown = () => {
        this.cb?.();
        this.destroy();
    }

    onResize = () => {
        flashBack.style.fontSize = `${64*resizer.scale}px`;
    }

    destroy() {
        flashBack.removeEventListener('pointerdown', this.onPointerDown, {once: true});
        window.removeEventListener('resize', this.onResize);
        flashBack.style.opacity = '0';
        flashBack.textContent = '';
        flashBack.style.pointerEvents = 'none';
        this.cb = null;
    }
}