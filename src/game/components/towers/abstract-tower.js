import {Container, Graphics, Sprite} from "pixi.js";
import {gsap} from "gsap";
import {circlesCollide, createTexture, drawCircle, randomMinMax} from "../../../helpers/helper.js";
import {Health} from "../health/health.js";
import {SIGNALS} from "../../../signals/signals.js";
import {sender} from "../../../sender/event-sender.js";

export class AbstractTower extends Container{
    constructor(stage, params, BulletClass) {
        super();
        this.zIndex = 1;
        this.type = 'tower';
        this.stage = stage;
        this.params = params;
        this.BulletClass = BulletClass;

        this.detectRadius = 32

        stage.addChild(this);

        this.createDetectionAnim();

        this.body = new Sprite({
            texture: createTexture(params.skin.body),
            width: 128,
            height: 128
        })
        this.body.anchor.set(0.5);
        this.body.position.set(64, 64);
        this.addChild(this.body)

        this.turret = new Container();

        const turretSprite = new Sprite({
            texture: createTexture(params.skin.turret),
            width: 128,
            height: 128
        })
        turretSprite.anchor.set(0.5);
        this.turret.position.set(64, 64);
        this.turret.addChild(turretSprite);
        this.addChild(this.turret);

        this.health = new Health(this, {
            protection: params.armor,
            width: 120,
            height: 2,
            alpha: 0.9,
            x: 4
        }, () => this.destroy({children: true}));

        this.bullet = this.createBullet();

        this.idleTween = null;
        this.detectTween = null;
        this.attackTween = null
        this.bulletKillObj = null;

        this.startIdle(0);
        this.detectEnemyCycle()

        //
        // this._onPointerDown = this.onPointerDown.bind(this);
        // this._onPointerMove = this.onPointerMove.bind(this);
        // this._onPointerUp = this.onPointerUp.bind(this);



    }
    // onPointerDown(e){
    //
    // }
    // onPointerMove(e){
    // }
    // onPointerUp(e){
    //
    // }


    shiftShot(from, to, sideDelta, forwardDelta) {
        const dx = to.x - from.x;
        const dy = to.y - from.y;

        const len = Math.hypot(dx, dy) || 1;

        const ux = dx / len;
        const uy = dy / len;

        const nx = -uy;
        const ny =  ux;

        const sx = nx * sideDelta;
        const sy = ny * sideDelta;

        const fx = ux * forwardDelta;
        const fy = uy * forwardDelta;

        return {
            from: {x: from.x + sx + fx, y: from.y + sy + fy},
            to: {x: to.x + sx, y: to.y + sy},
        };
    }

    createBullet(){
        return new this.BulletClass(this.turret, this.params.bullet)
    }

    createDetectionAnim(){
        this.graphics = new Graphics();

        this.graphics.circle(0, 0, this.params.detectionRadius);
        this.graphics.stroke({ width: 2, color: 0xffffff , alpha: 0.7 });
        this.graphics.position.set(64, 64);

        this.graphics.scale.set(0)

        this.graphicsTween = gsap.to(this.graphics, {pixi: {scale: 1, alpha: 0}, delay: 1, repeatDelay: 1, duration: 1.5, repeat: -1, ease: 'sine.out'});
        this.addChild(this.graphics);
    }


    startIdle(delay = 3){
        this.turret.rotation = this.turret.rotation % (2*Math.PI);
        this.idleTween = gsap.to(this.turret, {rotation: this.turret.rotation + 2*Math.PI, delay, repeat: -1, yoyo: true, duration: 20, ease: 'sine.inOut'});
    }

    detectEnemyCycle(){
        this.detectTween = gsap.delayedCall(this.params.detectionInterval,  () => {
            const enemy = this.detect();
            if(enemy){
                this.detectTween?.kill();
                this.attack(enemy);
            } else {
                this.detectEnemyCycle()
            }
        });
    }

    attack(){
        console.warn('Need recreate attack')
    }

    getMyPosition(){
        return this.stage.toLocal(this.body.position, this);
    }

    detect(){
        const tower = this.getMyPosition();
        if(!tower) return null;
        // const circle = drawCircle(tower.x, tower.y, this.params.detectionRadius, 0xff0000)
        // this.stage.addChild(circle);
        // setTimeout(() => circle.destroy(), 1000);

        for(let i = 0; i < this.stage.children.length; i++) {
            const child = this.stage.children[i];
            if(child.type !== 'enemy') continue;

            const enemy = this.stage.toLocal(child.body.position, child);
            const accuracyRadius = this.params.accuracyRadius;
            const hitErrorEnemy = {
                x: enemy.x + randomMinMax(-accuracyRadius, accuracyRadius),
                y: enemy.y + randomMinMax(-accuracyRadius, accuracyRadius),
            }
            // const circle = drawCircle(enemy.x, enemy.y, child.detectRadius, 0x00ff00)
            // this.stage.addChild(circle);

            if (!circlesCollide(tower.x, tower.y, this.params.detectionRadius, hitErrorEnemy.x, hitErrorEnemy.y, child.detectRadius)) continue;
            // const circle = drawCircle(enemy.x, enemy.y, child.detectRadius, 0x00ff00)
            // this.stage.addChild(circle);
            return hitErrorEnemy;
        }
        return null;
    }

    preDestroy(){
        SIGNALS.towersAmount.value--;
    }

    destroy(options) {
        this.preDestroy();
        const point = this.stage.toLocal(this.body.position, this);
        sender.send('createRemain', {point, size: 128, withExplode: true})
        this.graphicsTween?.kill()
        this.bulletKillObj?.kill();
        this.idleTween?.kill();
        this.detectTween?.kill();
        this.attackTween?.kill();
        this.graphicsTween = null;
        this.idleTween = null;
        this.detectTween = null;
        this.attackTween = null;
        this.bulletKillObj = null;
        super.destroy(options);
    }

}