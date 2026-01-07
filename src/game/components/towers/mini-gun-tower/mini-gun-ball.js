import {Container, Sprite, AnimatedSprite, Texture, Graphics} from "pixi.js";
import {circlesCollide, createTexture, randomMinMax} from "../../../../helpers/helper.js";
import {gsap, Power0} from "gsap";
import {sender} from "../../../../sender/event-sender.js";
import {Explosion} from "../../explosion/explosion.js";

export class MiniGunBall extends Container{
    constructor(stage,params, withExplode = false) {
        super();
        this.zIndex = 5;
        this.stage = stage;
        this.stage.addChild(this);
        this.params = params;

        this.isFly = false;

        this.tween = null;

        this.cb = null;
        this.body = new Sprite({
            texture: Texture.WHITE,
            width: 4,
            height: 64,
            blendMode: 'add',
            tint: 0xff0000,
            alpha: 0.8
        })
        this.body.anchor.set(0.5);

        this.addChild(this.body);
        this.withExplode = withExplode;

        if(this.withExplode){

            this.explosion = new Explosion(this, {
                scale: 0.4,
                alpha: 0.7,
                animationSpeed: 0.5,
                blendMode: 'add',
                onComplete: () => {
                    this.cb?.();
                    this.destroy({children: true});
                }
            })

        } else {
            this.explosion = null;
        }

        this.visible = false;
    }


    start({from,rotation, to, stage}, cb){
        if(this.isFly) return;
        this.isFly = true;
        this.stage = stage;
        this.cb = cb;
        stage.addChild(this);
        this.position.set(from.x, from.y);

        this.rotation = rotation;

        this.tween?.kill();
        this.scale.set(1);
        this.tween = gsap.to(this, {x: to.x, y: to.y, pixi:{scale: 0.8}, duration: this.params.attackTime, ease: Power0.easeNone,
            onStart: () => this.visible = true,
            onComplete: () => {
            if(this.withExplode){
                this.#explode()
            } else {
                this.cb?.();
                this.destroy({children: true});
            }

            }
            });
        return {kill: () => this.cb = null}
    }
    #explode(){
        this.body.visible = false;
        this.explosion.explode()

        const rocket = this.stage.toLocal(this.body.position, this);

        // const circle = drawCircle(rocket.x, rocket.y, this.params.damageRadius, 0xff0000)
        // this.stage.addChild(circle);

        sender.send('createRemain', {point: rocket, size: this.params.damageRadius, type: 'bullet', withExplode: false})

        this.stage.children.forEach(child => {
            if(child.type === 'enemy' && child.health.get()){
                const enemy = this.stage.toLocal(child.body.position, child);

                if(circlesCollide(rocket.x, rocket.y, this.params.damageRadius, enemy.x, enemy.y, child.detectRadius)){
                    const diff = Math.sqrt((enemy.x - rocket.x) ** 2 + (enemy.y - rocket.y)**2);
                    const coef = 1 - diff/(this.params.damageRadius + child.detectRadius)

                    // const circle = drawCircle(enemy.x, enemy.y, child.detectRadius)
                    // this.stage.addChild(circle);

                    child.health.updateHealth(-this.params.damage*coef);

                }
            }
        })

    }

    destroy(options) {
        this.tween?.kill();
        this.tween = null;
        this.cb = null;
        this.stage?.removeChild(this);
        this.stage = null;
        this.body.destroy();
        this.body = null;
        this.explosion?.destroy();
        this.explosion = null;
        super.destroy(options);
    }
}