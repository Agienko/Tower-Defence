import {AnimatedSprite, Texture} from "pixi.js";

const textureNames = [
    "explode_0",
    "explode_1",
    "explode_2",
    "explode_3",
    "explode_4",
    "explode_5",
    "explode_6",
    "explode_7",
    "explode_8"
]

export class Explosion extends AnimatedSprite{
    constructor(stage, descriptor) {
        super(textureNames.map(name => Texture.from(name)));
        this.descriptor = descriptor;
        this.scale.set(this.descriptor.scale ?? 1);
        this.alpha = this.descriptor.alpha ?? 1;

        this.anchor.set(0.5);
        this.animationSpeed = this.descriptor.speed ?? 0.3;
        this.loop = false;

        this.visible = false;
        stage.addChild(this);

        this.onComplete = () => {
            this.descriptor.onComplete?.();
            if(this.descriptor.preventDestroy) return
            this.destroy({children: true});

        };

        this.blendMode = this.descriptor.blendMode ?? 'normal';

    }
    explode(){
        if(this.visible) return;
        this.visible = true;
        this.gotoAndPlay(0);
    }
}