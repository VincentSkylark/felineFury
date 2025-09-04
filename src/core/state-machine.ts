import { State } from './state';

export class StateMachine {
  private currentState: State;

  constructor(initialState: State, ...enterArgs: any) {
    this.currentState = initialState;
    this.currentState.onEnter?.(...enterArgs);
  }

  setState(newState: State, ...enterArgs: any) {
    this.currentState.onLeave?.();
    this.currentState = newState;
    this.currentState.onEnter?.(...enterArgs);
  }

  resumeState(newState: State) {
    // Resume a state without calling onEnter - used for pause/resume
    this.currentState.onLeave?.();
    this.currentState = newState;
  }

  update(timeElapsed: number) {
    this.currentState.onUpdate(timeElapsed);
  }

  getState() {
    return this.currentState;
  }
}
