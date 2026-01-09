import {Graphics} from "pixi.js";
import {gsap} from "gsap";
import {Tank} from "../tank/tank.js";
import {circlesCollide, drawCircle, randomMinMax} from "../../../../helpers/helper.js";

export class LaserTank extends Tank{
    constructor(stage, index) {
        super(stage, index);
        this.bodySprite.tint = 0xdfdfdf;

        this.laserBall = new Graphics()
        this.laserBall.circle(0, 0, 128);
        this.laserBall.fill({color:"#ee2200"});
        this.laserBall.blendMode = 'add-npm'
        this.laserBall.alpha = 0.4;
        this.laserBall.scale.set(0);

        this.laserDetectTween = gsap.to(this.laserBall, {alpha: 0, pixi: {scale: 1} ,delay: this.index*0.25,duration: 1, repeat: -1, onRepeat: ()=> {
                this.detectMineOrPlaneBomb()
            }});

        this.addChild(this.laserBall);
    }

    detectMineOrPlaneBomb(){

        // const circle = drawCircle(this.laserBall.x, this.laserBall.y, 128, 0xff0000)
        // this.addChild(circle);
        // setTimeout(() => circle.destroy(), 500);

        for(let i = 0; i < this.stage.children.length; i++) {
            const child = this.stage.children[i];

            if (child.type !== 'mine' && child.type !== 'plane-bomb') continue;
            const enemy = this.toLocal(child.body.position, child);

            // const circle = drawCircle(enemy.x, enemy.y, 16, 0x00ff00)
            // this.addChild(circle);

            // console.log(this.laserBall.x, this.laserBall.y, 128, enemy.x, enemy.y, 16)

            if (!circlesCollide(this.laserBall.x, this.laserBall.y, 128, enemy.x, enemy.y, 8)) continue;

            if(child.type === 'mine') {

                this.killEnemy(child);
                // if(Math.random() > 0.5) return;
                return;
            } else if(child.type === 'plane-bomb') {
                if(Math.random() > 0.5) continue;
                this.killEnemy(child);
                console.log('kill plane bomb')
                return;
            }
        }
    }

    killEnemy(child){
        // child.explosion.scale/=2
        child.explosion.explode();
        this.createLightEffect();
    }

    createLightEffect(){
        const laserBallLight = new Graphics()
        laserBallLight.circle(0, 0, 128);
        laserBallLight.fill({color:"#e6a928"});
        laserBallLight.blendMode = 'add-npm'
        laserBallLight.alpha = 1;
        laserBallLight.scale.set(0);
        this.addChild(laserBallLight);
        laserBallLight.tween = gsap.to(laserBallLight, {alpha: 0, pixi: {scale: 1.5} ,duration: 0.5, onComplete: ()=> {
                laserBallLight.tween?.kill();
                laserBallLight.tween = null;
                laserBallLight.destroy();
            }});
    }

    destroy(options) {
        this.lightTween?.kill();
        this.lightTween = null;
        this.laserDetectTween?.kill();
        this.laserDetectTween = null;
        this.children.forEach(child => {
            if(child.tween){
                child.tween?.kill();
                child.tween = null;
            }
        });
        super.destroy(options);
    }
}