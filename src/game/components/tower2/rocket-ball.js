import {Container, Sprite, AnimatedSprite, Texture, Graphics} from "pixi.js";
import {circlesCollide, createTexture, randomMinMax} from "../../../helpers/helper.js";
import {gsap, Power0} from "gsap";

export class RocketBall extends Container{
    constructor(stage, withExplode = false) {
        super();
        this.stage = stage;
        this.stage.addChild(this);

        this.isFly = false;

        this.tween = null;

        this.cb = null;
        this.body = new Sprite({
            texture: createTexture('273'),
            width: 64,
            height: 64
        })
        this.body.anchor.set(0.5);

        this.addChild(this.body);
        this.withExplode = withExplode;

        if(this.withExplode){
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
            this.explosion.scale.set(0.4);
            this.explosion.alpha = 0.7

            this.explosion.anchor.set(0.5);
            this.explosion.animationSpeed = 0.5;
            this.explosion.loop = false;

            this.explosion.visible = false;
            this.addChild(this.explosion);

            this.explosion.onComplete = () => {
                this.cb?.();
                this.destroy({children: true});
            };
            this.explosion.blendMode = 'add';
        } else {
            this.explosion = null;
        }

        this.visible = false;
    }

    start({from, to, rotation, stage}, cb){
        if(this.isFly) return;
        this.isFly = true;
        this.stage = stage;
        this.cb = cb;
        stage.addChild(this);
        this.position.set(from.x, from.y);

        this.rotation = rotation;

        this.tween?.kill();
        this.scale.set(1);
        this.tween = gsap.to(this, {x: to.x, y: to.y, pixi:{scale: 0.8}, duration: 0.2, ease: Power0.easeNone,
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
        this.explosion.visible = true;
        this.explosion.gotoAndPlay(0);



        const rocket = this.stage.toLocal(this.body.position, this);

        // const circle = new Graphics();
        // circle.circle(rocket.x, rocket.y, 64);
        // circle.fill({ color: 0xff0000, alpha: 0.5 });
        // this.stage.addChild(circle);


        this.stage.children.forEach(child => {
            if(child?.health){
                const enemy = this.stage.toLocal(child.body.position, child);

                if(circlesCollide(rocket.x, rocket.y, 32, enemy.x, enemy.y, child.detectRadius)){
                    const diff = Math.sqrt((enemy.x - rocket.x) ** 2 + (enemy.y - rocket.y)**2);
                    const coef = 1 - diff/(64 + child.detectRadius)

                    // const circle = new Graphics();
                    // circle.circle(enemy.x, enemy.y, child.detectRadius);
                    // circle.fill({ color: 0x00ff00, alpha: coef });
                    // this.stage.addChild(circle);

                    child.health.updateHealth(-10*coef);

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