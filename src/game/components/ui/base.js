import {Container, Sprite, Text} from "pixi.js";
import {createTexture} from "../../../helpers/helper.js";
import {SIGNALS} from "../../../signals/signals.js";

export class Base extends Container{
    constructor(stage, descriptor) {
        super();
        stage.addChild(this);
        this.base = new Sprite({
            texture: createTexture('269'),
            width: 128*2,
            height: 128*2,
        });
        this.text = new Text({
            text: 'BASE',
            anchor: {x: 0.5, y: 0.5},
            style:{
                fill: '#867979',
                fontFamily: 'Arial',
                fontSize: 34,
                fontWeight: 'bold',
            },
            alpha: 0.8,
            x: 128,
            y: 128
        })

        this.addChild(this.base, this.text);

        this.position.set(128*15, 128*5 + 64);

        this.eventMode = 'static';
        this.cursor = 'pointer';
        this.on('pointerup', () => {
            SIGNALS.miniBlockVisible.value = true;
            SIGNALS.fastText.value = 'BASE';
        })
    }
}