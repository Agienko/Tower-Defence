import {Container, Sprite, Texture} from "pixi.js";

export class Health extends Container{
    constructor(stage, descriptor, onDeadCb) {
        super();
        this.onDeadCb = onDeadCb;
        stage.addChild(this);

        this.protection = descriptor.protection ?? 1;

        this._level = 100;
        this.bg = new Sprite({
            texture: Texture.WHITE,
            width: descriptor.width,
            height: descriptor.height,
            tint: 0xff0000
        })

        this.addChild(this.bg);

        this.levelSprite = new Sprite({
            texture: Texture.WHITE,
            width: descriptor.width,
            height: descriptor.height,
            tint: 0x00ff00
        })

        this.addChild(this.levelSprite)
        // this.pivot.set(8, 14);
        this.position.set(descriptor.x ?? 0, descriptor.y ?? 0);
        this.alpha = descriptor.alpha
    }

    get(){
        return this._level;
    }
    set(value){
        this._level = Math.max(Math.min(value, 100), 0);
        this.levelSprite.width = this.bg.width * this._level / 100;
        if(this._level <= 0){
            this.onDeadCb?.();
        }
    }
    updateHealth(delta){
        this.set(this.get() + delta/this.protection);
    }

    destroy(options) {
        this.onDeadCb = null;
        super.destroy(options);
    }
}