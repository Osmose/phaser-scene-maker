import { create } from 'zustand';
import EditorScene from './EditorScene';
import Phaser from 'phaser';
import type { SceneObject } from './scene_objects';
import { SCENE_OBJECT_HANDLERS } from './scene_objects';

interface SceneProperties {
  width: number;
  height: number;
}

type EditorFocus = { type: 'scene' } | { type: 'object'; id: string };

export type Tool = 'hand' | 'select';

export interface StoreState {
  game: Phaser.Game | null;
  editorFocus: EditorFocus;
  sceneProperties: SceneProperties;
  sceneObjects: SceneObject[];
  activeTool: Tool;

  initPhaser(container: HTMLElement): void;
  focusScene(): void;
  focusSceneObject(id: string): void;
  setSceneProperty<T extends keyof SceneProperties>(key: T, value: SceneProperties[T]): void;
  addSceneObject(type: SceneObject['type']): void;
  setSceneObjectProperty<T extends keyof SceneObject>(id: string, key: T, value: SceneObject[T]): void;
  setActiveTool(tool: Tool): void;
}

function getEditorScene(game: Phaser.Game) {
  return game.scene.getScene<EditorScene>('editor');
}

export const useStore = create<StoreState>()((set, get) => ({
  game: null,
  editorFocus: { type: 'scene' },
  sceneProperties: {
    width: 400,
    height: 400,
  },
  sceneObjects: [],
  activeTool: 'hand',

  initPhaser(container) {
    const state = get();
    if (state.game !== null) {
      return;
    }

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      backgroundColor: '#666',
      scene: [new EditorScene()],
      scale: {
        mode: Phaser.Scale.ScaleModes.RESIZE,
      },
      parent: container,
    });

    set({ game });
    game.events.on('ready', () => {
      syncGame(get());
      useStore.subscribe((state) => {
        syncGame(state);
      });

      const editorScene = getEditorScene(game);
      editorScene.centerDesk();
      editorScene.setActiveTool(state.activeTool);
    });
    game.events.on('selectGameObject', (gameObject: Phaser.GameObjects.GameObject) => {
      get().focusSceneObject(gameObject.getData('id'));
    });
    game.events.on('moveGameObject', (gameObject: Phaser.GameObjects.GameObject, x: number, y: number) => {
      const { setSceneObjectProperty } = get();
      const id = gameObject.getData('id');
      setSceneObjectProperty(id, 'x', x);
      setSceneObjectProperty(id, 'y', y);
    });
  },

  setSceneProperty(key: keyof SceneProperties, value) {
    set((state) => ({ sceneProperties: { ...state.sceneProperties, [key]: value } }));
  },

  focusScene() {
    set({ editorFocus: { type: 'scene' } });
  },

  focusSceneObject(id: string) {
    set({ editorFocus: { type: 'object', id } });
  },

  addSceneObject(type: keyof typeof SCENE_OBJECT_HANDLERS) {
    const handler = SCENE_OBJECT_HANDLERS[type];
    const newSceneObject = handler.createSceneObject(get());

    set((state) => ({
      sceneObjects: [...state.sceneObjects, newSceneObject],
      editorFocus: { type: 'object', id: newSceneObject.id },
    }));
  },

  setSceneObjectProperty(id, key, value) {
    set((state) => {
      const sceneObjectIndex = state.sceneObjects.findIndex((o) => o.id === id);
      const sceneObject = state.sceneObjects[sceneObjectIndex];
      return { sceneObjects: state.sceneObjects.toSpliced(sceneObjectIndex, 1, { ...sceneObject, [key]: value }) };
    });
  },

  setActiveTool(tool: Tool) {
    set(({ game }) => {
      if (!game) {
        return {};
      }

      const editorScene = getEditorScene(game);
      editorScene.setActiveTool(tool);
      return { activeTool: tool };
    });
  },
}));

function syncGame(state: StoreState) {
  if (state.game === null) {
    return;
  }

  const editorScene = getEditorScene(state.game);
  editorScene.syncState(state);
}
