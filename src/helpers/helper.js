import {Graphics, Texture} from "pixi.js";

export const randomMinMax = (min, max) => Math.random() * (max - min) + min;

export const getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const randomFromArr = arr => arr[Math.floor(Math.random() * arr.length)];


export const createTexture = name => Texture.from(`towerDefense_tile${name}`);

export const randomPointInCircle = (cx, cy, radius) =>{
    const angle = Math.random() * 2 * Math.PI;
    const distance = Math.sqrt(Math.random()) * radius;

    const x = cx + Math.cos(angle) * distance;
    const y = cy + Math.sin(angle) * distance;

    return { x, y };
}


export const circlesCollide = (x1, y1, r1, x2, y2, r2) => {
    const dx = x1 - x2;
    const dy = y2 - y1;
    const radiusSum = r1 + r2;
    if (dx > radiusSum || dy > radiusSum || dx < -radiusSum || dy < -radiusSum) return false;
    return dx * dx + dy * dy <= radiusSum * radiusSum;
}

export const drawCircle = (x, y, radius = 10, color = 0xffffff, alpha = 0.5) => {
    const circle = new Graphics();
    circle.circle(x, y, radius);
    circle.fill({ color, alpha});
    return circle;
}