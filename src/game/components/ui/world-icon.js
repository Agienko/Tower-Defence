import {Container, Graphics, Sprite, Text, Texture} from "pixi.js";
import {createTexture} from "../../../helpers/helper.js";

import {sender} from "../../../sender/event-sender.js";
import {effect} from "@preact/signals-core";
import {SIGNALS} from "../../../signals/signals.js";
import {MiniBlockIcon} from "./bini-block-content/mini-block-icon.js";

export class WorldIcon extends Container{
    constructor(stage, descriptor, activeIcon) {
        super();
        this.descriptor = descriptor;
        this.activeIcon = activeIcon;
        this.pos = {x: descriptor.position.i * 128, y: descriptor.position.j * 128 };
        stage.addChild(this);

        this.position.set(this.pos.x, this.pos.y);

        this.body = new Sprite({
            texture: createTexture(descriptor.name),
            width: 128,
            height: 128
        });
        this.addChild(this.body);

        this.bg = new Sprite({
            texture:Texture.WHITE,
            width: 128,
            height: 128,
            alpha: 0.3,
            // blendMode: 'screen'
        })
        this.addChild(this.bg);

        this.eventMode = 'static';
        this.cursor = 'pointer';
        this.on('pointerdown', e => e.stopPropagation());

        this.on('pointerover', () => this.body.alpha = 1);
        this.on('pointerout', () => this.body.alpha = 0.8);

        this.on('pointerup', e => {
            e.stopPropagation();
            this.activeIcon.value = this;
            SIGNALS.miniBlockVisible.value = true;
            const content = this.createContentForMiniBlock();
            sender.send('insertToMiniBlock', content)
        })

        effect(() => {
            this.bg.visible = this.activeIcon.value === this
        })

        effect(() => {
            this.eventMode = SIGNALS.waveInProcess.value ? 'none' : 'static';
        })
    }
    createContentForMiniBlock(){
        const content = new Container();
        content.x = 20

        const text = new Text({
            text: this.descriptor.text,
            anchor: {x: 0.5, y: 0.5},
            style: {
                fontSize: 18,
                fill: 0xffffff
            },
            x: 84,
            y: 0,
        })

        this.descriptor.icons.forEach((icon, i) => {
            const miniBlockIcon = new MiniBlockIcon(content, {
                ...icon, pos: this.pos, costType: this.descriptor.costType,
            })
            const colAmount = 2;
            const row = Math.floor(i / colAmount);
            const col = i % colAmount;

            miniBlockIcon.x = 10 + col*84
            miniBlockIcon.y = 24 + row*84
        })

        const cost = SIGNALS[this.descriptor.costType].value;
        const isEnoughMoney = SIGNALS.money.value >= cost;
        const costText = new Text({
            text: `${this.descriptor.costText}${cost}$ ${isEnoughMoney ? '' : 'not enough money'}`,
            anchor: {x: 0.5, y: 0.5},
            style: {
                fontSize: 16,
                fill: isEnoughMoney ? 0x00ff00 : 0xee0000,
                align: 'center',
                wordWrap: true,
                wordWrapWidth: 200
            },
            x: 84,
            y: 196,
        })

        content.addChild(text, costText);

        return content;
    }
}