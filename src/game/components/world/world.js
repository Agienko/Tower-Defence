import {Container} from "pixi.js";
import {gsap} from "gsap";
import {sender} from "../../../sender/event-sender.js";
import {createTower} from "../towers/tower-builder.js";
import {SIGNALS} from "../../../signals/signals.js";
import {createEnemy} from "../enemies/enemy-builder.js";
import {wavesMap} from "../../../config/waves-map.js";




export class World extends Container{
    constructor(stage) {
        super();
        stage.addChild(this);

        // gsap.globalTimeline.timeScale(10);

        sender.on('createTower', ({type, position}) => {
            const cost = SIGNALS.towerCost.value;
            if(SIGNALS.money.value < cost) return console.warn('not enough money')
            SIGNALS.money.value -= cost;
            createTower(this, type, position)
        })

        sender.on('startNewWave', () => {
            SIGNALS.timeLineWaveInProcess.value = true;
            const timeLine = gsap.timeline({
                onComplete: () => SIGNALS.timeLineWaveInProcess.value = false
            });

            const map = wavesMap[SIGNALS.wave.value++] ?? wavesMap.at(-1);

            map.forEach(({type, count, duration}) => {
                timeLine.call(() => createEnemy(this, type, count))
                timeLine.to({}, {duration})
            })

        })

    }
}