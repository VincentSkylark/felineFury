import { SimplifiedTune } from '@/core/audio-engine';

export const attackSound: SimplifiedTune = {
    sawtooth: ['A0.5', 'E1'],
};

export const enemyDeathSound: SimplifiedTune = {
    square: ['a1', 'a_1.5'],
};

export const backgroundMusic: SimplifiedTune = {
    sine: ['C4', 'C2', 'a2', 'g2', '-2', 'e2', '-2', 'd2', 'e2', 'g8', '-8', 'a4', 'a2', 'C2', 'a2', '-2', 'E2', '-2', 'D2', 'C2', 'D8', '-8', 'C2', 'D2', 'E2', '-2', 'g2', '-2', 'a2', 'C2', '-4', 'D2', 'C2', 'D2', 'E2', 'D2', '-2', 'D2', 'C2', 'D2', 'E2', 'G2', 'E2', 'G2', 'A2', 'G2', 'E2', 'D2', 'E2', 'C4', '-4'],
    square: ['c4', 'd4', 'e4', 'f4', 'e4', 'd4', 'e4', 'c4', 'd4', 'e4', 'd4', 'c4', 'b_4', 'a_4', 'b_4', 'g_4'],
    triangle: ['c_2', 'c_2', 'c2', 'c_2', 'c_2', '-2', 'b_2', 'c2'],
};

export const bossBattleMusic: SimplifiedTune = {
    square: [
        'a2', 'D#2', 'D2', 'C2', 'C2', 'D1', 'C1', 'g2', 'a2', 'a2', 'D#2', 'D2', 'C2', 'C2', 'D1', 'C1', 'g2', 'a2', 'D2', 'A2', 'G#2', 'F#2', 'F#2', 'G#1', 'F#1', 'C2', 'D2', 'D2', 'A2', 'G#2', 'F#2', 'F#2', 'G#1', 'F#1', 'C2', 'D2', 'a2', 'D#2', 'D2', 'C2', 'C2', 'D1', 'C1', 'g2', 'a2',
        'a2', 'D#2', 'D2', 'C2', 'C2', 'D1', 'C1', 'g2', 'a2', 'D2', 'A2', 'G#2', 'F#2', 'F#2', 'G#1', 'F#1', 'C2', 'D2', 'D2', 'A2', 'G#2', 'F#2', 'F#2', 'G#1', 'F#1', 'C2', 'D2',
        'a1', 'a1', 'a#1', 'a1', 'a#1', 'a1', 'C1', 'D1', 'a1', 'a1', 'a#1', 'a1', 'a#1', 'a1', 'C1', 'D1',
        'D1', 'D1', 'D#1', 'D1', 'D#1', 'D1', 'F#1', 'G1', 'D1', 'D1', 'D#1', 'D1', 'D#1', 'D1', 'F#1', 'G1',
        'D#1', 'D1', 'C#1', 'D1', 'D#1', 'D1', 'C#1', 'D1', 'G#1', 'G1', 'F#1', 'G1', 'G#1', 'G1', 'F#1', 'G1',
    ],
    triangle: ['g#_2', 'c2', 'g#_2', 'c2', 'g#_2', 'a_2', 'g#_2', 'c2',]
};

export const finalMusic: SimplifiedTune = {
    triangle: ['A1', '-1', 'A1', 'A4', 'F4', 'G4', 'A4', 'G1', 'A3'],
    sine: ['-8', 'C4', 'D4', 'E4', 'D1', 'E3']
};