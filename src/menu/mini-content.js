import {Container, Text} from "pixi.js";
import {effect} from "@preact/signals-core";
import {SIGNALS} from "../signals/signals.js";

export class MiniContent extends Container{
    constructor(stage) {
        super();
        stage.addChild(this);

        this.position.set(25, 25);

        this.text = new Text({
            style:{
                fill: 0xffffff,
                fontFamily: 'Arial',
                fontSize: 14,
                wordWrap: true,
                wordWrapWidth: 220,
                align: 'center'
            }
        })

        this.addChild(this.text);

        this.stop = effect(() => this.text.text = SIGNALS.fastText.value);
    }
    destroy(options) {
        this.stop();
        this.text.destroy();
        this.text = null;
        super.destroy(options);

    }
}