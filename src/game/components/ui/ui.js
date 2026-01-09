import {Container} from "pixi.js";
import {buildingsMap} from "../../../config/buildings-map.js";
import {WorldIcon} from "./world-icon.js";

import {effect, signal} from "@preact/signals-core";
import {sender} from "../../../sender/event-sender.js";
import {Base} from "./base.js";
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

        sender.on('createBuilding', () => this.activeIcon.value = null)

    }
}