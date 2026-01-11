
import {SIGNALS} from "../../../signals/signals.js";
import {Solder} from "./solder/solder.js";
import {Tank} from "./tank/tank.js";
import {SolderLaser} from "./solder-laser/solder-laser.js";
import {LaserTank} from "./laser-tank/laser-tank.js";

const towerMap = {
    'solder': Solder,
    'solder-laser': SolderLaser,
    'tank': Tank,
    'laser-tank': LaserTank
}

export const createEnemy = (stage, type, amount, way) => {
    const Enemy = towerMap[type];
    if(!Enemy) return console.error('enemy not found');
    SIGNALS.enemiesAmount.value += amount;
    for(let i = 0; i < amount; i++)new Enemy(stage, i, way);

}