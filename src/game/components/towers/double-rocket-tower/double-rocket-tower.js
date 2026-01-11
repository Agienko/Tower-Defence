import {gsap} from "gsap";
import {DoubleRocket} from "./double-rocket.js";
import {AbstractTower} from "../abstract-tower.js";
import {randomMinMax, shortestRotationRad} from "../../../../helpers/helper.js";


const params = {
    skin: {
        body: '181',
        turret: '228',
    },
    armor: 1,
    detectionRadius: 300,
    detectionInterval: 3,
    accuracyRadius: 12,
    aimingTime: 0.8,
    bullet: {
        attackTime: 0.8,
        damageRadius: 64,
        damage: 35,
    }
}

export class DoubleRocketTower extends AbstractTower{
    constructor(stage) {
        super(stage, params, DoubleRocket);
        this.BulletClass = DoubleRocket;
        this.bullet.x = -12;
        this.bullet2 = this.createBullet();
        this.bullet2.x = 12;

        this.attackTween2 = null
        this.bulletKillObj2 = null;
    }

    attack(to){
        if(!this.bullet || !this.bullet2) return;
        this.idleTween?.kill();
        this.attackTween?.kill();

        const from = this.stage.toLocal(this.turret.position, this );
        const rotationTo = Math.PI/2 + Math.atan2(to.y - from.y, to.x - from.x);
        const rotation = shortestRotationRad(this.turret.rotation, rotationTo)
        this.attackTween = gsap.to(this.turret, {rotation, duration: params.aimingTime/2, onComplete: () => {

                const from = this.stage.toLocal(this.bullet.getGlobalPosition());
                this.bulletKillObj = this.bullet.start({from, to: {x: to.x + randomMinMax(-10, 10), y: to.y + randomMinMax(-10, 10)}, rotation, stage: this.stage}, () => {
                    if(this.destroyed) return;
                    this.bullet = new this.BulletClass(this.turret, params.bullet);
                    this.bullet.x = -12;
                });
                this.bullet = null

                this.attackTween = gsap.delayedCall(params.aimingTime/2, () => {
                    const from2 = this.stage.toLocal(this.bullet2.getGlobalPosition());
                    this.bulletKillObj2 = this.bullet2.start({from: from2, to: {x: to.x + randomMinMax(-10, 10), y: to.y + randomMinMax(-10, 10)}, rotation, stage: this.stage}, () => {
                        if(this.destroyed) return;
                        this.bullet2 = new this.BulletClass(this.turret, params.bullet);
                        this.bullet2.x = 12;
                        this.startIdle();
                        this.detectEnemyCycle()
                    });
                    this.bullet2 = null
                })





            }});






        // this.attackTween2 = gsap.to(this.turret, {rotation, duration: params.aimingTime + 0.3, onComplete: () => {


            // }});
    }

    destroy(options) {
        this.bulletKillObj2?.kill();
        this.bulletKillObj2 = null;
        super.destroy(options);
    }

}