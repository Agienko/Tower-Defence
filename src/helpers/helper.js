import {Graphics, Texture} from "pixi.js";

export const randomMinMax = (min, max) => Math.random() * (max - min) + min;

export const getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const randomFromArr = arr => arr[Math.floor(Math.random() * arr.length)];


export const createTexture = name => Texture.from(`towerDefense_tile${name}`);


export const circlesCollide = (x1, y1, r1, x2, y2, r2) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distanceSq = dx * dx + dy * dy;
    const radiusSum = r1 + r2;

    return distanceSq <= radiusSum * radiusSum;
}

export const drawCircle = (x, y, radius = 10, color = 0xffffff, alpha = 0.5) => {
    const circle = new Graphics();
    circle.circle(x, y, radius);
    circle.fill({ color, alpha});
    return circle;
}