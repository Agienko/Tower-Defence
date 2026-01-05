import {BgBuilder} from "./components/bg-builder/bg-builder.js";
import {ScaleSystem} from "./scale-system.js";

import {RemainsBuilder} from "./components/remains-builder/remains-builder.js";
import {Ui} from "./components/ui/ui.js";
import {World} from "./components/world/world.js";
import {effect} from "@preact/signals-core";
import {SIGNALS} from "../signals/signals.js";

export class Game extends ScaleSystem{
    constructor(stage) {
        super(stage);

        this.bgBuilder = new BgBuilder(this);
        this.remainsContainer = new RemainsBuilder(this);
        this.menu = new Ui(this);
        this.world = new World(this);


       this.diedEnemies = SIGNALS.diedEnemies.value

        effect(() => {
            const diedDelta = SIGNALS.diedEnemies.value - this.diedEnemies;
            if(!diedDelta) return;
            this.diedEnemies = SIGNALS.diedEnemies.value;
            const add = 250 * diedDelta * SIGNALS.wave.peek();
            SIGNALS.money.value = SIGNALS.money.peek() + add
        })

        this.enemiesOnBase = SIGNALS.enemiesOnBase.value

        effect(() => {
            const delta = SIGNALS.enemiesOnBase.value - this.enemiesOnBase;
            if(!delta) return;
            this.enemiesOnBase = SIGNALS.enemiesOnBase.value
            const add = delta * SIGNALS.wave.peek();
            console.log('add', add);
            SIGNALS.hp.value = SIGNALS.hp.peek() - add
        })


        this.onResize();
    }

}
