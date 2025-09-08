const enum XboxControllerButton {
  A,
  B,
  X,
  Y,
  LeftBumper,
  RightBumper,
  LeftTrigger,
  RightTrigger,
  Select,
  Start,
  L3,
  R3,
  DpadUp,
  DpadDown,
  DpadLeft,
  DpadRight,
}

class Controls {
  isUp = false;
  isDown = false;
  isLeft = false;
  isRight = false;
  isConfirm = false;
  isEscape = false;
  isAttacking = false;
  inputDirection: DOMPoint;

  keyMap: Map<string, boolean> = new Map();
  previousState = { isUp: this.isUp, isDown: this.isDown, isConfirm: this.isConfirm, isEscape: this.isEscape, isAttacking: this.isAttacking };

  // Mobile touch controls
  isMobile = false;
  mobileSpeedMultiplier = 0.7; // Reduce mobile movement speed by 30%
  touchControls = {
    joystick: null as HTMLElement | null,
    joystickKnob: null as HTMLElement | null,
    attackButton: null as HTMLElement | null,
    joystickCenter: { x: 0, y: 0 },
    joystickRadius: 75,
    isDragging: false,
    touchDirection: { x: 0, y: 0 },
    isAttackPressed: false,
    lastAttackTime: 0,
    attackThrottleMs: 200 // 200ms throttle between attacks
  };

  constructor() {
    document.addEventListener('keydown', event => this.toggleKey(event, true));
    document.addEventListener('keyup', event => this.toggleKey(event, false));
    this.inputDirection = new DOMPoint();

    // Detect mobile device
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      ('ontouchstart' in window) ||
      (navigator.maxTouchPoints > 0);

    if (this.isMobile) {
      this.setupMobileControls();
    }
  }

  queryController() {
    this.previousState.isUp = this.isUp;
    this.previousState.isDown = this.isDown;
    this.previousState.isConfirm = this.isConfirm;
    this.previousState.isEscape = this.isEscape;
    this.previousState.isAttacking = this.isAttacking;
    const gamepad = navigator.getGamepads()[0];
    const isButtonPressed = (button: XboxControllerButton) => gamepad?.buttons[button].pressed;

    const leftVal = (this.keyMap.get('KeyA') || this.keyMap.get('ArrowLeft') || isButtonPressed(XboxControllerButton.DpadLeft)) ? -1 : 0;
    const rightVal = (this.keyMap.get('KeyD') || this.keyMap.get('ArrowRight') || isButtonPressed(XboxControllerButton.DpadRight)) ? 1 : 0;
    const upVal = (this.keyMap.get('KeyW') || this.keyMap.get('ArrowUp') || isButtonPressed(XboxControllerButton.DpadUp)) ? -1 : 0;
    const downVal = (this.keyMap.get('KeyS') || this.keyMap.get('ArrowDown') || isButtonPressed(XboxControllerButton.DpadDown)) ? 1 : 0;

    // Combine keyboard, gamepad, and touch inputs
    let inputX = (leftVal + rightVal) || gamepad?.axes[0] || (this.isMobile ? this.touchControls.touchDirection.x : 0);
    let inputY = (upVal + downVal) || gamepad?.axes[1] || (this.isMobile ? this.touchControls.touchDirection.y : 0);

    // Apply mobile speed multiplier for touch controls
    if (this.isMobile && (this.touchControls.touchDirection.x !== 0 || this.touchControls.touchDirection.y !== 0)) {
      inputX *= this.mobileSpeedMultiplier;
      inputY *= this.mobileSpeedMultiplier;
    }

    this.inputDirection.x = inputX;
    this.inputDirection.y = inputY;

    const deadzone = 0.1;
    if (Math.hypot(this.inputDirection.x, this.inputDirection.y) < deadzone) {
      this.inputDirection.x = 0;
      this.inputDirection.y = 0;
    }

    this.isUp = this.inputDirection.y < 0;
    this.isDown = this.inputDirection.y > 0;
    this.isLeft = this.inputDirection.x < 0;
    this.isRight = this.inputDirection.x > 0;
    this.isConfirm = Boolean(this.keyMap.get('Enter') || isButtonPressed(XboxControllerButton.A) || isButtonPressed(XboxControllerButton.Start));
    this.isEscape = Boolean(this.keyMap.get('Escape') || isButtonPressed(XboxControllerButton.Select));

    const isKeyboardAttackPressed = Boolean(this.keyMap.get('KeyZ'));
    const isTouchAttackPressed = this.isMobile && this.touchControls.isAttackPressed;

    // Apply throttling only to touch attacks
    let canTouchAttack = true;
    if (isTouchAttackPressed) {
      const currentTime = Date.now();
      canTouchAttack = (currentTime - this.touchControls.lastAttackTime) >= this.touchControls.attackThrottleMs;
      if (canTouchAttack) {
        this.touchControls.lastAttackTime = currentTime;
      }
    }

    const isPrimaryAttackPressed = isKeyboardAttackPressed || (isTouchAttackPressed && canTouchAttack);
    this.isAttacking = isPrimaryAttackPressed && !this.previousState.isAttacking;
  }

  private toggleKey(event: KeyboardEvent, isPressed: boolean) {
    this.keyMap.set(event.code, isPressed);
  }

  setupMobileControls() {
    // Create joystick container - larger and better positioned
    const joystick = document.createElement('div');
    joystick.className = 'mobile-joystick';
    joystick.style.cssText = `
      position: fixed;
      bottom: 120px;
      left: 120px;
      width: 150px;
      height: 150px;
      background: rgba(255, 255, 255, 0.2);
      border: 3px solid rgba(255, 255, 255, 0.4);
      border-radius: 50%;
      z-index: 1000;
      touch-action: none;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    `;

    // Create joystick knob - larger and more visible
    const joystickKnob = document.createElement('div');
    joystickKnob.className = 'mobile-joystick-knob';
    joystickKnob.style.cssText = `
      position: absolute;
      width: 60px;
      height: 60px;
      background: rgba(255, 255, 255, 0.9);
      border: 2px solid rgba(200, 200, 200, 0.8);
      border-radius: 50%;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      transition: all 0.1s ease;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    `;

    // Create attack button - larger and better positioned
    const attackButton = document.createElement('div');
    attackButton.className = 'mobile-attack-button';
    attackButton.style.cssText = `
      position: fixed;
      bottom: 120px;
      right: 120px;
      width: 110px;
      height: 110px;
      background: rgba(255, 80, 80, 0.8);
      border: 3px solid rgba(255, 255, 255, 0.6);
      border-radius: 50%;
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 28px;
      touch-action: none;
      user-select: none;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      transition: all 0.1s ease;
    `;
    attackButton.textContent = 'Z';

    joystick.appendChild(joystickKnob);
    document.body.appendChild(joystick);
    document.body.appendChild(attackButton);

    this.touchControls.joystick = joystick;
    this.touchControls.joystickKnob = joystickKnob;
    this.touchControls.attackButton = attackButton;

    const rect = joystick.getBoundingClientRect();
    this.touchControls.joystickCenter.x = rect.left + rect.width / 2;
    this.touchControls.joystickCenter.y = rect.top + rect.height / 2;

    // Add touch event listeners
    this.addTouchEventListeners();
  }

  addTouchEventListeners() {
    const joystick = this.touchControls.joystick!;
    const attackButton = this.touchControls.attackButton!;

    // Joystick touch events
    joystick.addEventListener('touchstart', (e) => this.handleJoystickStart(e), { passive: false });
    joystick.addEventListener('touchmove', (e) => this.handleJoystickMove(e), { passive: false });
    joystick.addEventListener('touchend', (e) => this.handleJoystickEnd(e), { passive: false });

    // Attack button touch events
    attackButton.addEventListener('touchstart', (e) => this.handleAttackStart(e), { passive: false });
    attackButton.addEventListener('touchend', (e) => this.handleAttackEnd(e), { passive: false });

    // Global touch end to handle cases where touch ends outside elements
    document.addEventListener('touchend', (e) => this.handleGlobalTouchEnd(e), { passive: false });
  }

  handleJoystickStart(e: TouchEvent) {
    e.preventDefault();
    this.touchControls.isDragging = true;
    const rect = this.touchControls.joystick!.getBoundingClientRect();
    this.touchControls.joystickCenter.x = rect.left + rect.width / 2;
    this.touchControls.joystickCenter.y = rect.top + rect.height / 2;
  }

  handleJoystickMove(e: TouchEvent) {
    e.preventDefault();
    if (!this.touchControls.isDragging) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - this.touchControls.joystickCenter.x;
    const deltaY = touch.clientY - this.touchControls.joystickCenter.y;
    const distance = Math.hypot(deltaX, deltaY);
    const maxDistance = this.touchControls.joystickRadius;

    if (distance <= maxDistance) {
      this.touchControls.touchDirection.x = deltaX / maxDistance;
      this.touchControls.touchDirection.y = deltaY / maxDistance;
      this.touchControls.joystickKnob!.style.transform = `translate(${deltaX - 30}px, ${deltaY - 30}px)`;
    } else {
      const angle = Math.atan2(deltaY, deltaX);
      const limitedX = Math.cos(angle) * maxDistance;
      const limitedY = Math.sin(angle) * maxDistance;
      this.touchControls.touchDirection.x = limitedX / maxDistance;
      this.touchControls.touchDirection.y = limitedY / maxDistance;
      this.touchControls.joystickKnob!.style.transform = `translate(${limitedX - 30}px, ${limitedY - 30}px)`;
    }
  }

  handleJoystickEnd(e: TouchEvent) {
    e.preventDefault();
    this.touchControls.isDragging = false;
    this.touchControls.touchDirection.x = 0;
    this.touchControls.touchDirection.y = 0;
    this.touchControls.joystickKnob!.style.transform = 'translate(-50%, -50%)';
  }

  handleAttackStart(e: TouchEvent) {
    e.preventDefault();
    this.touchControls.isAttackPressed = true;
    this.touchControls.attackButton!.style.background = 'rgba(255, 30, 30, 0.95)';
    this.touchControls.attackButton!.style.transform = 'scale(0.95)';
    this.touchControls.attackButton!.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.5)';
  }

  handleAttackEnd(e: TouchEvent) {
    e.preventDefault();
    this.touchControls.isAttackPressed = false;
    this.touchControls.attackButton!.style.background = 'rgba(255, 80, 80, 0.8)';
    this.touchControls.attackButton!.style.transform = 'scale(1)';
    this.touchControls.attackButton!.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
  }

  handleGlobalTouchEnd(e: TouchEvent) {
    if (e.touches.length === 0) {
      this.handleJoystickEnd(e);
      this.handleAttackEnd(e);
    }
  }
}

export const controls = new Controls();
