import {gsap} from "gsap";
import {AbstractTower} from "../abstract-tower.js";
import {RocketBall} from "./rocket-ball.js";
import {shortestRotationRad} from "../../../../helpers/helper.js";


const params = {
    skin: {
        body: '181',
        turret: '249',
    },
    armor: 1,
    detectionRadius: 350,
    detectionInterval: 1.5,
    accuracyRadius: 32,
    aimingTime: 0.3,
    bullet: {
        attackTime: 0.15,
        damageRadius: 32,
        damage: 36,
    }
}



export class BulletTower extends AbstractTower{
    constructor(stage) {
        super(stage, params, RocketBall);
        this.stage = stage;
        this.bulletKillObj = [];

    }

    attack(to){
        if(this.bulletKillObj.length) return;
        this.idleTween?.kill();
        this.attackTween?.kill();

        const from = this.stage.toLocal(this.turret.position,this);
        const rotationTo = Math.PI/2 + Math.atan2(to.y - from.y, to.x - from.x);
        const rotation = shortestRotationRad(this.turret.rotation, rotationTo)

        this.attackTween = gsap.to(this.turret, {rotation, duration: this.params.aimingTime, onComplete: () => {
                const from = this.stage.toLocal(this.bullet.body.position,this.bullet);

                for(let i = 0; i < 3; i++){
                    const tween = gsap.delayedCall(0.1*i, () => {
                        const bullet = new this.BulletClass(this.stage, params.bullet, i=== 1);
                        const killObj = bullet.start({from, to, rotation, stage: this.stage}, () => {
                            if(this.destroyed || i !== 2) return;
                            this.bulletKillObj.forEach(obj => obj?.kill());
                            this.bulletKillObj.length = 0;
                            this.startIdle();
                            this.detectEnemyCycle(0.5)
                        })
                        this.bulletKillObj.push(killObj)
                    })
                    this.bulletKillObj.push(tween)
                }

            }});
    }

    destroy(options) {
        this.bulletKillObj.forEach(obj => obj.kill());
        this.bulletKillObj = null;
        super.destroy(options);
    }

}