import {Container, Sprite, Texture} from "pixi.js";
import {SIGNALS} from "../signals/signals.js";
import {effect} from "@preact/signals-core";
import {gsap} from "gsap";
import {Health} from "../game/components/health/health.js";
import {MiniContent} from "./mini-content.js";
import {createTexture} from "../helpers/helper.js";

export class MiniBlock extends Container{
    constructor(stage) {
        super();
        stage.addChild(this);

        this.bg = new Sprite({
            texture: Texture.WHITE,
            width: 256,
            height: 256,
            tint: 0x00000,
            alpha: 0.5
        })
        this.addChild(this.bg);

        this.hp = new Health(this, {
            width: 220,
            height: 4,
            alpha: 0.9,
            x: 25,
            y: 4,
        });
        effect(() => this.hp.set(SIGNALS.hp.value))
        this.addChild(this.hp);

        this.switcher = new Sprite({
            texture: createTexture('275'),
            width: 64,
            height: 64,
            tint: 0xffffff,
            alpha: 0.8,
            x: -20,
            y: -20
        })

        this.switcher.eventMode = 'static';
        this.switcher.cursor = 'pointer';
        this.switcher.on('pointerover', () => this.switcher.alpha = 1);
        this.switcher.on('pointerout', () => this.switcher.alpha = 0.8);

        this.switcher.on('pointerup', e => {
            SIGNALS.miniBlockVisible.value = !SIGNALS.miniBlockVisible.value;
        })
        this.addChild(this.switcher);

        this.content = new MiniContent(this);


        this.tween = null;
        this.tween2 = null;
        effect(() => {
            this.content.interactive = SIGNALS.miniBlockVisible.value;
            this.content.eventMode = SIGNALS.miniBlockVisible.value ? 'static' : 'none';
            this.tween?.kill();
            this.tween2?.kill();
            const scale = SIGNALS.miniBlockVisible.value ? 1 : 0.2;
            const pos = SIGNALS.miniBlockVisible.value ? 0 : 204;
            this.tween = gsap.to(this, { x: pos, y: pos,pixi: {scale}, duration: 0.15, ease: 'sine.inOut'})

            const size = SIGNALS.miniBlockVisible.value ? 64 : 350;
            const switcherPox = SIGNALS.miniBlockVisible.value ? -20: -100;
            this.tween2 = gsap.to(this.switcher, {x: switcherPox, y: switcherPox, width: size, height: size, duration: 0.15, ease: 'sine.inOut'})

        })

        this.eventMode = 'static';
    }

}