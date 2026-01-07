import {Container, Graphics, Sprite, Text} from "pixi.js";
import {createTexture} from "../../../helpers/helper.js";
import {SIGNALS} from "../../../signals/signals.js";
import {sender} from "../../../sender/event-sender.js";

export class Base extends Container{
    constructor(stage, activeIcon) {
        super();
        this.activeIcon = activeIcon;
        stage.addChild(this);
        this.base = new Sprite({
            texture: createTexture('269'),
            width: 128*2,
            height: 128*2,
        });

        this.circle = new Graphics();
        this.circle.circle(0, 0, 13)
        this.circle.fill({color: 0xff0000, alpha: 1});
        this.circle.position.set(195, 96);
        this.circle.alpha = 0.4;
        this.circle.blendMode = 'add-npm';
        gsap.to(this.circle, {alpha: 0, duration: 1, repeat: -1, ease: 'power2.inOut'})


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

        this.addChild(this.base, this.text, this.circle);

        this.position.set(128*15, 128*5 + 64);

        this.eventMode = 'static';
        this.cursor = 'pointer';
        this.on('pointerdown', e => e.stopPropagation());

        this.on('pointerup', e => {
            e.stopPropagation();
            SIGNALS.miniBlockVisible.value = true;
            this.activeIcon.value = this;

            const content = this.createContentForMiniBlock();
            sender.send('insertToMiniBlock', content)

        })
    }
    createContentForMiniBlock(){
        const content = new Container();

        const staticText = new Text({
            text: 'GLOBAL SPEED:',
            style: {
                fontSize: 12,
                fill: 0x00ff00
            },
            x: 40,
            y: 0,
        })

        const texts = ['x1', 'x2', 'x3', 'x4', 'x5'].map((t, i) => {
            const text = new Text({
                text: t,
                style: {
                    fontSize: 16,
                    fontWeight: 'bold',
                    fill: SIGNALS.globalSpeed.value === i + 1 ? 0x00ff00 : 0x867979
                },
                x: 14 + i*40,
                y: 16,
            })
            text.i = i;
            text.eventMode = 'static';
            text.cursor = 'pointer';
            text.on('pointerup', e => {
                const timeSpeed = i + 1;
                SIGNALS.globalSpeed.value = timeSpeed;
                texts.forEach(txt => txt.style.fill = timeSpeed === txt.i + 1 ? 0x00ff00 : 0x867979)
            })

            return text;
        })


        content.addChild(staticText, ...texts);
        return content;
    }
}