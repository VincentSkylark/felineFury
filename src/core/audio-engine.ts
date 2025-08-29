export type Waveform = 'sine' | 'square' | 'triangle' | 'sawtooth';
export type Note = [number | null, Waveform, number];
export type Track = Note[];
export type Tune = Track[];

export type SimplifiedTrack = string[];
export type SimplifiedTune = {
    sine?: SimplifiedTrack;
    square?: SimplifiedTrack;
    sawtooth?: SimplifiedTrack;
    triangle?: SimplifiedTrack;
};

const noteFrequencies = {
    'c_': 130.81, 'c#_': 138.59, 'd_': 146.83, 'd#_': 155.56, 'e_': 164.81, 'f_': 174.61, 'f#_': 185.00, 'g_': 196.00, 'g#_': 207.65, 'a_': 220.00, 'a#_': 233.08, 'b_': 246.94,
    'c': 261.63, 'c#': 277.18, 'd': 293.66, 'd#': 311.13, 'e': 329.63, 'f': 349.23, 'f#': 369.99, 'g': 392.00, 'g#': 415.30, 'a': 440.00, 'a#': 466.16, 'b': 493.88,
    'C': 523.25, 'C#': 554.37, 'D': 587.33, 'D#': 622.25, 'E': 659.25, 'F': 698.46, 'F#': 739.99, 'G': 783.99, 'G#': 830.61, 'A': 880.00, 'A#': 932.33, 'B': 987.77,
};

class AudioEngine {
  private audioCtx: AudioContext | null = null;
  private isEnabled = false;
  private activeLoops: Map<Tune | SimplifiedTune, number> = new Map();

  public init() {
    if (this.audioCtx) {
      return;
    }
    try {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.isEnabled = true;
    } catch (e) {
      console.error("Web Audio API is not supported in this browser");
      this.isEnabled = false;
    }
  }

  private isSimplifiedTune(tune: any): tune is SimplifiedTune {
      return tune && (tune.sine || tune.square || tune.sawtooth || tune.triangle);
  }

  private compileSimplifiedTune(simplifiedTune: SimplifiedTune): Tune {
      const tune: Tune = [];

      const processTrack = (notes: string[] | undefined, waveform: Waveform): Track | null => {
          if (!notes || notes.length === 0) {
              return null;
          }
          const track: Track = notes.map(noteString => {
              const match = noteString.match(/^([a-gA-G]#?_?|[-_])([\d.]+)$/);
              if (!match) {
                  console.warn(`Invalid note format: ${noteString}`);
                  return [null, waveform, 0];
              }
              const [, noteName, paceStr] = match;
              const pace = parseFloat(paceStr);
              const duration = pace * 0.1;

              if (noteName === '-' || noteName === '_') {
                  return [null, waveform, duration];
              }

              const frequency = noteFrequencies[noteName as keyof typeof noteFrequencies];
              if (frequency === undefined) {
                  console.warn(`Unknown note: ${noteName}`);
                  return [null, waveform, duration];
              }

              return [frequency, waveform, duration];
          });
          return track;
      };

      const sineTrack = processTrack(simplifiedTune.sine, 'sine');
      if (sineTrack) tune.push(sineTrack);

      const squareTrack = processTrack(simplifiedTune.square, 'square');
      if (squareTrack) tune.push(squareTrack);

      const sawtoothTrack = processTrack(simplifiedTune.sawtooth, 'sawtooth');
      if (sawtoothTrack) tune.push(sawtoothTrack);

      const triangleTrack = processTrack(simplifiedTune.triangle, 'triangle');
      if (triangleTrack) tune.push(triangleTrack);

      return tune;
  }

  public play(tune: Tune | SimplifiedTune, loop = false) {
    if (!this.isEnabled || !this.audioCtx) {
      return;
    }

    let finalTune: Tune;
    if (this.isSimplifiedTune(tune)) {
      finalTune = this.compileSimplifiedTune(tune as SimplifiedTune);
    } else {
      finalTune = tune as Tune;
    }

    const masterGain = this.audioCtx.createGain();
    masterGain.gain.value = 0.3; // Master volume
    masterGain.connect(this.audioCtx.destination);

    let tuneDuration = 0;

    finalTune.forEach(track => {
      let trackTime = 0;
      const startTime = this.audioCtx!.currentTime;

      track.forEach(([freq, wave, duration]) => {
        if (freq) {
          const osc = this.audioCtx!.createOscillator();
          osc.type = wave;
          osc.frequency.setValueAtTime(freq, startTime + trackTime);

          const gain = this.audioCtx!.createGain();
          gain.gain.setValueAtTime(0.001, startTime + trackTime);
          gain.gain.linearRampToValueAtTime(0.3, startTime + trackTime + 0.05); // attack
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + trackTime + duration); // decay

          osc.connect(gain).connect(masterGain);

          osc.start(startTime + trackTime);
          osc.stop(startTime + trackTime + duration);
        }
        trackTime += duration;
      });

      if (trackTime > tuneDuration) {
        tuneDuration = trackTime;
      }
    });

    if (loop) {
      const timerId = window.setTimeout(() => {
        this.play(tune, true);
      }, tuneDuration * 1000);
      this.activeLoops.set(tune, timerId);
    }
  }

  public stop(tune: Tune | SimplifiedTune) {
    if (this.activeLoops.has(tune)) {
      clearTimeout(this.activeLoops.get(tune)!);
      this.activeLoops.delete(tune);
    }
  }

  public stopAll() {
    this.activeLoops.forEach(timerId => {
      clearTimeout(timerId);
    });
    this.activeLoops.clear();
  }
}

export const audioEngine = new AudioEngine();
