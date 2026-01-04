import {Container, Graphics, Sprite} from "pixi.js";
import {circlesCollide, createTexture, randomFromArr, randomMinMax} from "../../../helpers/helper.js";
import {gsap} from "gsap";
import {Enemy} from "../enemy/enemy.js";
import {RocketBall} from "./rocket-ball.js";
import {Health} from "../health/health.js";
import {Tank} from "../tank/tank.js";
import {sender} from "../../../sender/event-sender.js";

export class Tower2 extends Container{
    constructor(stage) {
        super();
        this.stage = stage;

        this.detectRadius = 32


        stage.addChild(this);
        this.body = new Sprite({
            texture: createTexture('181'),
            width: 128,
            height: 128
        })
        this.body.anchor.set(0.5);
        this.body.position.set(64, 64);
        this.addChild(this.body)
        this.turet = new Sprite({
            texture: createTexture('249'),
            width: 128,
            height: 128
        })
        this.turet.anchor.set(0.5);
        this.turet.position.set(64, 64);
        this.addChild(this.turet);

        this.health = new Health(this, {
            width: 128,
            height: 2,
            alpha: 0.9,
            x: 0,
            y: 0,
        }, () => this.destroy({children: true}));

        this.bullet = new RocketBall(this.turet);
        this.bullet.position.set(0, -64);

        this.graphics = new Graphics();
        this.graphics.circle(0, 0, 300);
        this.graphics.stroke({ width: 2, color: 0xffffff , alpha: 0.7 });
        this.graphics.position.set(64, 64);
        this.addChild(this.graphics);

        this.idleTween = null;
        this.detectTween = null;
        this.attackTween = null
        this.bulletKillObj = [];

        this.startIdle(0);
        this.detectEnemyCycle()

    }

    startIdle(delay = 3){
        this.turet.rotation = this.turet.rotation % (2*Math.PI);
        this.idleTween = gsap.to(this.turet, {rotation: this.turet.rotation + Math.PI, delay, repeat: -1, yoyo: true, duration: 10});
    }

    attack(to){
        if(this.bulletKillObj.length) return;
        this.attackTween?.kill();

        const from = this.stage.toLocal(this.turet.position,this);
        const rotation = Math.PI/2 + Math.atan2(to.y - from.y, to.x - from.x);

        this.attackTween = gsap.to(this.turet, {rotation, duration: 0.3, onComplete: () => {
                const from = this.stage.toLocal(this.bullet.body.position,this.bullet);

                for(let i = 0; i < 3; i++){
                    const tween = gsap.delayedCall(0.1*i, () => {
                        const bullet = new RocketBall(this.stage, i=== 1);
                        const killObj = bullet.start({from, to, rotation, stage: this.stage}, () => {
                            if(this.destroyed || i !== 2) return;
                            this.bulletKillObj.length = 0;
                            this.startIdle();
                            this.detectEnemyCycle(0.5)
                        })
                        this.bulletKillObj.push(killObj)
                    })
                    this.bulletKillObj.push(tween)
                }



                //
                // this.bulletKillObj = this.bullet.start({from, to, rotation, stage: this.stage}, () => {
                //     if(this.destroyed) return;
                //     this.bullet = new RocketBall(this.turet);
                //     this.bullet.position.set(0, -64);
                //     // this.startIdle();
                //     // this.detectEnemyCycle()
                // });
                // this.bullet = null
            }});
    }


    detectEnemyCycle(duration = 1){

        this.graphics.alpha = 0.7;
        this.graphics.scale.set(0)


        this.detectTween = gsap.to(this.graphics, {pixi: {scale: 1, alpha: 0}, delay: randomMinMax(0.3, 0.4), duration, ease: 'sine.out', onComplete: () => {
                const hasEnemy = this.#detect();
                if(hasEnemy) return
                this.detectEnemyCycle()
            }});
    }

    #detect(){

        const tower = this.stage.toLocal(this.body.position, this);

        // const circle = new Graphics();
        // circle.circle(tower.x, tower.y, 300);
        // circle.fill({ color: 0xff0000, alpha: 0.5 });
        // this.stage.addChild(circle);
        // setTimeout(() => circle.destroy(), 1000);


        return this.stage.children.some(child => {

            if(child instanceof Enemy || child instanceof Tank){

                const enemy = this.stage.toLocal(child.body.position, child);

                // const circle = new Graphics();
                // circle.circle(enemy.x, enemy.y, child.detectRadius);
                // circle.fill({ color: 0x00ff00, alpha: 0.5 });
                // this.stage.addChild(circle);

                if (circlesCollide(tower.x, tower.y, 350, enemy.x, enemy.y, child.detectRadius)){

                    // const circle = new Graphics();
                    // circle.circle(enemy.x, enemy.y, child.detectRadius);
                    // circle.fill({ color: 0x00ff00, alpha: 0.5 });
                    // this.stage.addChild(circle);

                    this.idleTween?.kill();
                    this.detectTween?.kill();
                    this.attack(enemy);
                    return true;
                }
            }
        })
    }

    destroy(options) {
        const point = this.stage.toLocal(this.body.position, this);
        sender.send('createRemain', {point, size: 128, withExplode: true})
        this.bulletKillObj.forEach(obj => obj.kill());
        this.bulletKillObj = null;
        this.bulletKillObj?.kill();
        this.idleTween?.kill();
        this.detectTween?.kill();
        this.attackTween?.kill();
        this.idleTween = null;
        this.detectTween = null;
        this.attackTween = null;
        this.bulletKillObj = null;
        super.destroy(options);
    }

}