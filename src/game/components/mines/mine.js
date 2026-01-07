import {Container, Sprite} from "pixi.js";
import {circlesCollide, createTexture, randomMinMax} from "../../../helpers/helper.js";
import {Explosion} from "../explosion/explosion.js";
import {gsap} from "gsap";

export class Mine extends Container{
    constructor(stage, cb) {
        super();

        this.type = 'mine';
        this.stage = stage;
        this.zIndex = 0;
        this.cb = cb;

        this.detectRadius = 8;
        this.isAlive = true;
        stage.addChild(this);
        this.body = new Sprite({
            texture: createTexture('274'),
            width: 52,
            height: 52,
            anchor: {x: 0.5, y: 0.5},
            alpha: 1,
        });

        this.explosion = new Explosion(this, {
            scale: 0.12,
            alpha: 0.8,
            animationSpeed: 0.38,
            blendMode: 'add',
            onComplete: () => this.destroy({children: true})
        })


        this.addChild(this.body, this.explosion);

        this.tickerTween = gsap.to({},{duration: randomMinMax(0.4, 0.6), repeat: -1, onRepeat: () => this.detect()})

        this.appear();

    }
    appear(){
        this.tween?.kill();
        this.scale.set(0);
        this.tween = gsap.to(this.scale, {x: 1, y: 1, duration: randomMinMax(0.2, 0.3), ease: 'sine.in'})
    }


    detect () {
        if(!this.isAlive) return;

        for(let i = 0; i < this.stage.children.length; i++) {
            const child = this.stage.children[i];
            if(child.type !== 'enemy') continue;
            const enemy = this.toLocal(child.body.getGlobalPosition());
            if (!circlesCollide(this.body.x, this.body.y, this.detectRadius, enemy.x, enemy.y, child.detectRadius)) continue;
            this.tickerTween?.kill()
            this.isAlive = false;
            this.cb?.();
            child.health.updateHealth(-randomMinMax(10, 50));
            this.explosion.explode();
            return;
        }
    }

    destroy(options) {
        this.tickerTween?.kill();
        this.tickerTween = null;
        this.tween?.kill();
        this.tween = null;
        this.cb?.();
        this.cb = null;
        super.destroy(options);
    }

}