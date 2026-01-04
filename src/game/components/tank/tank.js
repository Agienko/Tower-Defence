import {Container, Graphics, Sprite, Ticker} from "pixi.js";
import {circlesCollide, createTexture, randomFromArr, randomMinMax} from "../../../helpers/helper.js";
import {Health} from "../health/health.js";
import {gsap, Power0, Power1, Power2} from "gsap";

import {Tower} from "../tower/tower.js";
import {Rocket} from "../tower/rocket.js";
import {TankRocket} from "./tank-rocket.js";


const debug = (stage, points) => {
    const realPath = new Graphics();
    const pointsGr = new Graphics()
    points.forEach(({x, y}, i) => {
        if(i === 0) return realPath.moveTo(x, y - 1);
        pointsGr.circle(x, y, 4);
        pointsGr.fill(0xffffff, 0.5);
        realPath.lineTo(x, y)
    });
    realPath.stroke({ width: 2, color: 0xffffff, alpha: 0.5 });
    stage.addChild(realPath);
    stage.addChild(pointsGr);
}

const points = [
    {x: 128*3, y: 128*10, angle: -90, duration: 0},
    {x: 128*3, y: 128*6,angle: 0, duration: randomMinMax(58, 62)},
    {x: 128*7, y: 128*6, angle: -90, duration: randomMinMax(58, 62)},
    {x: 128*7, y: 128*2, angle: 0, duration: randomMinMax(58, 62)},
    {x: 128*12, y: 128*2, angle: 90, duration: randomMinMax(58, 62)},
    {x: 128*12, y: 128*8, angle: 0, duration: randomMinMax(58, 62)},
    {x: 128*17, y: 128*8, angle: 0, duration: randomMinMax(58, 62)}
]

export class Tank extends Container{
    constructor(stage, index) {
        super();
        this.stage = stage;

        this.detectRadius = 16

        this.index = index;
        this.colAmount = 3;
        this.row = Math.floor(this.index / this.colAmount);
        this.col = this.index % this.colAmount;

        this.step = 70;
        this.corrX = this.step - this.col * this.step / 2
        this.corrY = this.step - this.row * this.step / 2

        this.savedAngle = 0;

        this.moveTween = null;

        stage.addChild(this);


        this.body = new Container();



        this.bodySprite = new Sprite({
            texture: createTexture('268'),
            width: 32,
            height: 32
        })
        this.bodySprite.anchor.set(0.5);
        this.addChild(this.bodySprite);
        this.addChild(this.body);

        this.gun = new Sprite({
            texture: createTexture('228'),
            width: 16,
            height: 16,
            x: 0,
            y:0,
            angle: 90
        })
        this.gun.anchor.set(0.5, 0.5);



        // this.body.addChild(this.fire);



        this.body.addChild(this.gun);
        this.bullet = new TankRocket(this.body);
        this.bullet.angle = 90;
        // this.bullet.position.set(0, 12);

        this.points = points
        this.health = new Health(this,{
            width: 16,
            height: 2,
            alpha: 0.9,
            x: -8,
            y: -18,
        }, () => {
            this.detectTween?.kill();
            this.detectTween = null;
            this.timeLine?.kill();
            this.timeLine = null;
            this.moveTween?.kill();
            this.moveTween = null;
            this.alpha = 0.5;
            this.health.alpha = 0;
            this.moveTween = gsap.to(this.body, {alpha: 0, duration: 1, onComplete: () => this.destroy({children: true})});
        });

        // debug(stage, points)

        this.position.set(this.points[0].x + this.corrX, this.points[0].y + this.corrY);
        // this.setAngle(this.points[0].angle);
        this.bodySprite.angle = this.points[0].angle;
        this.timeLine = gsap.timeline({paused: true});

        this.points.forEach(({x, y, angle, duration}, i) => {
            if(i === 0) return;
            this.timeLine.to(this, {x: x + this.corrX, y: y + this.corrY, duration: i === 1 ? 1 : duration, ease: Power0.easeIn});
            this.timeLine.to(this.bodySprite, {angle, duration: 0.4, ease: Power1.easeInOut,
                // onStart: () => this.moveTween?.kill(),
                // onComplete: () => this.setAngle(angle)
            })
        })
        this.timeLine.to(this, { alpha: 0, duration: 0.5, onComplete: () => this.destroy({children: true})});

        this.timeLine.play();

        this.detectTween = null;


        this.detectCycle();


    }

    detectCycle(){
        this.detectTween = gsap.delayedCall(randomMinMax(2.9, 3.1), () => {

            const myPoint = this.stage.toLocal(this.gun.position, this.body);
            const detectionRadius = randomMinMax(180, 210);
            // const circle = new Graphics();
            // circle.circle(myPoint.x, myPoint.y, detectionRadius);
            // circle.fill({ color: 0xff0000, alpha: 0.5 });
            // this.stage.addChild(circle);
            // setTimeout(() => circle.destroy(), 1000);


            const hasEnemy = this.stage.children.some(child => {
                if(child instanceof Tower){
                    const enemy = this.stage.toLocal(child.body.position, child);

                    if (circlesCollide(myPoint.x, myPoint.y, detectionRadius, enemy.x, enemy.y, 64)){

                        // const circle = new Graphics();
                        // circle.circle(enemy.x, enemy.y, 64);
                        // circle.fill({ color: 0x00ff00, alpha: 0.5 });
                        // this.stage.addChild(circle);

                        // this.timeLine.pause();
                        this.moveTween?.kill();


                        const hitErrorEnemy = {
                            x: enemy.x + randomMinMax(-32, 32),
                            y: enemy.y + randomMinMax(-32, 32),
                        }

                        const rotation =  Math.atan2(hitErrorEnemy.y - myPoint.y, hitErrorEnemy.x - myPoint.x);

                        this.moveTween = gsap.to(this.body, {rotation, duration: 0.2, onComplete: () => {
                                this.attack(hitErrorEnemy, rotation, () => {
                                    if(this.destroyed) return;
                                    this.detectCycle();
                                    this.bullet = new TankRocket(this.body);
                                    this.bullet.angle = 90;

                                    // if(child.destroyed) return;
                                    // child.health.updateHealth(-0.3)
                                });
                            }})


                        return true;
                    }
                }
            })

            if(hasEnemy) return

            this.detectCycle();


            // if(this.timeLine.paused()){
            //     this.moveTween?.kill();
            //     this.setAngle(this.savedAngle);
            //     this.timeLine.play();
            //
            // }
        })
    }

    attack(to, rotation, onComplete){
        const from = this.stage.toLocal(this.gun.position, this.body );
        //
        // this.fire.visible = true
        // this.moveTween = gsap.delayedCall(0.05, () => this.fire.visible = false)
        //
        // new GunBullet(this.stage, {from, to, rotation, delay: 0, withExplode: true})
        // new GunBullet(this.stage, {from, to, rotation,  delay: 0.08})
        // new GunBullet(this.stage, {from, to, rotation,  delay: 0.16, onComplete})
        this.bulletKillObj = this.bullet.start({from, to, rotation: rotation + Math.PI/2, stage: this.stage}, onComplete);
    }

    setAngle(angle){
        this.savedAngle = angle;
        this.body.angle = angle
        // this.bodySprite.angle = angle
            // - 5;
        // this.moveTween?.kill();
        // this.moveTween = gsap.to(this.body, {angle: angle + 5, duration: 0.5,repeat: -1, yoyo: true, ease: Power2.easeInOut})
    }


    destroy(options) {
        this.detectTween?.kill();
        this.detectTween = null;
        this.timeLine?.kill();
        this.timeLine = null;
        this.moveTween?.kill();
        this.moveTween = null;
        this.body.destroy({children: true});
        super.destroy(options);
    }
}