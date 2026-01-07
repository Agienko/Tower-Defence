import {ProtectCircle} from "../aviation/protect-circle.js";
import {Mine} from "./mine.js";
import {circlesCollide} from "../../../helpers/helper.js";
import {gsap} from "gsap";

export class MineCircle extends ProtectCircle{
    constructor(stage, params) {
        super(stage, params);
        this.stage = stage;

        this.body.alpha = 0.15;
        this.alpha = 1;
        this.graphics.alpha = 0.3;
        this.minesAmount = 45;
        this.tween = null;

        this.mines = new Set();

        this.lastUpdate = 0;

        this.updateMinesTween = null;

    }

    startCycle(){
        this.updateMinesTween?.kill();
        this.updateMinesTween = gsap.to({}, {duration: 5, repeat: -1, onRepeat: () => {
                const hasEnemyOn = this.hasEnemyOn();
                if(hasEnemyOn) return;
                if(performance.now() - this.lastUpdate > 10_000) this.checkMinesUpdate();
            }});
    }

    fixed(){
        super.fixed();
        this.body.alpha = 0.1;
        this.checkMinesUpdate();
        this.startCycle()
    }
    unfixed(){
        super.unfixed();
        this.body.alpha = 0.15;
        this.mines.forEach(mine => mine.destroy({children: true}));
        this.mines.clear();
        this.updateMinesTween?.kill();
    }

    checkMinesUpdate(){
        this.lastUpdate = performance.now();
        const existedMines = [...this.mines].map(mine => mine.position.clone());
        this.createMines(existedMines, 8, this.minesAmount).forEach(pos => {
            if(existedMines.some(p => p.x === pos.x && p.y === pos.y)) return;
            const worldPos = this.stage.parent.toLocal(pos, this);
            const mine = new Mine(this.stage.parent, () => {
                this.mines.delete(mine);
                this.lastUpdate = performance.now();
            });
            mine.position.set(worldPos.x, worldPos.y);
            this.mines.add(mine);
        })
    }

    hasEnemyOn(){
        const enemiesContainer = this.stage.parent;
        return enemiesContainer.children.some(child => {
            if(child.type !== 'enemy') return;
            const childPos = this.toLocal(child.body.getGlobalPosition());
            return circlesCollide(this.body.x, this.body.y, this.params.detectionRadius, childPos.x, childPos.y, child.detectRadius);

        })
    }
    createMines(arr, r, N, maxTries = 200000) {
        const pts = [...arr];
        const minDist2 = 4*r*r;
        const dif = this.params.detectionRadius - r;

        for (let t = 0; t < maxTries && pts.length < N; t++) {

            const a = Math.random() * Math.PI * 2;
            const rr = Math.sqrt(Math.random()) * dif;
            const x = Math.cos(a) * rr;
            const y = Math.sin(a) * rr;

            let ok = true;
            for (let i = 0; i < pts.length; i++) {
                const dx = x - pts[i].x;
                const dy = y - pts[i].y;
                if (dx * dx + dy * dy < minDist2) {
                    ok = false;
                    break;
                }
            }
            if (ok) pts.push({ x, y });
        }

        return pts;
    }

    createIcon(){
        return null;
    }
    destroy(options) {

        this.tween?.kill();
        this.tween = null;
        this.updateMinesTween?.kill();
        this.updateMinesTween = null;
        this.mines.forEach(mine => mine.destroy({children: true}));
        this.mines.clear();
        super.destroy(options);
    }

}