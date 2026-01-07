import {RocketTower} from "./rocket-tower/rocket-tower.js";
import {BulletTower} from "./bullet-tower/bullet-tower.js";
import {SIGNALS} from "../../../signals/signals.js";
import {MiniGunTower} from "./mini-gun-tower/mini-gun-tower.js";
import {DoubleRocketTower} from "./double-rocket-tower/double-rocket-tower.js";

const towerMap = {
    'rocket': RocketTower,
    'bullet': BulletTower,
    'mini-gun': MiniGunTower,
    'double-rocket': DoubleRocketTower
}

export const createTower = (stage, type, position) => {
    const TowerClass = towerMap[type];
    if(!TowerClass) return console.error('tower not found');
    const tower = new TowerClass(stage);
    SIGNALS.towersAmount.value++;
    tower.position.set(position.x, position.y);
    return tower;
}