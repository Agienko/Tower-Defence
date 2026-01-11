import {gsap} from "gsap";
import {AbstractTower} from "../abstract-tower.js";
import {MiniGunBall} from "./mini-gun-ball.js";
import {shortestRotationRad} from "../../../../helpers/helper.js";


const params = {
    skin: {
        body: '180',
        turret: '250',
    },
    armor: 1,
    detectionRadius: 350,
    detectionInterval: 1.5,
    accuracyRadius: 16,
    aimingTime: 0.3,
    bullet: {
        attackTime: 0.1,
        damageRadius: 32,
        damage: 22,
    }
}



export class MiniGunTower extends AbstractTower{
    constructor(stage) {
        super(stage, params, MiniGunBall);
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

                for(let i = 0; i < 8; i++){
                    const tween = gsap.delayedCall(0.15*i, () => {
                        const bullet = new this.BulletClass(this.stage, params.bullet, i%4 === 0);
                        const res = this.shiftShot(from, to, 16* (i%2 === 0 ? 1 : -1), 96);

                        const killObj = bullet.start({from: res.from, to: res.to, rotation, stage: this.stage}, () => {
                            if(this.destroyed || i !== 7) return;
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