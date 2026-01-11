import {computed, signal} from "@preact/signals-core";

export const SIGNALS = {
    hp: signal(100),
    money: signal(16000), // 16000
    enemiesOnBase: signal(0),
    miniBlockVisible: signal(false),
    towersAmount: signal(0),
    buildingsAmount: signal(0),
    enemiesAmount: signal(0),
    timeLineWaveInProcess: signal(false),
    waveInProcess: computed(() => SIGNALS.timeLineWaveInProcess.value || !!SIGNALS.enemiesAmount.value),
    wave: signal(0),
    diedEnemies: signal(0),
    towerCost: computed(() => 500 + 250*SIGNALS.towersAmount.value**2),
    buildingCost: computed(() => 2000 + 2500*SIGNALS.buildingsAmount.value**2),
    globalSpeed: signal(1),
}


window.SIGNALS = SIGNALS;