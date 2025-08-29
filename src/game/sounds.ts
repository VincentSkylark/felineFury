import { SimplifiedTune } from '@/core/audio-engine';

export const attackSound: SimplifiedTune = {
    sawtooth: ['A0.5', 'E1'],
};

export const enemyDeathSound: SimplifiedTune = {
    sine: [],
    square: ['a1', 'a_1.5'],
};

export const gameStartSound: SimplifiedTune = {
    sine: ['c1', 'e1', 'g1', 'C2'],
};

export const backgroundMusic: SimplifiedTune = {
    sine: ['c1', 'e1', 'g1', 'C2'], // main theme
    square: ['c1', 'e1', 'g1', 'C2'], // melody
    triangle: ['c1', 'e1', 'g1', 'C2'], // base channel
    sawtooth: ['c1', 'e1', 'g1', 'C2'], // beats
};
