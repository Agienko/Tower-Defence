import {AnimatedSprite, Container, Sprite, Texture} from "pixi.js";
import {sender} from "../../../sender/event-sender.js";
import {createTexture} from "../../../helpers/helper.js";

export class RemainsBuilder extends Container{
    constructor(stage) {
        super();
        stage.addChild(this);

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
        // this.explosion.scale.set(0.5);
        this.explosion.alpha = 0.85

        this.explosion.anchor.set(0.5);
        this.explosion.animationSpeed = 0.3;
        this.explosion.loop = false;

        this.explosion.visible = false;
        this.addChild(this.explosion);

        this.explosion.onComplete = () => {
            this.explosion.visible = false;
            this.explosion.blendMode = 'normal';
        };
        this.explosion.onFrameChange = e => {
            if(e > 5) this.explosion.blendMode = 'add';
        }

        this.eventMode = 'none';
        this.interactiveChildren = false;

        sender.on('createRemain', e => {

            const sprite = new Sprite({
                texture: createTexture( '021'),
                width: e.size,
                height: e.size,
                x: e.point.x,
                y: e.point.y
            })
            sprite.anchor.set(0.5);

            this.addChild(sprite);

            if(e.withExplode) {
                this.explode(e.point, e.size * 2);
            }
        })

    }

    explode(point, size = 64){
        console.log('explode', point, size);
        this.explosion.position.set(point.x, point.y);
        this.explosion.width = size;
        this.explosion.height = size;
        this.explosion.visible = true;
        this.explosion.gotoAndPlay(0);
    }
    addChild(...children) {
        super.addChild(...children);

        while (this.children.length > 300) {
            const child = this.removeChildAt(0);
            console.log('destroy', child);
            child.destroy();
        }

    }
}