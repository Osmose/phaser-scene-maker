import Phaser from 'phaser';
import { State, StateMachine } from './util';
import type { SceneObject } from './stores';

export default class EditorScene extends Phaser.Scene {
  desk!: Phaser.GameObjects.Rectangle;
  stateMachine!: StateMachine;

  constructor(config?: Phaser.Types.Scenes.SettingsConfig) {
    super({ ...config, key: 'editor' });
  }

  create() {
    this.desk = this.add.rectangle(0, 0, 300, 300, 0xcccccc).setOrigin(0, 0);

    this.stateMachine = new StateMachine('idle', {
      idle: new IdleState(this),
      dragging: new DraggingState(this),
    });
  }

  centerDesk() {
    this.cameras.main.centerOn(this.desk.x + this.desk.displayWidth / 2, this.desk.y + this.desk.displayHeight / 2);
  }

  setSize(width: number, height: number) {
    this.desk.setDisplaySize(width, height);
  }

  addSceneObject(sceneObject: SceneObject) {
    let gameObject: Phaser.GameObjects.GameObject;
    switch (sceneObject.type) {
      case 'rectangle': {
        const { x, y, width, height, fillColor, fillAlpha } = sceneObject;
        const rectangle = this.add.rectangle(x, y, width, height, fillColor, fillAlpha);
        gameObject = rectangle;
        break;
      }
    }

    gameObject.setData('id', sceneObject.id);
  }

  syncSceneObject(sceneObject: SceneObject) {
    const gameObject = this.children.list.find((go) => go.getData('id') === sceneObject.id);
    if (!gameObject) {
      throw new Error(`Could not find game object for scene object with id ${sceneObject.id}`);
    }

    const keys = ['x', 'y', 'width', 'height', 'fillColor', 'fillAlpha'] as const;
    for (const key of keys) {
      (gameObject as Phaser.GameObjects.Rectangle)[key] = sceneObject[key];
    }
  }

  update() {
    this.stateMachine.step();
  }
}

class EditorState extends State {
  scene: EditorScene;

  constructor(scene: EditorScene) {
    super();
    this.scene = scene;
  }
}

class IdleState extends EditorState {
  handleEntered() {
    this.scene.input.setDefaultCursor('grab');
  }

  execute() {
    const pointer = this.scene.input.activePointer;
    const camera = this.scene.cameras.main;
    if (pointer.isDown) {
      return this.transition('dragging', { x: camera.scrollX, y: camera.scrollY }, { x: pointer.x, y: pointer.y });
    }
  }
}

class DraggingState extends EditorState {
  dragOrigin!: Phaser.Types.Math.Vector2Like;
  cameraOrigin!: Phaser.Types.Math.Vector2Like;

  handleEntered(cameraOrigin: Phaser.Types.Math.Vector2Like, dragOrigin: Phaser.Types.Math.Vector2Like) {
    this.cameraOrigin = cameraOrigin;
    this.dragOrigin = dragOrigin;
    this.scene.input.setDefaultCursor('grabbing');
  }

  execute() {
    const camera = this.scene.cameras.main;
    const pointer = this.scene.input.activePointer;

    if (!pointer.isDown) {
      return this.transition('idle');
    }

    camera.setScroll(
      this.cameraOrigin.x + (this.dragOrigin.x - pointer.x),
      this.cameraOrigin.y + (this.dragOrigin.y - pointer.y)
    );
  }
}
