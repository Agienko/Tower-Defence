import {Container, Graphics, Sprite} from "pixi.js";
import {circlesCollide, createTexture, randomFromArr, randomMinMax} from "../../../helpers/helper.js";
import {gsap} from "gsap";
import {Enemy} from "../enemy/enemy.js";
import {Rocket} from "./rocket.js";
import {Health} from "../health/health.js";
import {Tank} from "../tank/tank.js";

export class Tower extends Container{
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
            texture: createTexture('229'),
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

        this.bullet = new Rocket(this.turet)

        this.graphics = new Graphics();
        this.graphics.circle(0, 0, 300);
        this.graphics.stroke({ width: 2, color: 0xffffff , alpha: 0.7 });
        this.graphics.position.set(64, 64);
        this.addChild(this.graphics);

        this.idleTween = null;
        this.detectTween = null;
        this.attackTween = null
        this.bulletKillObj = null;

        this.startIdle(0);
        this.detectEnemyCycle()


    }

    startIdle(delay = 3){
        this.turet.rotation = this.turet.rotation % (2*Math.PI);
        this.idleTween = gsap.to(this.turet, {rotation: this.turet.rotation + Math.PI, delay, repeat: -1, yoyo: true, duration: 10});
    }

    attack(to){
        if(!this.bullet) return;
        this.attackTween?.kill();

        const from = this.stage.toLocal(this.bullet.position, this.turet );
        const rotation = Math.PI/2 + Math.atan2(to.y - from.y, to.x - from.x);

        this.attackTween = gsap.to(this.turet, {rotation, duration: 0.5, onComplete: () => {
                this.bulletKillObj = this.bullet.start({from, to, rotation, stage: this.stage}, () => {
                    if(this.destroyed) return;
                    this.bullet = new Rocket(this.turet);
                    this.startIdle();
                    this.detectEnemyCycle()
                });
                this.bullet = null
            }});
    }


    detectEnemyCycle(){

        this.graphics.alpha = 0.7;
        this.graphics.scale.set(0)


        this.detectTween = gsap.to(this.graphics, {pixi: {scale: 1, alpha: 0}, delay: randomMinMax(0.9, 1.1), duration: 1.5, ease: 'sine.out', onComplete: () => {
                const tower = this.stage.toLocal(this.body.position, this);

                // const circle = new Graphics();
                // circle.circle(tower.x, tower.y, 300);
                // circle.fill({ color: 0xff0000, alpha: 0.5 });
                // this.stage.addChild(circle);
                // setTimeout(() => circle.destroy(), 1000);


                const hasEnemy = this.stage.children.some(child => {

                    if(child instanceof Enemy || child instanceof Tank){

                        const enemy = this.stage.toLocal(child.body.position, child);

                        // const circle = new Graphics();
                        // circle.circle(enemy.x, enemy.y, child.detectRadius);
                        // circle.fill({ color: 0x00ff00, alpha: 0.5 });
                        // this.stage.addChild(circle);


                        if (circlesCollide(tower.x, tower.y, 300, enemy.x, enemy.y, child.detectRadius)){

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

                if(hasEnemy) return

                this.detectEnemyCycle()
            }});
    }

    destroy(options) {
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