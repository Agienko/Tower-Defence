import {Container} from "pixi.js";
import {app} from "../main.js";
import {sender} from "../sender/event-sender.js";
import {roadMap} from "../config/map.js";

export class ScaleSystem extends Container{
    constructor(stage) {
        super();
        stage.addChild(this);
        this.pointers = new Map();
        this.startPos = {x: 0, y: 0};
        this.startDistance = 0;
        this.startScale = 1;

        this.currentScale = 1;
        this.orientation = this.getOrientation();

        this.worldMapWidth = roadMap[0].length * 128;
        this.worldMapHeight = roadMap.length * 128;

        window.addEventListener('pointerdown', this.onPointerDown);
        window.addEventListener('pointermove', this.onPointerMove);
        window.addEventListener('wheel', this.onWheel);
        window.addEventListener('pointerup', this.onPointerUp);
        window.addEventListener('pointercancel', this.onPointerUp);

        this.viewPort = window.visualViewport ?? window;
        this.viewPort.addEventListener('resize', this.onResize);

        window.addEventListener('orientationchange', () => this.centerAndScale());

        sender.on('worldMapToCenter', () => this.centerAndScale());

        this.centerAndScale();

    }

    getOrientation(){
        return innerWidth > innerHeight ? 'landscape' : 'portrait';
    }

    centerAndScale(){
        const sx = (innerWidth) / this.worldMapWidth;
        const sy = (innerHeight) / this.worldMapHeight;
        this.currentScale = Math.min(sx, sy);

        this.scale.set(this.currentScale);
        this.x = (innerWidth - this.worldMapWidth * this.currentScale) / 2;
        this.y = (innerHeight - this.worldMapHeight * this.currentScale) / 2;
    }

    onWheel = (e) => {
        const delta = -Math.sign(e.deltaY) * 0.1*this.currentScale;

        const worldX = (e.x - this.x) / this.currentScale;
        const worldY = (e.y - this.y) / this.currentScale;
        this.currentScale +=  delta;

        this.scale.set(this.currentScale);

        this.x = e.x - worldX * this.currentScale;
        this.y = e.y - worldY * this.currentScale;
    }
    onResize = () => {
        app.renderer.resize(innerWidth, innerHeight);
        sender.send('resize')
        const orientation = this.getOrientation();
        if(orientation !== this.orientation){
            this.orientation = orientation;
            this.centerAndScale();
        }

    }
    onPointerDown = (e) => {
        this.pointers.set(e.pointerId, {x: e.x, y: e.y});
        if(this.pointers.size > 1) return
        this.startPos.x = e.x - this.x;
        this.startPos.y = e.y - this.y;
    }
    onPointerMove = (e) => {
        if (!this.pointers.has(e.pointerId)) return;
        this.pointers.set(e.pointerId, {x: e.x, y: e.y});

        if(this.pointers.size === 1){
            this.position.set(e.x - this.startPos.x, e.y - this.startPos.y);
        } else if(this.pointers.size === 2){
            const [p1, p2] = [...this.pointers.values()];
            const distance = this.getDistance(p1, p2);

            if(!this.startDistance){
                this.startDistance = distance;
                this.startScale = this.currentScale;
            }

            const center = {x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2};
            const worldX = (center.x - this.x) / this.currentScale;
            const worldY = (center.y - this.y) / this.currentScale;

            this.currentScale = this.startScale * distance / this.startDistance;
            this.scale.set(this.currentScale);

            this.x = center.x - worldX * this.currentScale;
            this.y = center.y - worldY * this.currentScale;
        }

    }
    onPointerUp = e => {
        this.pointers.delete(e.pointerId);
        if (this.pointers.size < 2) {
            this.startDistance = 0;
        }

        if(this.pointers.size === 1){
            const pos = this.pointers.values().next().value;
            this.startPos.x = pos.x - this.x;
            this.startPos.y = pos.y - this.y;
        }else if(this.pointers.size === 0) {
            app.stage.eventMode = 'static';
        }

    }

    getDistance(t1, t2) {
        const dx = t2.x - t1.x;
        const dy = t2.y - t1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
}