import {gsap} from "gsap";
import {Rocket} from "./rocket.js";
import {AbstractTower} from "../abstract-tower.js";


const params = {
    skin: {
        body: '181',
        turret: '229',
    },
    armor: 1,
    detectionRadius: 300,
    detectionInterval: 3,
    accuracyRadius: 32,
    aimingTime: 0.5,
    bullet: {
        attackTime: 1,
        damageRadius: 64,
        damage: 50,
    }
}

export class RocketTower extends AbstractTower{
    constructor(stage) {
        super(stage, params, Rocket);
        this.BulletClass = Rocket;
    }

    attack(to){
        if(!this.bullet) return;
        this.idleTween?.kill();
        this.attackTween?.kill();

        const from = this.stage.toLocal(this.bullet.position, this.turret );
        const rotation = Math.PI/2 + Math.atan2(to.y - from.y, to.x - from.x);

        this.attackTween = gsap.to(this.turret, {rotation, duration: params.aimingTime, onComplete: () => {
                this.bulletKillObj = this.bullet.start({from, to, rotation, stage: this.stage}, () => {
                    if(this.destroyed) return;
                    this.bullet = new this.BulletClass(this.turret, params.bullet);
                    this.startIdle();
                    this.detectEnemyCycle()
                });
                this.bullet = null
            }});
    }

}