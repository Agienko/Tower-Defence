import {AnimatedSprite, Container, Sprite, Texture} from "pixi.js";
import {createTexture, randomMinMax} from "../../../helpers/helper.js";
import {gsap} from "gsap";

export class GunBullet extends Container{
    constructor(stage, {from, to, delay = 0, withExplode = false, onComplete}) {
        super();
        this.onComplete = onComplete;
        this.position.set(from.x, from.y);

        this.body = new Sprite({
            texture: createTexture('272'),
            width: 8,
            height: 8,
            alpha: 0.8,
            blendMode: 'add'
        })
        this.body.anchor.set(0.5);
        this.addChild(this.body);


        this.explosion = withExplode ? this.createExplosion() : null;

        this.tween = gsap.to(this, {x: to.x, y: to.y,delay, duration: randomMinMax(0.2, 0.3), ease: 'sine.in',
            onStart: () => stage.addChild(this),
            onComplete: () => {
                if(this.explosion){
                    this.body.visible = false;
                    this.explosion.visible = true;
                    this.explosion.gotoAndPlay(0);
                } else {
                    this.destroy({children: true})
                }
            }
        });
    }

    createExplosion(){
        const textures = [
            "explode_0",
            "explode_1",
            "explode_2",
            "explode_3",
            "explode_4",
            "explode_5",
            "explode_6",
            "explode_7",
            "explode_8"
        ].map(name => Texture.from(name));

        const explosion = new AnimatedSprite(textures);
        explosion.scale.set(0.05);
        explosion.alpha = 0.5

        explosion.anchor.set(0.5);
        explosion.animationSpeed = 0.4;
        explosion.loop = false;

        explosion.visible = false;
        this.addChild(explosion);

        explosion.onComplete = () => this.destroy({children: true});
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