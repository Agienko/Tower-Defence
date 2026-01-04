import {Container, Sprite} from "pixi.js";
import {decorMap, roadMap} from "../../config/map.js";
import {createTexture} from "../../helpers/helper.js";

export class WorldBuilder extends Container{
    constructor(stage) {
        super();
        stage.addChild(this);
        roadMap.forEach((row, j) => row.forEach((name, i) => {
            const sprite = new Sprite({
                texture: createTexture(name),
                width: 128,
                height: 128,
                x: i * 128,
                y: j * 128
            })
            this.addChild(sprite);

            decorMap.forEach(decoration => {
                const needCreate = decoration.position.i === i && decoration.position.j === j;
                if (!needCreate ) return;
                const sprite = new Sprite({
                    texture: createTexture(decoration.name),
                    width: 128,
                    height: 128,
                    x: i * 128,
                    y: j * 128
                })
                this.addChild(sprite);
            })
        }));
    }
}