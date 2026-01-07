import {BlurFilter, Container, Rectangle, Sprite} from "pixi.js";
import {createTexture, drawCircle, randomMinMax, randomPointInCircle} from "../../../../helpers/helper.js";
import {gsap, Power0} from "gsap";
import {PlaneBomb} from "./plane-bomp.js";

export class Plane extends Container{
    constructor(stage, params) {
        super();
        this.zIndex = 15;
        this.stage = stage;
        this.params = params;
        stage.addChild(this);
        this.body = new Sprite({
            texture: createTexture('271'),
            width: 128,
            height: 128,
        })

        this.body.anchor.set(0.5);

        this.shadow = new Sprite({
            texture: createTexture('294'),
            width: 128,
            height: 128,
            x: -32,
            y: 32,
            alpha: 0.8,
            blendMode: 'multiply',
        })
        this.shadow.scale.set(1.1);
        this.shadowBlur = new BlurFilter({strength: 2.4});
        this.shadow.filters = [this.shadowBlur];
        this.shadow.filterArea = new Rectangle(0, 0, 128, 128);

        this.visible = false;
        this.addChild(this.shadow,this.body);

    }

    attack(to, onComplete){
        this.y = to.y;

        const finalX = 128*17;
        const detectionRadius = this.params.detectionRadius;
        this.shadowTween = gsap.to(this, {pixi: {x: finalX}, duration: 1.5, delay: 0.8, ease: Power0.easeNone,
            onStart: () => this.visible = true,
            onUpdate: () => {
                if(!this.bombDropped && this.x >= to.x - detectionRadius){
                    this.bombDropped = true;
                    this.dropBombs(to)
                }
            },
            onComplete: () => {
                onComplete?.()
                this.destroy({children: true})
            }
            });
    }

    dropBombs(pos){
        const {accuracyRadius, detectionRadius} = this.params;
        const rnd = () => randomMinMax(-accuracyRadius, accuracyRadius);
        new PlaneBomb(this.stage, {
            ...this.params.bullet,
            from: {x:pos.x - detectionRadius + randomMinMax(-5, 5), y: pos.y + randomMinMax(-5, 5)},
            to: {x:pos.x - detectionRadius + detectionRadius/2 + rnd(), y: pos.y + rnd()},
            delay: 0
        })
        new PlaneBomb(this.stage, {
            ...this.params.bullet,
            from: {x:pos.x - detectionRadius + detectionRadius/2 + randomMinMax(-5, 5), y: pos.y + randomMinMax(-5, 5)},
            to: {x:pos.x + rnd(), y: pos.y + rnd()},

            delay: 0.2,
        })
        new PlaneBomb(this.stage, {
            ...this.params.bullet,
            from: {x:pos.x + randomMinMax(-5, 5), y: pos.y + randomMinMax(-5, 5)},
            to: {x:pos.x + detectionRadius/2 + rnd(), y: pos.y + rnd()},
            delay: 0.4,
        })
    }

    destroy(options) {
        this.shadowTween?.kill();
        this.shadowTween = null;
        this.shadow.destroy();
        this.shadow = null;
        this.body.destroy();
        this.body = null;
        this.shadowBlur?.destroy();
        this.shadowBlur = null;
        super.destroy(options);
    }
}