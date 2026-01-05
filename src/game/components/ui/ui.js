import {Container} from "pixi.js";
import {towersMap} from "../../../config/towers-map.js";
import {TowerCreateIcon} from "./tower-create-icon.js";

export class Ui extends Container{
    constructor(stage) {
        super();
        stage.addChild(this);
        towersMap.forEach(item => new TowerCreateIcon(this, item))
    }
}