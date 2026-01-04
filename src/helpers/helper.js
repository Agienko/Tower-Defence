import {Texture} from "pixi.js";

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