import {Container, Sprite, Texture} from "pixi.js";
import {SIGNALS} from "../signals/signals.js";
import {effect} from "@preact/signals-core";
import {gsap} from "gsap";
import {Health} from "../game/components/health/health.js";
import {MiniContent} from "./mini-content.js";

export class MiniBlock extends Container{
    constructor(stage) {
        super();
        stage.addChild(this);
        this.bg = new Sprite({
            texture: Texture.WHITE, width: 250, height: 250,
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
            texture: Texture.WHITE, width: 20, height: 20,
            tint: 0xffffff,
            alpha: 0.9,
            // x: 230
        })

        this.switcher.eventMode = 'static';
        this.switcher.cursor = 'pointer';

        this.switcher.on('pointerup', () => {
            SIGNALS.miniBlockVisible.value = !SIGNALS.miniBlockVisible.value;
        })
        this.addChild(this.switcher);


        this.content = new MiniContent(this);




        this.tween = null;
        effect(() => {
            this.tween?.kill();
            const value = SIGNALS.miniBlockVisible.value ? 0 :-200;
            const alpha = SIGNALS.miniBlockVisible.value ? 1 : 0.7;
            this.tween = gsap.to(this, { pixi: {pivotX: value, pivotY: value, alpha}, duration: 0.15, ease: 'sine.inOut'})
        })


        this.onResize();
        window.addEventListener('resize', this.onResize.bind(this));

        this.eventMode = 'static';
    }
    onResize(){
        this.x = window.innerWidth - 260;
        this.y = window.innerHeight - 260;
    }
}