import {AlphaFilter, Container, Sprite} from "pixi.js";
import {createTexture} from "../../../helpers/helper.js";
import {gsap} from "gsap";
import {sender} from "../../../sender/event-sender.js";
import {effect, signal} from "@preact/signals-core";
import {SIGNALS} from "../../../signals/signals.js";



export class BuildingCreateIcon extends Container{
    constructor(stage, descriptor, activeIcon) {
        super();

        this.activeIcon = activeIcon;
        this.pos = {x: descriptor.position.i * 128, y: descriptor.position.j * 128 };
        stage.addChild(this);

        this.position.set(this.pos.x, this.pos.y);

        this.iconsContainer = new Container();
        this.iconsContainer.y = 128
        this.addChild(this.iconsContainer);

        this.airPortFilter = new AlphaFilter({alpha: 0.5});
        this.minesFilter = new AlphaFilter({alpha: 0.5});
        this.airPort = new Container();
        this.mines = new Container();
        this.airPort.filters = [this.airPortFilter]
        this.mines.filters = [this.minesFilter]

        this.iconsContainer.addChild(this.airPort, this.mines);

        this.airPortBg = new Sprite({
            texture: createTexture(descriptor.name),
            width: 128,
            height: 128,
        });

        this.airPortIcon = new Sprite({
            texture: createTexture('293'),
            width: 128,
            height: 128,

        })
        this.airPort.addChild(this.airPortBg, this.airPortIcon);
        this.minesBg = new Sprite({
            texture: createTexture(descriptor.name),
            width: 128,
            height: 128,
            y: 128,
        });
        this.minesIcon = new Sprite({
            texture: createTexture('273'),
            width: 128,
            height: 128,
            y: 128,
        })
        this.mines.addChild(this.minesBg, this.minesIcon);
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

            this.activeIcon.value = this;
            this.beasyFlag = true;
            this.tween?.kill();
            this.tween = gsap.to(this.iconsContainer, {pixi: {scaleY: +!this.isOpen}, duration: 0.1, ease: 'sine.inOut', onComplete: () => {
                this.isOpen = !this.isOpen;
                this.beasyFlag = false;

                if(!this.isOpen) return;

                // SIGNALS.miniBlockVisible.value = true;

                const cost = SIGNALS.buildingCost.value;
                const msg = SIGNALS.money.value < cost ? 'not enough money' : ``;
                SIGNALS.fastText.value = `Tower cost +${cost}$ ${msg}`;

            }});
        })

        this.airPort.eventMode = 'static';
        this.airPort.cursor = 'pointer';
        this.airPort.on('pointerover', () => this.airPortFilter.alpha = 1)
        this.airPort.on('pointerout', () => this.airPortFilter.alpha = 0.5)
        this.airPort.on('pointerup', () => {
            this.toDefaultState();
            sender.send('createBuilding', {type: 'airPort', position: this.pos, costType: 'buildingCost'})
        })

        this.mines.eventMode = 'static';
        this.mines.cursor = 'pointer';
        this.mines.on('pointerover', () => this.minesFilter.alpha = 1)
        this.mines.on('pointerout', () => this.minesFilter.alpha = 0.5)
        this.mines.on('pointerup', () => {
            this.toDefaultState();
            sender.send('createBuilding', {type: 'mines', position: this.pos,costType: 'buildingCost'})
        })
        effect(() => this.eventMode = SIGNALS.waveInProcess.value ? 'none' : 'static');

        effect(() => (this.activeIcon.value !== this || SIGNALS.waveInProcess.value) && this.toDefaultState());
    }

    toDefaultState(){
        this.tween?.kill();
        this.isOpen = false;
        this.iconsContainer.scale.set(1, 0);
        this.beasyFlag = false;
    }
}