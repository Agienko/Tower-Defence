import {BlurFilter, Container, Sprite, Texture} from "pixi.js";
import {WIDTH} from "../../constants/constants.js";
import {app, resizer} from "../../main.js";
import {SIGNALS} from "../signals/signals.js";
import {effect} from "@preact/signals-core";
import {randomFromArr} from "../../helpers/helper.js";
import {gsap} from "gsap";
import {sender} from "../../sender/event-sender.js";

export class Bag extends Container{
    constructor(stage){
        super();

        this.stage = stage;

        this.sprite = new Sprite(Texture.from('bag'));
        this.sprite.anchor.set(0.5);
        this.addChild(this.sprite);

        this.shadow = new Sprite({
            texture: Texture.WHITE,
            tint: 0x000000,
            alpha: 0.5,
            width: 38,
            height: 4,
            filters: [new BlurFilter(6)],
            y: 32
        });
        this.shadow.anchor.set(0.5);
        this.addChild(this.shadow);

        this.shits = []


        this.stage.addChild(this);
        this.y = 310;

        app.canvas.addEventListener('pointerdown', this.onUpdatePosX);
        app.canvas.addEventListener('pointermove', this.onUpdatePosX);

        sender.on('shitOnBag', shit => {
            const pos = this.toLocal(shit.position);
            this.addChild(shit)
            shit.stage = this;
            const x = Math.min(Math.max(Math.round(pos.x), -14), 14);
            shit.position.set(x, -7);

            gsap.to(shit.scale, {y: 1.4, duration: 1.2, onComplete: () => {
                gsap.to(shit, {alpha: 0, duration: 1.5, onComplete: () => {
                        shit.destroy({children: true})
                    }})
                // gsap.delayedCall(2, () => shit.destroy({children: true}))
                }})
        })

        effect(() => this.x = SIGNALS.bagX.value);
    }

    onUpdatePosX = e => {
        const rect = app.canvas.getBoundingClientRect();
        const x = (e.x - rect.x) / resizer.scale;
        SIGNALS.bagX.value = Math.min(Math.max(x, 16), WIDTH - 16);
    }
}