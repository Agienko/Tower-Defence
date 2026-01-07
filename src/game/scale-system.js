import {Container} from "pixi.js";

export class ScaleSystem extends Container{
    constructor(stage) {
        super();
        stage.addChild(this);
        this.downFlag = false;
        this.startPos = {x: 0, y: 0};

        this.activeTouches = {};
        this.lastDist = 0;

        this.eventMode = 'static';
        this.on('pointerdown', this.onPointerDown)

        this.on('globalpointermove', this.onPointerMove);
        this.on('wheel', this.onWheel);

        window.addEventListener('pointerup', this.onPointerUp);
        window.addEventListener('pointerleave', this.onPointerUp);
        window.addEventListener('blur', this.onPointerUp);
        window.addEventListener('pointercancel', this.onPointerUp);


        const viewPort = window.visualViewport ?? window;
        viewPort.addEventListener('resize', this.onResize);

    }

    onWheel = (e) => {
        const scale = this.scale.y;
        const delta = -Math.sign(e.deltaY) * 0.1*scale;

        const widthRatio = window.innerWidth / (this.width / scale);
        const heightRatio = window.innerHeight / (this.height / scale);
        const minScale = Math.max(widthRatio, heightRatio);

        const newScale = Math.max(scale + delta, minScale);

        if (newScale !== scale) {
            const localPos = this.toLocal(e.global);
            this.scale.set(newScale);
            const newX = e.global.x - localPos.x * this.scale.x;
            const newY = e.global.y - localPos.y * this.scale.y;
            this.#normalizePosition(newX, newY);
        }
    }
    onResize = () => {
        this.onWheel({ deltaY: 0, global: {x: this.x, y: this.y}})
        this.#normalizePosition(this.x, this.y);
    }
    onPointerDown = (e) => {

        this.activeTouches[e.pointerId] = e.global.clone();

        const touchIds = Object.keys(this.activeTouches);


        if (touchIds.length === 1) {
            this.startPos = {x: e.global.x - this.x, y: e.global.y - this.y};
            this.downFlag = true;
            this.cursor = 'move';
        } else if (touchIds.length === 2) {
            // Якщо два пальці — рахуємо початкову відстань
            const p1 = this.activeTouches[touchIds[0]];
            const p2 = this.activeTouches[touchIds[1]];
            this.lastDist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
            this.downFlag = false; // Вимикаємо перетягування при скейлі
        }
    }
    onPointerMove = (e) => {
        if (this.activeTouches[e.pointerId]) {
            this.activeTouches[e.pointerId].copyFrom(e.global);
        }

        const touchIds = Object.keys(this.activeTouches);

        if (touchIds.length === 2) {
            // Пінч-зум (двома пальцями)
            const p1 = this.activeTouches[touchIds[0]];
            const p2 = this.activeTouches[touchIds[1]];
            const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);

            if (this.lastDist > 0) {
                const ratio = dist / this.lastDist;
                const scale = this.scale.y;
                const newScaleRaw = scale * ratio;

                // Центр між пальцями для фокусу масштабу
                const center = {
                    x: (p1.x + p2.x) / 2,
                    y: (p1.y + p2.y) / 2
                };

                // Логіка як в onWheel, але з новим коефіцієнтом
                const widthRatio = window.innerWidth / (this.width / scale);
                const heightRatio = window.innerHeight / (this.height / scale);
                const minScale = Math.max(widthRatio, heightRatio);
                const newScale = Math.max(newScaleRaw, minScale);

                if (newScale !== scale) {
                    const localPos = this.toLocal(center);
                    this.scale.set(newScale);
                    const newX = center.x - localPos.x * this.scale.x;
                    const newY = center.y - localPos.y * this.scale.y;
                    this.#normalizePosition(newX, newY);
                }
            }
            this.lastDist = dist;
        } else if (this.downFlag && touchIds.length === 1) {
            // Звичайне перетягування (одним пальцем)
            const diffX = e.global.x - this.startPos.x;
            const diffY = e.global.y - this.startPos.y;
            this.#normalizePosition(diffX, diffY);
        }
    }
    onPointerUp = e => {
        // Видаляємо точку дотику (обробляємо і Native Event, і Pixi Event)
        const id = e?.pointerId;
        if (id !== undefined) {
            delete this.activeTouches[id];
        } else {
            this.activeTouches = {}; // На випадок blur/resize скидаємо все
        }

        if (Object.keys(this.activeTouches).length < 2) {
            this.lastDist = 0;
        }

        if (Object.keys(this.activeTouches).length === 0) {
            this.downFlag = false;
            this.cursor = 'auto';
        }
    }

    #normalizePosition(x, y) {
        const normX = Math.min(Math.max(x, window.innerWidth - this.width), 0);
        const normY = Math.min(Math.max(y,  window.innerHeight - this.height), 0);
        this.position.set(normX, normY);
    }
    destroy(options) {
        this.off('pointerdown', this.onPointerDown)

        this.off('globalpointermove', this.onPointerMove);
        this.off('wheel', this.onWheel);

        window.removeEventListener('pointerup', this.onPointerUp);
        window.removeEventListener('pointerleave', this.onPointerUp);
        window.removeEventListener('blur', this.onPointerUp);
        window.removeEventListener('pointercancel', this.onPointerUp);
        window.removeEventListener('resize', this.onResize);
        super.destroy(options);
    }
}