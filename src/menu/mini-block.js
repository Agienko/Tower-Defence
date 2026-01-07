import {Container, Rectangle, Sprite, Texture} from "pixi.js";
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
            texture: createTexture('275'),
            width: 64,
            height: 64,
            tint: 0xffffff,
            alpha: 0.8,
            x: -20,
            y: -20
        })
        this.switcher.hitArea = new Rectangle(40, 40, 64, 64);

        this.switcher.eventMode = 'static';
        this.switcher.cursor = 'pointer';
        this.switcher.on('pointerover', () => this.switcher.alpha = 1);
        this.switcher.on('pointerout', () => this.switcher.alpha = 0.8);

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