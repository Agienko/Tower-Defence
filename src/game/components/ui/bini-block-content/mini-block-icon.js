import {Container, Graphics, Sprite} from "pixi.js";
import {createTexture} from "../../../../helpers/helper.js";
import {SIGNALS} from "../../../../signals/signals.js";
import {sender} from "../../../../sender/event-sender.js";

export class MiniBlockIcon extends Container{
    constructor(stage, descriptor) {
        super();
        this.stage = stage;
        this.descriptor = descriptor;
        stage.addChild(this);

        this.frame = new Graphics();
        this.frame.rect(0, 0, 64, 64);
        this.frame.stroke({color: "#8f8f8f", width: 4});
        this.frame.fill({color: "#dddddd", alpha: 1});

        this.icon = new Sprite({
            texture: createTexture(this.descriptor.icon),
            width: 64,
            height: 64,
        })

        this.eventMode = 'static';
        this.cursor = 'pointer';

        this.on('pointerup', () => {
            const cost = SIGNALS[this.descriptor.costType].value;
            const isEnoughMoney = SIGNALS.money.value >= cost;
            if(!isEnoughMoney) return;
            this.stage.destroy({children: true});
            SIGNALS.miniBlockVisible.value = false;
            sender.send('createBuilding', {type: this.descriptor.type, position: this.descriptor.pos, costType: this.descriptor.costType})
        });

        this.addChild(this.frame, this.icon);
    }
}