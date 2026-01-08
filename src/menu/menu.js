import {Container, Text} from "pixi.js";
import {computed, effect} from "@preact/signals-core";
import {SIGNALS} from "../signals/signals.js";
import {Health} from "../game/components/health/health.js";
import {MiniBlock} from "./mini-block.js";
import {sender} from "../sender/event-sender.js";

export class Menu extends Container{
    constructor(stage) {
        super();
        stage.addChild(this);


        this.hp = new Health(this, {
            width: 150,
            height: 8,
            alpha: 0.9,
            x: 10,
            y: 2,
        });

        this.addChild(this.hp);

        const style = {
            fontFamily: 'Arial',
            fontSize: 16,
            fill: '#f3ce47',
            stroke: {color: 'rgba(116,41,0,0.7)', width: 2, join: 'round', miterLimit: 10},
            dropShadow: true,
            dropShadowColor: 'rgba(0,0,0,0.45)',
            dropShadowBlur: 2,
            dropShadowAngle: Math.PI / 6,
            dropShadowDistance: 2,
        }

        this.moneyText = new Text({
            text: 'Money: 1000',
            style,
            alpha: 0.8,
            x: 10,
            y: 10
        })
        this.addChild(this.moneyText)

        this.waveText = new Text({
            text: 'Waves: 0',
            style,
            alpha: 0.8,
            x: 10,
            y: 30
        })
        this.addChild(this.waveText)

        this.enemiesDiedText = new Text({
            text: 'Died enemies: 0',
            style,
            alpha: 0.8,
            x: 10,
            y: 50
        })
        this.addChild(this.enemiesDiedText);

        this.enemiesOnBaseText = new Text({
            text: 'Enemies on BASE: 0',
            style,
            alpha: 0.8,
            x: 10,
            y: 70
        })
        this.addChild(this.enemiesOnBaseText);

        this.nextWaveText = new Text({
            text: 'NEXT WAVE',
            style: {
                fontFamily: 'Arial',
                fontSize: 16,
                fill: '#f3ce47',
                stroke: {color: 'rgba(196,4,4,0.7)', width: 16, join: 'round', miterLimit: 10},
            },
            x: 10,
            y: 90
        })

        this.addChild(this.nextWaveText);

        this.nextWaveText.eventMode = 'static';
        this.nextWaveText.cursor = 'pointer';
        this.nextWaveText.on('pointerup', () => sender.send('startNewWave'))


        this.centerButton = new Text({
            text: 'CENTER',
            anchor: {x: 1, y: 0},
            style: {
                fontFamily: 'Arial',
                fontSize: 16,
                fill: '#0783ff',
                stroke: {color: 'rgba(250,215,41,0.7)', width: 10, join: 'round'},
            },
            x: 10,
            y: 10
        })
        this.addChild(this.centerButton);


        this.centerButton.eventMode = 'static';
        this.centerButton.cursor = 'pointer';
        this.centerButton.on('pointerup', () => sender.send('worldMapToCenter'))




        this.miniBlockContainer = new Container();
        this.addChild(this.miniBlockContainer);

        this.miniBlock = new MiniBlock(this.miniBlockContainer);

        effect(() => this.nextWaveText.visible = !SIGNALS.waveInProcess.value);
        effect(() => this.updateMoney(SIGNALS.money.value))
        effect(() => this.updateWave(SIGNALS.wave.value))
        effect(() => this.updateDiedEnemies(SIGNALS.diedEnemies.value))
        effect(() => this.updateEnemiesOnBase(SIGNALS.enemiesOnBase.value));
        effect(() => this.hp.set(SIGNALS.hp.value))

        this.onResize();
        sender.on('resize', this.onResize);
    }

    onResize =() => {
        this.miniBlockContainer.x = window.innerWidth - 260;
        this.miniBlockContainer.y = window.innerHeight - 260;

        this.centerButton.x = window.innerWidth - 10;
    }

    updateMoney(money){
        this.moneyText.text = `Money: ${money}`
    }
    updateWave(wave){
        this.waveText.text = `Waves: ${wave}`
    }
    updateDiedEnemies(amount){
        this.enemiesDiedText.text = `Died enemies: ${amount}`
    }
    updateEnemiesOnBase(amount){
        this.enemiesOnBaseText.text = `Enemies on BASE: ${amount}`
    }
}