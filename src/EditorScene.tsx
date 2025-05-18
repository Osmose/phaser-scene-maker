import Phaser from 'phaser';
import { State, StateMachine } from './util';
import type { StoreState } from './stores';
import { SCENE_OBJECT_HANDLERS } from './scene_objects';

export default class EditorScene extends Phaser.Scene {
  desk!: Phaser.GameObjects.Rectangle;
  stateMachine!: StateMachine;
  focusBorder!: Phaser.GameObjects.Rectangle;
  sceneGameObjects!: Phaser.GameObjects.Group;

  constructor(config?: Phaser.Types.Scenes.SettingsConfig) {
    super({ ...config, key: 'editor' });
  }

  create() {
    this.desk = this.add.rectangle(0, 0, 300, 300, 0xcccccc).setOrigin(0, 0);
    this.focusBorder = this.add.rectangle(0, 0, 0, 0, 0, 0).setStrokeStyle(2, 0xff00ff).setVisible(false).setDepth(100);

    this.sceneGameObjects = this.add.group();

    this.stateMachine = new StateMachine('idle', {
      idle: new IdleState(this),
      dragging: new DraggingState(this),
    });
  }

  centerDesk() {
    this.cameras.main.centerOn(this.desk.x + this.desk.displayWidth / 2, this.desk.y + this.desk.displayHeight / 2);
  }

  syncState({ sceneProperties, sceneObjects, editorFocus }: StoreState) {
    // Scene properties
    this.desk.setDisplaySize(sceneProperties.width, sceneProperties.height);

    // Add new game objects and update existing game objects
    for (const sceneObject of sceneObjects) {
      const handler = SCENE_OBJECT_HANDLERS[sceneObject.type];
      const gameObject = this.getGameObjectForSceneObjectId(sceneObject.id);
      if (!gameObject) {
        console.log('create');
        const gameObject = handler.addGameObject(sceneObject, this);
        gameObject.setData('id', sceneObject.id);
        this.sceneGameObjects.add(gameObject);
      } else {
        handler.syncGameObject(sceneObject, gameObject);
      }
    }

    // Destroy game objects with no matching scene objects
    for (const gameObject of this.sceneGameObjects.getChildren()) {
      const id = gameObject.getData('id');
      const sceneObject = sceneObjects.find((sceneObject) => sceneObject.id === id);
      if (!sceneObject) {
        gameObject.destroy();
      }
    }

    // Sync focus border
    if (editorFocus.type === 'scene') {
      this.focusBorder.setVisible(false);
    } else {
      const gameObject = this.getGameObjectForSceneObjectId(editorFocus.id);
      if (!gameObject) {
        this.focusBorder.setVisible(false);
      } else {
        this.focusBorder
          .setPosition(gameObject.x, gameObject.y)
          .setSize(gameObject.width, gameObject.height)
          .setVisible(true);
      }
    }
  }

  getGameObjectForSceneObjectId(id: string): Phaser.GameObjects.Rectangle | undefined {
    return this.sceneGameObjects.getChildren().find((go) => go.getData('id') === id) as
      | Phaser.GameObjects.Rectangle
      | undefined;
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
