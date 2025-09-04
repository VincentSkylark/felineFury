export type Waveform = 'sine' | 'square' | 'triangle' | 'sawtooth';
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

type CompiledNote = [number | null, Waveform, number];
type CompiledTrack = CompiledNote[];

class AudioEngine {
  private audioCtx: AudioContext | null = null;
  private isEnabled = false;
  private musicEnabled = true; // Global music setting
  private activeLoops: Map<SimplifiedTune, number> = new Map();
  private activeOscillators: OscillatorNode[] = [];

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

  private compileSimplifiedTune(simplifiedTune: SimplifiedTune): CompiledTrack[] {
    const tracks: CompiledTrack[] = [];

    const processTrack = (notes: string[] | undefined, waveform: Waveform): CompiledTrack | null => {
      if (!notes || notes.length === 0) {
        return null;
      }
      const track: CompiledTrack = notes.map(noteString => {
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
    if (sineTrack) tracks.push(sineTrack);

    const squareTrack = processTrack(simplifiedTune.square, 'square');
    if (squareTrack) tracks.push(squareTrack);

    const sawtoothTrack = processTrack(simplifiedTune.sawtooth, 'sawtooth');
    if (sawtoothTrack) tracks.push(sawtoothTrack);

    const triangleTrack = processTrack(simplifiedTune.triangle, 'triangle');
    if (triangleTrack) tracks.push(triangleTrack);

    return tracks;
  }

  public play(tune: SimplifiedTune, volume: number = 0.3) {
    if (!this.isEnabled || !this.audioCtx) {
      return;
    }

    const compiledTune = this.compileSimplifiedTune(tune);

    const masterGain = this.audioCtx.createGain();
    masterGain.gain.value = volume; // Master volume
    masterGain.connect(this.audioCtx.destination);

    compiledTune.forEach(track => {
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

          // Track the oscillator for immediate stopping
          this.activeOscillators.push(osc);
          osc.onended = () => {
            const index = this.activeOscillators.indexOf(osc);
            if (index > -1) {
              this.activeOscillators.splice(index, 1);
            }
          };

          osc.start(startTime + trackTime);
          osc.stop(startTime + trackTime + duration);
        }
        trackTime += duration;
      });
    });
  }

  // Custom volumes: [sine, square, sawtooth, triangle]
  public playLoop(tune: SimplifiedTune, volumes?: number[]) {
    if (!this.isEnabled || !this.audioCtx || !this.musicEnabled) {
      return;
    }

    this.stopLoop(tune);

    const compiledTune = this.compileSimplifiedTune(tune);
    let tuneDuration = 0;

    // Calculate the maximum duration
    compiledTune.forEach(track => {
      let trackTime = 0;
      track.forEach(([, , duration]) => {
        trackTime += duration;
      });
      if (trackTime > tuneDuration) {
        tuneDuration = trackTime;
      }
    });

    // Extend shorter tracks to match the longest duration
    const normalizedTracks = compiledTune.map(track => {
      let trackTime = 0;
      track.forEach(([, , duration]) => {
        trackTime += duration;
      });

      if (trackTime >= tuneDuration) {
        return track;
      }

      // Repeat the track to fill the duration
      const extendedTrack: CompiledNote[] = [...track];
      let currentTime = trackTime;

      while (currentTime < tuneDuration) {
        for (const note of track) {
          if (currentTime >= tuneDuration) break;

          const [freq, wave, duration] = note;
          const remainingTime = tuneDuration - currentTime;
          const noteDuration = Math.min(duration, remainingTime);

          extendedTrack.push([freq, wave, noteDuration]);
          currentTime += noteDuration;
        }
      }

      return extendedTrack;
    });

    const playOnce = () => {
      const masterGain = this.audioCtx!.createGain();
      masterGain.gain.value = 0.3; // Master volume
      masterGain.connect(this.audioCtx!.destination);

      normalizedTracks.forEach((track, trackIndex) => {
        let trackTime = 0;
        const startTime = this.audioCtx!.currentTime;
        const trackVolume = volumes && volumes[trackIndex] !== undefined ? volumes[trackIndex] : 0.3;

        track.forEach(([freq, wave, duration]) => {
          if (freq) {
            const osc = this.audioCtx!.createOscillator();
            osc.type = wave;
            osc.frequency.setValueAtTime(freq, startTime + trackTime);

            const gain = this.audioCtx!.createGain();
            gain.gain.setValueAtTime(0.001, startTime + trackTime);
            gain.gain.linearRampToValueAtTime(trackVolume, startTime + trackTime + 0.05); // attack
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + trackTime + duration); // decay

            osc.connect(gain).connect(masterGain);

            // Track the oscillator for immediate stopping
            this.activeOscillators.push(osc);
            osc.onended = () => {
              const index = this.activeOscillators.indexOf(osc);
              if (index > -1) {
                this.activeOscillators.splice(index, 1);
              }
            };

            osc.start(startTime + trackTime);
            osc.stop(startTime + trackTime + duration);
          }
          trackTime += duration;
        });
      });
    };

    // Start the loop
    playOnce();
    const timerId = window.setInterval(playOnce, tuneDuration * 1000);
    this.activeLoops.set(tune, timerId);
  }

  public stopLoop(tune: SimplifiedTune) {
    if (this.activeLoops.has(tune)) {
      clearInterval(this.activeLoops.get(tune)!);
      this.activeLoops.delete(tune);
    }

    // Note: For immediate stopping of a specific tune's oscillators, 
    // we would need to track which oscillators belong to which tune.
    // For now, this stops the loop timer but oscillators may continue 
    // until their natural end.
  }

  public stopAllLoops() {
    // Stop all loop timers
    this.activeLoops.forEach(timerId => {
      clearInterval(timerId);
    });
    this.activeLoops.clear();

    // Immediately stop all active oscillators
    this.activeOscillators.forEach(osc => {
      try {
        osc.stop();
      } catch (e) {
        // Oscillator may already be stopped, ignore the error
      }
    });
    this.activeOscillators.length = 0; // Clear the array
  }

  public setMusicEnabled(enabled: boolean): void {
    this.musicEnabled = enabled;
    if (!enabled) {
      // If music is disabled, stop all currently playing loops
      this.stopAllLoops();
    }
  }

  public isMusicEnabled(): boolean {
    return this.musicEnabled;
  }
}

export const audioEngine = new AudioEngine();
