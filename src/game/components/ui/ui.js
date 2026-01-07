import {Container} from "pixi.js";
import {buildingsMap} from "../../../config/buildings-map.js";
import {TowerCreateIcon} from "./tower-create-icon.js";
import {BuildingCreateIcon} from "./building-create-icon.js";
import {signal} from "@preact/signals-core";

export class Ui extends Container{
    constructor(stage) {
        super();
        stage.addChild(this);
        this.activeIcon = signal(null);
        buildingsMap.forEach(item => {

            switch (item.type) {
                case 'tower': return new TowerCreateIcon(this, item, this.activeIcon);
                case 'building': return new BuildingCreateIcon(this, item, this.activeIcon);
                default: throw new Error(`unknown building type: ${item.type}`)
            }

        })
    }
}