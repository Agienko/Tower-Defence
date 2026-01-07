import {Container, Graphics, Sprite, Text} from "pixi.js";
import {createTexture} from "../../../helpers/helper.js";

import {sender} from "../../../sender/event-sender.js";
import {effect} from "@preact/signals-core";
import {SIGNALS} from "../../../signals/signals.js";

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
            texture: createTexture('183'),
            width: 128,
            height: 128,
            alpha: 0.5
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
        const rocketFrame = new Graphics();
        rocketFrame.rect(0, 0, 64, 64);
        rocketFrame.stroke({color: "#8f8f8f", width: 4});
        rocketFrame.fill({color: "#dddddd", alpha: 1});
        const bulletFrame = new Graphics();


        bulletFrame.rect(0, 0, 64, 64);
        bulletFrame.stroke({color: "#8f8f8f", width: 4});
        bulletFrame.fill({color: "#dddddd", alpha: 1});
        bulletFrame.x = 104;
        content.addChild(rocketFrame, bulletFrame);
        const rocketIcon = new Sprite({
            texture: createTexture(this.descriptor.icons[0].icon),
            width: 64,
            height: 64,
        })
        const bulletIcon = new Sprite({
            texture: createTexture(this.descriptor.icons[1].icon),
            width: 64,
            height: 64,
            x: 104
        })

        const text = new Text({
            text: this.descriptor.text,
            anchor: {x: 0.5, y: 0.5},
            style: {
                fontSize: 24,
                fill: 0xffffff
            },
            x: 104 - 20,
            y: 96,
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
            x: 104 - 20,
            y: 96 + 36,
        })

        rocketIcon.eventMode = 'static';
        bulletIcon.eventMode = 'static';
        rocketIcon.cursor = 'pointer';
        bulletIcon.cursor = 'pointer';

        rocketIcon.on('pointerup', () => {
            if(!isEnoughMoney) return;
            content.destroy({children: true});
            SIGNALS.miniBlockVisible.value = false;
            sender.send('createBuilding', {type: this.descriptor.icons[0].type, position: this.pos, costType: this.descriptor.costType})
        });
        bulletIcon.on('pointerup', () => {
            if(!isEnoughMoney) return;
            content.destroy({children: true});
            SIGNALS.miniBlockVisible.value = false;
            sender.send('createBuilding', {type: this.descriptor.icons[1].type, position: this.pos, costType: this.descriptor.costType})
        });

        content.addChild(rocketIcon, bulletIcon, text, costText);
        return content;
    }
}