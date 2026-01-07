import {AnimatedSprite, Container, Sprite, Texture} from "pixi.js";
import {sender} from "../../../sender/event-sender.js";
import {createTexture} from "../../../helpers/helper.js";
import {Explosion} from "../explosion/explosion.js";

export class RemainsBuilder extends Container{
    constructor(stage) {
        super();
        stage.addChild(this);

        this.explosion = new Explosion(this, {
            scale: 0.5,
            alpha: 0.85,
            animationSpeed: 0.3,
            preventDestroy: true
        })

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
        this.explosion.position.set(point.x, point.y);
        this.explosion.width = size;
        this.explosion.height = size;
        this.explosion.explode()
    }
    addChild(...children) {
        super.addChild(...children);

        while (this.children.length > 800) {
            const child = this.children.find(child => child !== this.explosion);
            this.removeChild(child);
            child.destroy();
        }

    }
}