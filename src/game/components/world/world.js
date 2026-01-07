import {Container} from "pixi.js";
import {gsap} from "gsap";
import {sender} from "../../../sender/event-sender.js";
import {createTower} from "../towers/tower-builder.js";
import {SIGNALS} from "../../../signals/signals.js";
import {createEnemy} from "../enemies/enemy-builder.js";
import {wavesMap} from "../../../config/waves-map.js";
import {Airport} from "../aviation/airport.js";
import {MinesFactory} from "../mines/mines-factory.js";

window.gsap = gsap;

export class World extends Container{
    constructor(stage) {
        super();
        stage.addChild(this);
        this.sortableChildren = true;

        sender.on('createBuilding', ({type, position, costType}) => {
            const cost = SIGNALS[costType].value;
            if(SIGNALS.money.value < cost) return console.warn('not enough money')
            SIGNALS.money.value -= cost;

            switch (type) {
                case 'airPort': {
                    SIGNALS.buildingsAmount.value++;
                    return new Airport(this, position)
                }
                case 'mines': {
                    SIGNALS.buildingsAmount.value++;
                    return new MinesFactory(this, position)
                }
                case 'rocket': {
                    return createTower(this, type, position);
                }
                case 'bullet': {
                    return createTower(this, type, position);
                }
            }

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