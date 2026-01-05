
import {SIGNALS} from "../../../signals/signals.js";
import {Solder} from "./solder/solder.js";
import {Tank} from "./tank/tank.js";

const towerMap = {
    'solder': Solder,
    'tank': Tank
}

export const createEnemy = (stage, type, amount) => {
    const Enemy = towerMap[type];
    if(!Enemy) return console.error('enemy not found');
    SIGNALS.enemiesAmount.value += amount;
    for(let i = 0; i < amount; i++)new Enemy(stage, i);

}