import {Container, Text} from "pixi.js";
import {effect} from "@preact/signals-core";
import {SIGNALS} from "../signals/signals.js";
import {sender} from "../sender/event-sender.js";

export class MiniContent extends Container{
    constructor(stage) {
        super();
        stage.addChild(this);

        this.position.set(24, 24);


        sender.on('insertToMiniBlock', content => {
            while (this.children.length) this.children.at(-1).destroy({children: true});
            if(content) this.addChild(content)
        })

    }
    destroy(options) {
        // this.stop();
        // this.text.destroy();
        // this.text = null;
        super.destroy(options);

    }
}