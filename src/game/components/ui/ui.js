import {Container} from "pixi.js";
import {menuMap} from "../../../config/menu-map.js";
import {TowerCreateIcon} from "./tower-create-icon.js";

export class Menu extends Container{
    constructor(stage) {
        super();
        stage.addChild(this);
        menuMap.forEach(item => new TowerCreateIcon(this, item))
    }
}