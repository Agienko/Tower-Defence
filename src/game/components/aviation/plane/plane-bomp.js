import {Container, Sprite, Graphics, BlurFilter, Rectangle} from "pixi.js";
import {gsap} from "gsap";
import {circlesCollide, createTexture} from "../../../../helpers/helper.js";
import {Explosion} from "../../explosion/explosion.js";
import {sender} from "../../../../sender/event-sender.js";

export class PlaneBomb extends Container{
    constructor(stage, params) {
        super();
        this.type = 'plane-bomb';
        this.zIndex = 10;
        this.params = params;
        this.stage = stage;
        this.stage.addChild(this);

        this.tween = null;

        this.body = new Sprite({
            texture: createTexture('272'),
            width: 72,
            height: 72,
        })
        this.body.anchor.set(0.5);


        this.shadow = new Sprite({
            texture: createTexture('272'),
            width: 72,
            height: 72,
            tint: 0x000000,
            x: -32,
            y: 32,
            alpha: 0.15,
            blendMode: 'multiply',
        })
        this.shadow.anchor.set(0.5);
        this.shadow.scale.set(1.1);
        this.shadowBlur = new BlurFilter({strength: 3});
        this.shadow.filters = [this.shadowBlur];

        this.body.anchor.set(0.5);

        this.visible = false;

        this.addChild(this.shadow,this.body);
        this.tween = null;
        this.tween2 = null;

        this.explosion = new Explosion(this, {
            scale: 0.5,
            alpha: 0.8,
            animationSpeed: 0.34,
            onComplete: () => this.destroy({children: true})
        })
        this.scale.set(1.2);
        this.start()
    }

    start(){

        console.log('start', this.stage)
        const {from, to, delay = 0, attackTime} = this.params;
        this.position.set(from.x, from.y);
        this.tween = gsap.delayedCall(delay, () => {
            this.tween = gsap.to(this.shadow, {x: 0, y: 0, pixi:{scale: 0.8}, duration: attackTime, ease: 'sine.out'})
            this.tween2 = gsap.to(this, {x: to.x, y: to.y, pixi:{scale: 0.8}, duration: attackTime, ease: 'circ.out',
                onStart: () => this.visible = true,
                onComplete: () => this.#explode()});
        })
    }
    #explode(){
        this.body.visible = false;
        this.explosion.explode()

        const rocket = this.stage.toLocal(this.body.position, this);

        sender.send('createRemain', {point: rocket, size: this.params.damageRadius})

        // const circle = new Graphics();
        // circle.circle(rocket.x, rocket.y, this.params.damageRadius);
        // circle.fill({ color: 0xff0000, alpha: 0.5 });
        // this.stage.addChild(circle);


        this.stage.children.forEach(child => {
            if(child.type === 'enemy' && child.health.get()){
                const enemy = this.stage.toLocal(child.body.position, child);

                if(circlesCollide(rocket.x, rocket.y, this.params.damageRadius, enemy.x, enemy.y, child.detectRadius)){
                    const diff = Math.sqrt((enemy.x - rocket.x) ** 2 + (enemy.y - rocket.y)**2);
                    const coef = 1 - diff/(this.params.damageRadius + child.detectRadius)

                    // const circle = new Graphics();
                    // circle.circle(enemy.x, enemy.y, child.detectRadius);
                    // circle.fill({ color: 0x00ff00, alpha: coef });
                    // this.stage.addChild(circle);

                    child.health.updateHealth(-this.params.damage*coef);

                }
            }
        })

    }

    destroy(options) {
        this.tween?.kill();
        this.tween = null;
        this.tween2?.kill();
        this.tween2 = null;
        this.stage?.removeChild(this);
        this.stage = null;
        this.body.destroy();
        this.body = null;

        this.explosion.destroy();
        this.explosion = null;
        super.destroy(options);
    }
}