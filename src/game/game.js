import {WorldBuilder} from "./components/world-builder/world-builder.js";
import {ScaleSystem} from "./scale-system.js";
import {Enemy} from "./components/enemy/enemy.js";
import {Tower} from "./components/tower/tower.js";
import {gsap} from "gsap";
import {Tank} from "./components/tank/Tank.js";
import {Tower2} from "./components/tower2/tower2.js";

export class Game extends ScaleSystem{
    constructor(stage) {
        super(stage);

        this.worldBuilder = new WorldBuilder(this);

        const timeLine = gsap.timeline();

        // timeLine.call(() => {
        //     for (let i = 0; i < 25; i++) new Enemy(this, i)
        // })
        // timeLine.to({}, {duration: 10})
        timeLine.call(() => {
            for (let i = 0; i < 4; i++) new Tank(this, i)
        })
        timeLine.to({}, {duration: 15})
        timeLine.call(() => {
            for (let i = 0; i < 25; i++) new Enemy(this, i)
        })



        this.tower = new Tower2(this);
        this.tower.position.set(128*5, 128*4);
        //
        //
        this.tower2 = new Tower2(this);
        this.tower2.position.set(128*5, 128*7);

        // this.tower3 = new Tower(this);
        // this.tower3.position.set(128*9, 128*3);
        //
        //
        // this.tower4 = new Tower(this);
        // this.tower4.position.set(128*13, 128*6);
        //
        // this.tower5 = new Tower(this);
        // this.tower5.position.set(128*15, 128*6);




        this.onResize();
    }

}
