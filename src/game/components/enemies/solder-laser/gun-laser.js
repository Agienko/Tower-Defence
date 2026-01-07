import {Container, Sprite, Texture} from "pixi.js";
import { randomMinMax} from "../../../../helpers/helper.js";
import {gsap} from "gsap";
import {Explosion} from "../../explosion/explosion.js";

export class GunLaser extends Container{
    constructor(stage, {from, to, delay = 0, rotation, withExplode = false, onComplete}) {
        super();
        this.zIndex = 5;
        this.onComplete = onComplete;
        this.position.set(from.x, from.y);

        this.body = new Sprite({
            texture: Texture.WHITE,
            width: 24,
            height: 1,
            alpha: 0.8,
            blendMode: 'add',
            tint: "#ff0000"
        })
        this.body.rotation = rotation;
        this.body.anchor.set(0, 0.5);
        this.addChild(this.body);


        this.explosion = withExplode ? this.createExplosion() : null;

        this.tween = gsap.to(this, {x: to.x, y: to.y,delay, duration: randomMinMax(0.2, 0.3), ease: 'sine.in',
            onStart: () => stage.addChild(this),
            onComplete: () => {
                if(this.explosion){
                    this.body.visible = false;

                    this.explosion.explode();
                } else {
                    this.destroy({children: true})
                }
            }
        });
    }

    createExplosion(){
        const explosion = new Explosion(this, {
            scale: 0.05,
            alpha: 0.5,
            animationSpeed: 0.5,
            blendMode: 'add',
            onComplete: () => this.destroy({children: true})
        })
        return explosion;
    }

    destroy(options) {
        this.onComplete?.();
        this.onComplete = null;
        this.tween?.kill();
        this.tween = null;
        super.destroy(options);
    }
}