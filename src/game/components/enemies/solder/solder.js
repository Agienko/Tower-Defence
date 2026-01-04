import {Container, Graphics, Sprite, Ticker} from "pixi.js";
import {circlesCollide, createTexture, randomFromArr, randomMinMax} from "../../../../helpers/helper.js";
import {Health} from "../../health/health.js";
import {gsap, Power0, Power1, Power2} from "gsap";
import {GunBullet} from "./gun-bullet.js";
import {RocketTower} from "../../towers/rocket-tower/rocket-tower.js";
import {BulletTower} from "../../towers/bullet-tower/bullet-tower.js";


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
    {x: 128*3, y: 128*6,angle: 0, duration: randomMinMax(28, 32)},
    {x: 128*7, y: 128*6, angle: -90, duration: randomMinMax(28, 32)},
    {x: 128*7, y: 128*2, angle: 0, duration: randomMinMax(28, 32)},
    {x: 128*12, y: 128*2, angle: 90, duration: randomMinMax(28, 32)},
    {x: 128*12, y: 128*8, angle: 0, duration: randomMinMax(28, 32)},
    {x: 128*17, y: 128*8, angle: 0, duration: randomMinMax(28, 32)}
]

export class Enemy extends Container{
    constructor(stage, index) {
        super();
        this.stage = stage;

        this.detectRadius = 8

        this.index = index;
        this.colAmount = 5;
        this.row = Math.floor(this.index / this.colAmount);
        this.col = this.index % this.colAmount;

        this.step = 50;
        this.corrX = this.step - this.col * this.step / 2
        this.corrY = this.step - this.row * this.step / 2

        this.savedAngle = 0;

        this.moveTween = null;
        this.fireTween = null;

        stage.addChild(this);


        this.body = new Container();

        this.addChild(this.body);

        this.bodySprite = new Sprite({
            texture: createTexture('245'),
            width: 48,
            height: 48
        })
        this.bodySprite.anchor.set(0.5);



        this.gun = new Sprite({
            texture: createTexture('291'),
            width: 16,
            height: 16,
            x: 12 ,
            y:7
        })
        this.gun.anchor.set(1, 0.5);

        this.fire = new Sprite({
            texture: createTexture('298'),
            width: 16/2,
            height: -38/2,
            y: 11,
            x: 8,
            alpha: 1,
            blendMode: 'add',
            angle: -90,
            anchor: {x: 0, y: 1}
        })
        this.fire.visible = false;

        this.body.addChild(this.fire);
        this.body.addChild(this.gun);

        this.body.addChild(this.bodySprite);

        this.points = points
        this.health = new Health(this,{
            width: 16,
            height: 2,
            alpha: 0.9,
            x: -8,
            y: -14,
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
        this.setAngle(this.points[0].angle);

        this.timeLine = gsap.timeline({paused: true});

        this.points.forEach(({x, y, angle, duration}, i) => {
            if(i === 0) return;
            this.timeLine.to(this, {x: x + this.corrX, y: y + this.corrY, duration, ease: Power0.easeIn});
            this.timeLine.to(this.body, {angle, duration: 0.4, ease: Power1.easeInOut,
                onStart: () => this.moveTween?.kill(),
                onComplete: () => this.setAngle(angle)
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
                if(child instanceof RocketTower || child instanceof BulletTower){
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
                                    this.detectCycle();
                                    this.moveTween = gsap.to(this.body, {angle: this.savedAngle - 5, duration: 0.2, onComplete: () => {
                                            this.setAngle(this.savedAngle);
                                            // this.timeLine.play()
                                        }});

                                    if(child.destroyed) return;
                                    child.health.updateHealth(-0.3)
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
            //     // this.setAngle(this.savedAngle);
            //     // this.timeLine.play();
            //
            // }
        })
    }

    attack(to, rotation, onComplete){
        const from = this.stage.toLocal(this.gun.position, this.body );

        this.fire.visible = true
        this.fireTween = gsap.delayedCall(0.05, () => this.fire.visible = false)

        new GunBullet(this.stage, {from, to, rotation, delay: 0, withExplode: true})
        new GunBullet(this.stage, {from, to, rotation,  delay: 0.08})
        new GunBullet(this.stage, {from, to, rotation,  delay: 0.16, onComplete})
    }

    setAngle(angle){
        this.savedAngle = angle;
        this.body.angle = angle - 5;
        this.moveTween?.kill();
        this.moveTween = gsap.to(this.body, {angle: angle + 5, duration: 0.5,repeat: -1, yoyo: true, ease: Power2.easeInOut})
    }


    destroy(options) {
        this.detectTween?.kill();
        this.detectTween = null;
        this.timeLine?.kill();
        this.timeLine = null;
        this.moveTween?.kill();
        this.moveTween = null;
        this.fireTween?.kill();
        this.fireTween = null;
        this.body.destroy({children: true});
        super.destroy(options);
    }
}