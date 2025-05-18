import { v4 as uuidv4 } from 'uuid';
import type Phaser from 'phaser';
import type { StoreState } from './stores';
import { IconRectangle } from '@tabler/icons-react';

interface BaseSceneObject {
  id: string;
  name: string;
  type: string;
}

interface SceneObjectField<T extends BaseSceneObject> {
  name: keyof T;
  type: 'number' | 'color';
}

interface SceneObjectHandler<
  SceneObjectType extends BaseSceneObject,
  GameObjectType extends Phaser.GameObjects.GameObject
> {
  name: string;
  icon: () => React.ReactNode;
  fields: SceneObjectField<SceneObjectType>[];
  createSceneObject(state: StoreState): SceneObjectType;
  addGameObject(sceneObject: SceneObjectType, scene: Phaser.Scene): GameObjectType;
  syncGameObject(sceneObject: SceneObjectType, gameObject: GameObjectType): void;
}

function uniqueName(sceneObjects: SceneObject[], baseName: string) {
  let name = baseName;
  let k = 1;
  while (sceneObjects.find((o) => o.name === name)) {
    name = `${baseName}${k++}`;
  }
  return name;
}
export interface RectangleSceneObject extends BaseSceneObject {
  type: 'rectangle';
  x: number;
  y: number;
  width: number;
  height: number;
  fillColor: number;
  fillAlpha: number;
}

export const SCENE_OBJECT_HANDLERS: {
  rectangle: SceneObjectHandler<RectangleSceneObject, Phaser.GameObjects.Rectangle>;
} = {
  rectangle: {
    name: 'Rectangle',
    icon() {
      return <IconRectangle />;
    },
    fields: [
      { name: 'x', type: 'number' },
      { name: 'y', type: 'number' },
      { name: 'width', type: 'number' },
      { name: 'height', type: 'number' },
      { name: 'fillColor', type: 'color' },
      { name: 'fillAlpha', type: 'number' },
    ],
    createSceneObject(state: StoreState) {
      return {
        id: uuidv4(),
        name: uniqueName(state.sceneObjects, 'Rectangle'),
        type: 'rectangle',
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        fillColor: 0xffffff,
        fillAlpha: 1,
      };
    },
    addGameObject({ x, y, width, height, fillColor, fillAlpha }, scene) {
      return scene.add.rectangle(x, y, width, height, fillColor, fillAlpha);
    },
    syncGameObject({ x, y, width, height, fillColor, fillAlpha }, rectangle) {
      rectangle.setPosition(x, y);
      rectangle.setSize(width, height);
      rectangle.setFillStyle(fillColor, fillAlpha);
    },
  },
};

export type SceneObject = RectangleSceneObject;
