import {RocketTower} from "./rocket-tower/rocket-tower.js";
import {BulletTower} from "./bullet-tower/bullet-tower.js";
import {SIGNALS} from "../../../signals/signals.js";

const towerMap = {
    'rocket': RocketTower,
    'bullet': BulletTower
}

export const createTower = (stage, type, position) => {
    const TowerClass = towerMap[type];
    if(!TowerClass) return console.error('tower not found');
    const tower = new TowerClass(stage);
    SIGNALS.towersAmount.value++;
    tower.position.set(position.x, position.y);
    return tower;
}