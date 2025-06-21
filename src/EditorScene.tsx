import Phaser from 'phaser';
import { State, StateMachine } from './util';
import { type StoreState, type Tool, useStore } from './stores';
import { SCENE_OBJECT_HANDLERS } from './scene_objects';

type SelectableGameObject = Phaser.GameObjects.GameObject &
  Phaser.GameObjects.Components.Depth &
  Phaser.GameObjects.Components.Transform &
  Phaser.GameObjects.Components.Size;

function isSelectableGameObject(gameObject: Phaser.GameObjects.GameObject): gameObject is SelectableGameObject {
  const selectableGameObject = gameObject as SelectableGameObject;
  return (
    selectableGameObject.width !== undefined &&
    selectableGameObject.x !== undefined &&
    selectableGameObject.depth !== undefined
  );
}

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

    this.stateMachine = new StateMachine('select', {
      select: new SelectState(this),
      selectDragging: new SelectDragging(this),
      hand: new HandState(this),
      handDragging: new HandDragging(this),
    });
  }

  centerDesk() {
    this.cameras.main.centerOn(this.desk.x + this.desk.displayWidth / 2, this.desk.y + this.desk.displayHeight / 2);
  }

  setActiveTool(tool: Tool) {
    switch (tool) {
      case 'hand':
        return this.stateMachine.transition('hand');
      case 'select':
        return this.stateMachine.transition('select');
    }
  }

  syncState({ sceneProperties, sceneObjects, editorFocus }: StoreState) {
    // Scene properties
    this.desk.setDisplaySize(sceneProperties.width, sceneProperties.height);

    // Add new game objects and update existing game objects
    for (const sceneObject of sceneObjects) {
      const handler = SCENE_OBJECT_HANDLERS[sceneObject.type];
      const gameObject = this.getGameObjectForSceneObjectId(sceneObject.id);
      if (!gameObject) {
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

class SelectState extends EditorState {
  handleEntered() {
    this.scene.input.setDefaultCursor('default');
  }

  execute() {
    const pointer = this.scene.input.activePointer;
    if (pointer.isDown) {
      const gameObjects = this.scene.sceneGameObjects
        .getChildren()
        .filter(isSelectableGameObject)
        .toReversed() // Reverse stability of sort
        .toSorted((a, b) => b.depth - a.depth);

      for (const gameObject of gameObjects) {
        const hitArea = new Phaser.Geom.Rectangle(
          Phaser.Display.Bounds.GetLeft(gameObject),
          Phaser.Display.Bounds.GetTop(gameObject),
          (gameObject as unknown as Phaser.Types.Math.RectangleLike).width,
          (gameObject as unknown as Phaser.Types.Math.RectangleLike).height
        );
        if (hitArea.contains(pointer.worldX, pointer.worldY)) {
          this.scene.game.events.emit('selectGameObject', gameObject);
          return this.transition('selectDragging', gameObject);
        }
      }

      // We clicked but not on any object; check to see if we need to deselect
      const storeState = useStore.getState();
      if (storeState.editorFocus.type !== 'scene') {
        storeState.focusScene();
      }
    }
  }
}

class SelectDragging extends EditorState {
  gameObject!: SelectableGameObject;
  dragModX!: number;
  dragModY!: number;
  lastMoveTime!: number;

  handleEntered(gameObject: SelectableGameObject) {
    const pointer = this.scene.input.activePointer;

    this.gameObject = gameObject;
    this.dragModX = pointer.worldX - gameObject.x;
    this.dragModY = pointer.worldY - gameObject.y;
    this.lastMoveTime = pointer.moveTime;
  }

  execute() {
    const pointer = this.scene.input.activePointer;

    if (!pointer.isDown) {
      return this.transition('select');
    }

    if (pointer.moveTime !== this.lastMoveTime) {
      this.scene.game.events.emit(
        'moveGameObject',
        this.gameObject,
        Math.floor(pointer.worldX - this.dragModX),
        Math.floor(pointer.worldY - this.dragModY)
      );
      this.lastMoveTime = pointer.moveTime;
    }
  }
}

class HandState extends EditorState {
  handleEntered() {
    this.scene.input.setDefaultCursor('grab');
  }

  execute() {
    const pointer = this.scene.input.activePointer;
    const camera = this.scene.cameras.main;
    if (pointer.isDown) {
      return this.transition('handDragging', { x: camera.scrollX, y: camera.scrollY }, { x: pointer.x, y: pointer.y });
    }
  }
}

class HandDragging extends EditorState {
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
      return this.transition('hand');
    }

    camera.setScroll(
      this.cameraOrigin.x + (this.dragOrigin.x - pointer.x),
      this.cameraOrigin.y + (this.dragOrigin.y - pointer.y)
    );
  }
}
