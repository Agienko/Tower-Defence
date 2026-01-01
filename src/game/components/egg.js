import {Sprite, Texture, Ticker} from "pixi.js";
import {WIDTH} from "../../constants/constants.js";
import {gsap} from "gsap";
import {SIGNALS} from "../signals/signals.js";
import {randomMinMax} from "../../helpers/helper.js";
import {sound} from "@pixi/sound";
import {sender} from "../../sender/event-sender.js";

export class Egg extends Sprite{
    constructor(stage) {
        super({texture: Texture.from('egg')});

        this.stage = stage;
        this.tween = null;

        this.type = 'egg';

        this.eventMode = 'none';

        this.isShit = this.#generateShit();
        this.hasBonus = !this.isShit && this.#generateBonus();
        if (this.hasBonus) this.texture = Texture.from('golden_egg');
        if (this.isShit) this.texture = Texture.from('shit');

        const score = Math.max(SIGNALS.score.value, 8);

        this.speed = Math.max(this.isShit ? 1.2 : 1.1, Math.log10(score/8));
        this.acc = 0.005 + +this.hasBonus * 0.001 + (this.isShit ? 0.002 : 0);

        this.anchor.set(0.5);


        if(this.isShit){
            stage.addChild(this);
            sound.play('catch', {volume: 0.01, speed: 0.4});
        } else {
            stage.addChildAt(this, 2);
            sound.play('catch', {volume: 0.015, speed: 0.5});
        }

        Ticker.shared.add(this.tick);

    }

    #generateShit(){
        const score = SIGNALS.score.value;

        let chance = 0.75;

        if(score > 1000) {
            chance = 0.95;
        }

        return Math.random() > chance;
    }
    #generateBonus(){
        const score = SIGNALS.score.value;

        let chance = 0.97;

        if(score > 1000) {
            chance = 0.65;
        }else if(score > 750){
            chance = 0.7;
        }else if(score > 500) {
            chance = 0.75;
        } else if(score > 300) {
            chance = 0.83;
        } else if(score > 200) {
            chance = 0.9;
        } else if(score > 100) {
            chance = 0.95;
        }

        return Math.random() > chance;
    }
    tick = t => {

        if(SIGNALS.lives.value < 0) {
            this.destroy();
            return;
        }

        this.speed += this.acc;
        this.y += this.speed * t.deltaMS/10;

        if(this.y > 300 && this.y < 310 && Math.abs(this.x - SIGNALS.bagX.value) <= 20) {

            if(this.isShit) {
                Ticker.shared.remove(this.tick);
                sender.send('shitOnBag', this)
                --SIGNALS.score.value;
                sound.play('crash', {volume: 0.02, speed: 0.5, end: 0.1});
            } else {
                this.destroy();
                ++SIGNALS.score.value;
                sound.play('catch', {volume: 0.02, speed: 1.2});
            }


            if(this.hasBonus) {
                ++SIGNALS.lives.value;
                sound.play('life', {volume: 0.012});
            }
            return;
        }

        if(this.y >= WIDTH - 60) {
            this.type = '';
            Ticker.shared.remove(this.tick);
            this.y = WIDTH - 60;
            this.x = randomMinMax(this.x + 5, this.x - 5)
            this.texture = Texture.from(this.isShit ? 'crashed_shit' : 'crashed_egg' );
            this.tween = gsap.delayedCall(1, () => this.destroy());
            sound.play('crash', {volume: 0.05, speed: this.isShit ? 2 : 1.5});
            if(!this.isShit) --SIGNALS.lives.value;
        }
    }

    destroy(options) {
        this.tween?.kill();
        this.tween = null;
        Ticker.shared.remove(this.tick);
        this.stage.removeChild(this);
        this.stage = null;
        super.destroy(options);
    }
}