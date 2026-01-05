import {Container, Particle, ParticleContainer, Sprite, AnimatedSprite, Texture, Graphics} from "pixi.js";
import {circlesCollide, createTexture, randomMinMax} from "../../../../helpers/helper.js";
import {gsap} from "gsap";
import {sender} from "../../../../sender/event-sender.js";

export class Rocket extends Container{
    constructor(stage, params) {
        super();

        this.params = params;
        this.stage = stage;
        this.stage.addChild(this);

        this.isFly = false;

        this.tween = null;

        this.cb = null;
        this.body = new Sprite({
            texture: createTexture('251'),
            width: 64,
            height: 64
        })
        this.body.anchor.set(0.5);

        this.gases = new ParticleContainer({
            dynamicProperties: {
                position: true,
                rotation: false,
                color: true,
                uvs: false,
                vertex: true,
            },
            x: -4,
        })

        this.fire = new Sprite({
            texture: createTexture('295'),
            width: 16,
            height: -38,
            y: 38,
            alpha: 0.3
        })
        this.fire.visible = false;
        this.fire.anchor.set(0.5, 0);
        this.addChild(this.gases);
        this.addChild(this.fire);

        this.addChild(this.body);
        this.fireTween = null;

        for (let i = 0; i < 30; i++) {
            const particle = new Particle({
                texture: createTexture('019'),
                scaleX: 0.125/2,
                scaleY: 0.125/2,
                alpha: 0.8,
            })
            particle.tween = null;
            particle.gasEmit = () => {
                particle?.tween?.kill();
                particle.tween = gsap.to(particle, {
                    alpha: 0,
                    y: 110 + randomMinMax(-40, 40),
                    scaleX: 0.5,
                    scaleY: 0.5,
                    delay: i * 0.016,
                    x: -24,
                    repeat: -1,
                    duration: (this.gases.particleChildren.length)*0.008,
                    ease: 'sine.in'
                })
            }
            this.gases.addParticle(particle);
        }

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

        this.explosion = new AnimatedSprite(textures);
        this.explosion.scale.set(params.damageRadius/128);
        this.explosion.alpha = 0.85

        this.explosion.anchor.set(0.5);
        this.explosion.animationSpeed = 0.3;
        this.explosion.loop = false;

        this.explosion.visible = false;
        this.addChild(this.explosion);

        this.explosion.onComplete = () => {
            this.cb?.();
            this.destroy({children: true});

        };
        this.explosion.onFrameChange = e => {
            if(e > 5) this.explosion.blendMode = 'add';
        }
        this.scale.set(0);
        this.tween = gsap.to(this, {pixi: {scale: 1}, duration: 0.2, ease: 'expo.inOut', onComplete: () => {}})

    }

    #gasesEmit(){
        this.gases.visible = true;
        this.gases.particleChildren.forEach((particle, i) => particle.gasEmit())
    }

    start({from, to, rotation, stage}, cb){
        if(this.isFly) return;
        this.isFly = true;
        this.stage = stage;
        this.cb = cb;
        stage.addChild(this);
        this.position.set(from.x, from.y);

        this.rotation = rotation;

        this.#gasesEmit();

        this.fire.visible = true;

        this.fireTween = gsap.to(this.fire, {y: 40, alpha: 0.8, repeat:-1, yoyo: true, duration: 0.2, ease: 'sine.inOut'});
        this.tween?.kill();
        this.scale.set(1);
        this.tween = gsap.to(this, {x: to.x, y: to.y, pixi:{scale: 0.8}, duration: this.params.attackTime, ease: 'expo.in', onComplete: () => {
                this.#explode()
            }});
        return {kill: () => this.cb = null}
    }
    #explode(){
        this.gases.particleChildren.forEach(particle => particle.tween?.kill());
        this.fireTween?.kill();
        this.fire.visible = false;
        this.gases.visible = false;
        this.body.visible = false;
        this.explosion.visible = true;
        this.explosion.gotoAndPlay(0);


        const rocket = this.stage.toLocal(this.body.position, this);

        sender.send('createRemain', {point: rocket, size: this.params.damageRadius})

        // const circle = new Graphics();
        // circle.circle(rocket.x, rocket.y, 64);
        // circle.fill({ color: 0xff0000, alpha: 0.5 });
        // this.stage.addChild(circle);


        this.stage.children.forEach(child => {
            if(child?.health){
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
        this.fireTween?.kill();
        this.fireTween = null;
        this.tween?.kill();
        this.tween = null;
        this.cb = null;
        this.stage?.removeChild(this);
        this.stage = null;
        this.body.destroy();
        this.body = null;
        this.gases.particleChildren.forEach(particle => {
            particle.tween?.kill();
            particle.tween = null;
        })
        this.gases.destroy({children: true});
        this.gases = null;
        this.explosion.destroy();
        this.explosion = null;
        super.destroy(options);
    }
}