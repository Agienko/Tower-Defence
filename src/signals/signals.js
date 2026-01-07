import {computed, signal} from "@preact/signals-core";

export const SIGNALS = {
    hp: signal(100),
    money: signal(4000000), // 2000


    enemiesOnBase: signal(0),
    miniBlockVisible: signal(true),
    towersAmount: signal(0),
    buildingsAmount: signal(0),
    enemiesAmount: signal(0),
    timeLineWaveInProcess: signal(false),
    waveInProcess: computed(() => SIGNALS.timeLineWaveInProcess.value || !!SIGNALS.enemiesAmount.value),
    wave: signal(0),
    diedEnemies: signal(0),
    fastText: signal(''),
    towerCost: computed(() => 500 + 500*SIGNALS.towersAmount.value**2),
    buildingCost: computed(() => 10000 + 5000*SIGNALS.buildingsAmount.value**2)
}


window.SIGNALS = SIGNALS;