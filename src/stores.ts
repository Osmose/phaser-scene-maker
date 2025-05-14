import { create } from 'zustand';
import EditorScene from './EditorScene';
import Phaser from 'phaser';

interface StoreState {
  game: Phaser.Game | null;
  sceneProperties: SceneProperties;

  initPhaser(container: HTMLElement): void;
  setSceneProperty<T extends keyof SceneProperties>(key: T, value: SceneProperties[T]): void;
}

interface SceneProperties {
  width: number;
  height: number;
}

export const useStore = create<StoreState>()((set, get) => ({
  game: null,
  sceneProperties: {
    width: 400,
    height: 400,
  },

  initPhaser(container) {
    if (get().game !== null) {
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

      const editorScene = game.scene.getScene<EditorScene>('editor');
      editorScene.centerDesk();
    });
  },

  setSceneProperty(key: keyof SceneProperties, value) {
    set((state) => ({ sceneProperties: { ...state.sceneProperties, [key]: value } }));
  },
}));

function syncGame({ game, sceneProperties }: StoreState) {
  if (game === null) {
    return;
  }

  const editorScene = game.scene.getScene<EditorScene>('editor');

  // Scene properties
  editorScene.setSize(sceneProperties.width, sceneProperties.height);
}
