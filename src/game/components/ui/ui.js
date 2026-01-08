import {Container, Graphics, Sprite, Text} from "pixi.js";
import {buildingsMap} from "../../../config/buildings-map.js";
import {WorldIcon} from "./world-icon.js";

import {effect, signal} from "@preact/signals-core";
import {sender} from "../../../sender/event-sender.js";
import {Base} from "./base.js";
import {createTexture} from "../../../helpers/helper.js";
import {SIGNALS} from "../../../signals/signals.js";

export class Ui extends Container{
    constructor(stage) {
        super();
        stage.addChild(this);
        this.activeIcon = signal(null);
        stage.eventMode = 'static';
        stage.on('pointerup', () => {
                this.activeIcon.value = null;
                SIGNALS.miniBlockVisible.value = false;
                sender.send('insertToMiniBlock', null)
        })

        buildingsMap.forEach(descriptor => new WorldIcon(this, descriptor, this.activeIcon))

        this.base = new Base(this, this.activeIcon);

        effect(() => {
            if(SIGNALS.waveInProcess.value){
                this.activeIcon.value = null;
                sender.send('insertToMiniBlock', null)
            }
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