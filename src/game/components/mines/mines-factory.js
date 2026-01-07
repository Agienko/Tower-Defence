import {Airport} from "../aviation/airport.js";
import {gsap} from "gsap";
import {MineCircle} from "./mine-circle.js";

const params = {
    skin: {
        body: '180',
        turret: '273',
        protectIcon: '275'
    },
    armor: 2,
    detectionRadius: 100,
    detectionInterval: 5,
    accuracyRadius: 16,
    aimingTime: 1,
    bullet: {
        attackTime: 1,
        damageRadius: 40,
        damage: 40,
    }
}

export class MinesFactory extends Airport{
    constructor(stage, position) {
        super(stage, position, params);
        this.zIndex = 0;
    }
    startIdle(delay = 3){
        this.idleTween?.kill();
        this.turret.alpha = 0.8;
        this.idleTween = gsap.to(this.turret, {alpha: 0.2, delay, repeat: -1, yoyo: true, duration: 1, ease: 'sine.inOut'});
    }
    createProtectCircle(){
        return new MineCircle(this, this.params)
    }
    detectEnemyCycle() {
    }
}