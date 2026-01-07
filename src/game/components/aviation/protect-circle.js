import {Container, Graphics, Sprite} from "pixi.js";
import {createTexture} from "../../../helpers/helper.js";
import {gsap} from "gsap";

export class ProtectCircle extends Container{
    constructor(stage, params) {
        super();
        this.params = params;
        stage.addChild(this);

        this.body = new Graphics();
        this.body.circle(0, 0, this.params.detectionRadius);
        this.body.fill({ color: "rgba(244,198,36,0.45)", alpha: 1});
        this.body.stroke({ color: "rgba(223,103,9,0.74)", alpha: 1, width: 1});
        this.body.blendMode = 'add';

        this.icon = this.createIcon();

        this.graphics = new Graphics();
        this.graphics.circle(0, 0, this.params.detectionRadius);
        this.graphics.stroke({ width: 2, color: 0xffffff , alpha: 0.5 });
        this.graphics.scale.set(0);
        this.graphics.blendMode = 'add';

        this.addChild(this.body, this.graphics);
        this.tween = null;
        this.alpha = 0.4;
        this.body.alpha = 0.4;
    }

    createIcon(){
        const sprite =  new Sprite({
            texture: createTexture(this.params.skin.protectIcon),
            width: this.params.detectionRadius,
            height: this.params.detectionRadius,
            anchor: {x: 0.5, y: 0.5},
            angle: -45,
            alpha: 1,
        });

        this.addChild(sprite);
        return sprite;
    }
    fixed(){
        this.eventMode = 'none'
        this.graphics.scale.set(0)
        this.body.alpha = 0.2;
        this.tween = gsap.to(this.graphics, {pixi: {scale: 1, alpha: 0}, delay: 1, repeatDelay: 1, duration: 1.5, repeat: -1, ease: 'sine.out'});
    }
    unfixed(){
        this.eventMode = 'static';
        this.tween?.kill();
        this.body.alpha = 0.4;
        this.graphics.scale.set(0)
    }

    destroy(options) {
        this.tween?.kill();
        this.tween = null;
        super.destroy(options);
    }

}