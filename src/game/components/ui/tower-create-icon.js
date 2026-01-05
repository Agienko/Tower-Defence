import {AlphaFilter, Container, Sprite} from "pixi.js";
import {createTexture} from "../../../helpers/helper.js";
import {gsap} from "gsap";
import {sender} from "../../../sender/event-sender.js";
import {effect, signal} from "@preact/signals-core";
import {SIGNALS} from "../../../signals/signals.js";

const activeInstance = signal(null);

export class TowerCreateIcon extends Container{
    constructor(stage, descriptor) {
        super();
        this.pos = {x: descriptor.position.i * 128, y: descriptor.position.j * 128 };
        stage.addChild(this);

        this.position.set(this.pos.x, this.pos.y);

        this.iconsContainer = new Container();
        this.iconsContainer.y = 128
        this.addChild(this.iconsContainer);

        this.rocketFilter = new AlphaFilter({alpha: 0.5});
        this.bulletFilter = new AlphaFilter({alpha: 0.5});
        this.rocket = new Container();
        this.bullet = new Container();
        this.rocket.filters = [this.rocketFilter]
        this.bullet.filters = [this.bulletFilter]

        this.iconsContainer.addChild(this.rocket, this.bullet);

        this.rocketBg = new Sprite({
            texture: createTexture(descriptor.name),
            width: 128,
            height: 128,
        });

        this.rocketIcon = new Sprite({
            texture: createTexture('206'),
            width: 128,
            height: 128,

        })
        this.rocket.addChild(this.rocketBg, this.rocketIcon);
        this.bulletBg = new Sprite({
            texture: createTexture(descriptor.name),
            width: 128,
            height: 128,
            y: 128,
        });
        this.bulletIcon = new Sprite({
            texture: createTexture('249'),
            width: 128,
            height: 128,
            y: 128,
        })
        this.bullet.addChild(this.bulletBg, this.bulletIcon);
        this.iconsContainer.scale.set(1, 0);

        this.body = new Sprite({
            texture: createTexture(descriptor.name),
            width: 128,
            height: 128,
            alpha: 0.5,
        });
        this.addChild(this.body);
        this.tween = null

        this.body.eventMode = 'static';
        this.body.cursor = 'pointer';
        this.body.on('pointerover', () => this.body.alpha = 1);
        this.body.on('pointerout', () => this.body.alpha = 0.5);
        this.beasyFlag = false;
        this.isOpen = false;
        this.body.on('pointerup', () => {
            if(this.beasyFlag) return;

            activeInstance.value = this;
            this.beasyFlag = true;
            this.tween?.kill();
            this.tween = gsap.to(this.iconsContainer, {pixi: {scaleY: +!this.isOpen}, duration: 0.1, ease: 'sine.inOut', onComplete: () => {
                this.isOpen = !this.isOpen;
                this.beasyFlag = false;

                const cost = SIGNALS.towerCost.value;
                const msg = SIGNALS.money.value < cost ? 'not enough money' : ``;
                SIGNALS.fastText.value = `Tower cost +${cost}$ ${msg}`;

            }});
        })

        this.rocket.eventMode = 'static';
        this.rocket.cursor = 'pointer';
        this.rocket.on('pointerover', () => this.rocketFilter.alpha = 1)
        this.rocket.on('pointerout', () => this.rocketFilter.alpha = 0.5)
        this.rocket.on('pointerup', () => {
            this.toDefaultState();

            sender.send('createTower', {type: 'rocket', position: this.pos})
        })

        this.bullet.eventMode = 'static';
        this.bullet.cursor = 'pointer';
        this.bullet.on('pointerover', () => this.bulletFilter.alpha = 1)
        this.bullet.on('pointerout', () => this.bulletFilter.alpha = 0.5)
        this.bullet.on('pointerup', () => {
            this.toDefaultState();
            sender.send('createTower', {type: 'bullet', position: this.pos})
        })
        effect(() => this.eventMode = SIGNALS.waveInProcess.value ? 'none' : 'static');

        effect(() => (activeInstance.value !== this || SIGNALS.waveInProcess.value) && this.toDefaultState());
    }

    toDefaultState(){
        this.tween?.kill();
        this.isOpen = false;
        this.iconsContainer.scale.set(1, 0);
        this.beasyFlag = false;
    }
}