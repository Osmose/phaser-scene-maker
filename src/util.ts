/* eslint-disable @typescript-eslint/no-unused-vars */
export type Direction = 'up' | 'down' | 'left' | 'right';

export const DIRECTIONS = ['up', 'down', 'left', 'right'];

export function oppositeDir(direction: Direction): Direction {
  switch (direction) {
    case 'left':
      return 'right';
    case 'right':
      return 'left';
    case 'up':
      return 'down';
    case 'down':
      return 'up';
  }
}

export function gridMove(x: number, y: number, direction: Direction) {
  switch (direction) {
    case 'left':
      return [x - 1, y];
    case 'right':
      return [x + 1, y];
    case 'up':
      return [x, y - 1];
    case 'down':
      return [x, y + 1];
  }
}

/**
 * Returns the number of pixels to move something at a rate of pixelsPerSecond
 * over a period of delta milliseconds.
 */
export function pixelDiff(pixelsPerSecond: number, deltaMs: number): number {
  return pixelsPerSecond * (deltaMs / 1000);
}

/** Choose a single value from the given list randomly and return it. */
export function randomChoice<T>(list: T[]): T {
  const index = Math.floor(Math.random() * list.length);
  return list[index];
}

export class StateMachine {
  initialState: string;
  possibleStates: { [key: string]: State };
  stateArgs: unknown[];
  state: string | null;

  constructor(initialState: string, possibleStates: { [key: string]: State }, stateArgs: unknown[] = []) {
    this.initialState = initialState;
    this.possibleStates = possibleStates;
    this.stateArgs = stateArgs;
    this.state = null;

    // State instances get access to the state machine via this.stateMachine.
    // This is annoyingly implicit, but the alternative is fucking up a bunch
    // of method signatures that won't otherwise use this.
    // Useful for triggering a transition outside of `execute`.
    for (const state of Object.values(this.possibleStates)) {
      state.stateMachine = this;
      state.init(...this.stateArgs);
    }
  }

  step(...stepArgs: unknown[]) {
    if (this.state === null) {
      this.state = this.initialState;
      this.possibleStates[this.state].handleEntered(...this.stateArgs);
    }

    // State function returns the state to transition to.
    // Transitions happen instantly rather than next-frame, so we need
    // to loop through until we don't transition.
    while (true) {
      const newState = this.possibleStates[this.state].execute(...this.stateArgs, ...stepArgs);
      if (newState) {
        this.transition(newState);
      } else {
        break;
      }
    }
  }

  async transition(newState: string, ...enterArgs: unknown[]) {
    if (!(newState in this.possibleStates)) {
      throw Error(`Invalid state ${newState}`);
    }

    if (this.state) {
      await this.possibleStates[this.state].handleExited(...this.stateArgs);
    }
    this.state = newState;
    await this.possibleStates[this.state].handleEntered(...this.stateArgs, ...enterArgs);
  }
}

export class State {
  stateMachine!: StateMachine;

  init(..._args: unknown[]) {}

  handleEntered(..._args: unknown[]): void | Promise<unknown> {}

  handleExited(..._args: unknown[]): void | Promise<unknown> {}

  execute(..._args: unknown[]): string | null | undefined | void {
    return null;
  }

  transition(newState: string, ...args: unknown[]) {
    this.stateMachine.transition(newState, ...args);
  }
}

interface JustDownKey {
  _repeatCounter?: number;
}

export function justDown(key: Phaser.Input.Keyboard.Key & JustDownKey, repeatDelay?: number, repeatRate: number = 100) {
  const justDown = Phaser.Input.Keyboard.JustDown(key);
  if (repeatDelay === undefined) {
    return justDown;
  }

  if (key._repeatCounter === undefined) {
    key._repeatCounter = 0;
  }

  if (!key.isDown) {
    return false;
  }

  const duration = key.getDuration();
  if (justDown || duration < repeatDelay) {
    key._repeatCounter = 0;
    return justDown;
  }

  if (duration > repeatDelay + repeatRate * key._repeatCounter) {
    key._repeatCounter++;
    return true;
  }

  return false;
}

/** Wait for duration milliseconds and resolve the returned Promise. */
export function wait(scene: Phaser.Scene, duration: number) {
  return new Promise((resolve) => {
    scene.time.delayedCall(duration, resolve);
  });
}

/** Play an animation and resolve the returned promise once it completes. */
export function asyncAnimation(sprite: Phaser.GameObjects.Sprite, key: string): Promise<void> {
  return new Promise((resolve) => {
    sprite.once('animationcomplete', resolve);
    sprite.play(key);
  });
}

interface TweenPromise extends Promise<void> {
  tween: Phaser.Tweens.Tween;
}

/** Execute a tween and resolve the returned promise once it completes */
export function asyncTween(scene: Phaser.Scene, config: Phaser.Types.Tweens.TweenBuilderConfig): Promise<void> {
  let tween: Phaser.Tweens.Tween | null = null;
  const promise: TweenPromise = new Promise<void>((resolve) => {
    tween = scene.add.tween({
      ...config,
      onComplete(...args) {
        if (config.onComplete) {
          config.onComplete(...args);
        }
        resolve();
      },
    });
  }) as TweenPromise;
  promise.tween = tween!;
  return promise;
}

/** Queue a bunch of scene.load calls and resolve once they have finished loading. */
export function asyncLoad(scene: Phaser.Scene, loadFunc: (scene: Phaser.Scene) => void) {
  return new Promise((resolve) => {
    loadFunc(scene);
    scene.load.once('complete', resolve);
    scene.load.start();
  });
}

export function uniqueName(existingNames: string[], baseName: string) {
  let name = baseName;
  let k = 1;
  while (existingNames.find((n) => n === name)) {
    name = `${baseName}${k++}`;
  }
  return name;
}
