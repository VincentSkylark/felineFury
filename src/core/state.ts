export interface State {
  onUpdate: (timeElapsed: number) => void;
  onDraw: () => void;
  onEnter?: Function;
  onLeave?: Function;
}