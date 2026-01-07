import {ProtectCircle} from "./protect-circle.js";
import {AbstractTower} from "../towers/abstract-tower.js";
import {SIGNALS} from "../../../signals/signals.js";
import {gsap} from "gsap";
import {Plane} from "./plane/plane.js";

const params = {
    skin: {
        body: '182',
        turret: '270',
        protectIcon: '294'
    },
    armor: 2,
    detectionRadius: 100,
    detectionInterval: 5,
    accuracyRadius: 32,
    aimingTime: 1,
    bullet: {
        attackTime: 1,
        damageRadius: 40,
        damage: 40,
    }
}

export class Airport extends AbstractTower{
    constructor(stage, position, param = params) {
        super(stage, param, null);
        this.position.set(position.x, position.y);

        this.eventMode = 'static';
        this.cursor = 'pointer';

        this.savedArea = null;

        this.circle = null;

        this.aimingTimeTimeLine = null;

        this.on('pointerdown', e => {
            this.pointerDownFlag = true;
        })

        this.on('pointerup', e => {
            if(SIGNALS.waveInProcess.value) return;
            if(!this.pointerDownFlag) return;
            this.pointerDownFlag = false;
            if(this.savedArea) {
                this.savedArea.unfixed();
                this.circle = this.savedArea;
                this.savedArea = null;
                const pos = this.toLocal(e.data.global);
                this.circle.position.set(pos.x, pos.y);
                return;
            }
            if(this.circle) {
                this.savedArea = this.circle;
                this.circle = null;
                this.savedArea.fixed()

            } else {
                const pos = this.toLocal(e.data.global);
                this.circle = this.createProtectCircle();
                this.circle.position.set(pos.x, pos.y);
            }

        })
        this.on('globalpointermove', e => {
            if(!this.circle) return;
            const pos = this.toLocal(e.data.global);
            this.circle.position.set(pos.x, pos.y);
            this.pointerDownFlag = false;
        })

    }
    attack(enemyPos) {
        if(!this.savedArea) return null;
        const targetPos = this.stage.toLocal(this.savedArea.position, this);
        this.aimingTimeTimeLine = gsap.timeline();

        this.aimingTimeTimeLine.to({}, {duration: this.params.aimingTime, onComplete: ()=> {
                new Plane(this.stage, this.params).attack({x: targetPos.x, y: targetPos.y - this.params.detectionRadius/2});
            }})
        this.aimingTimeTimeLine.to({}, {duration: 0.1, onComplete: () => {
                new Plane(this.stage, this.params).attack({x: targetPos.x, y: targetPos.y});
            }})
        this.aimingTimeTimeLine.to({}, {duration: 0.1, onComplete: () => {
                new Plane(this.stage, this.params).attack({x: targetPos.x, y: targetPos.y + this.params.detectionRadius/2}, () => {
                    this.detectEnemyCycle()
                });
            }})
    }

    createProtectCircle(){
        return new ProtectCircle(this, this.params)
    }

    getMyPosition() {
        if(!this.savedArea) return null;
        return this.stage.toLocal(this.savedArea.position, this);
    }

    preDestroy(){
        SIGNALS.buildingsAmount.value--;
        this.aimingTimeTimeLine?.kill();
        this.aimingTimeTimeLine = null;
        this.savedArea?.destroy({children: true});
        this.savedArea = null;
        this.circle?.destroy({children: true});
        this.circle = null;
    }

    createBullet() {
        return null;
    }
    createDetectionAnim(){}
}