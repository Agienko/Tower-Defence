import {BlurFilter, Container, Sprite, Texture} from "pixi.js";
import {World} from "./components/world.js";
import {Texts} from "./components/texts.js";
import {Chicken} from "./components/chicken.js";
import {Bag} from "./components/bag.js";
import {getRandomInt, randomFromArr} from "../helpers/helper.js";
import {gsap} from "gsap";
import {effect} from "@preact/signals-core";
import {SIGNALS} from "./signals/signals.js";
import {GameOver} from "../game-over/game-over.js";

class Game extends Container{
    constructor(stage) {
        super();
        stage.addChild(this);

        this.loopTween = null;

        this.world = new World(this);
        this.texts = new Texts(this);

        this.chickens = [];
        this.eggs = new Set();

        for (let i = 0; i < 5; i++) {
            const chicken = new Chicken(this, i);
            this.chickens.push(chicken);
        }

        this.bag = new Bag(this);

        this.bagShadow = new Sprite({
            texture: Texture.WHITE,
            tint: 0x000000,
            alpha: 0.5,
            width: 38,
            height: 4,
            filters: [new BlurFilter(6)],
            y: 344
        });
        this.bagShadow.anchor.set(0.5);
        this.addChild(this.bagShadow);


        effect(() => this.bagShadow.position.x = SIGNALS.bagX.value);



        this.loop();

        effect(() => {
            if(SIGNALS.lives.value >= 0) return;
            this.loopTween?.kill();

            const toDestroy = this.children.filter(child => child.type === 'egg');

            toDestroy.forEach(child => child.destroy());
            const gameOver = new GameOver(this);
            gameOver.eventMode = 'static';

            const onPointerDown = () => {
                gameOver.off('pointerdown', onPointerDown)
                gameOver.destroy({children: true});
                SIGNALS.lives.value = 5;
                SIGNALS.score.value = 0;
                this.loop();
            }


            gameOver.on('pointerdown', onPointerDown)

        })

    }

    loop(){
        if(SIGNALS.lives.value < 0) return;

        const score = SIGNALS.score.value;
        let min = 1000, max = 2000;
        if(score > 1000) {
            min = 180;
            max = 250;
        }else if(score > 750){
            min = 200;
            max = 290;
        }else if(score > 500) {
            min = 220;
            max = 300;
        }else if(score > 350) {
            min = 250;
            max = 400;
        } else if(score > 250) {
            min = 270;
            max = 450;
        } else if(score > 180) {
            min = 280;
            max = 500;
        } else if(score > 120) {
            min = 290;
            max = 550;
        } else if(score > 80) {
            min = 300;
            max = 600;
        } else if(score > 50) {
            min = 400;
            max = 700;
        } else if(score > 20) {
            min = 500;
            max = 1000;
        } else if(score > 10) {
            min = 800;
            max = 1500;
        }
        this.loopTween = gsap.delayedCall(getRandomInt(min, max) / 1000, () => {
            if(SIGNALS.lives.value < 0) return;


            const egg = randomFromArr(this.chickens).getEgg();
            this.eggs.add(egg);
            this.loop();
        })
    }
}

export default Game