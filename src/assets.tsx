import { IconPhotoScan } from '@tabler/icons-react';
import type { StoreState } from './stores';
import { uniqueName } from './util';

interface BaseAsset {
  key: string;
  type: string;
}

interface AssetHandler<AssetType extends BaseAsset> {
  name: string;
  icon: () => React.ReactNode;
  createAsset(state: StoreState): AssetType;
}

export interface ImageAsset extends BaseAsset {
  type: 'image';
  path: string | null;
}

export const ASSET_HANDLERS: {
  image: AssetHandler<ImageAsset>;
} = {
  image: {
    name: 'Image',
    icon() {
      return <IconPhotoScan />;
    },
    createAsset(state) {
      return {
        key: uniqueName(
          state.assets.map((a) => a.key),
          'new-image'
        ),
        type: 'image',
        path: null,
      };
    },
  },
};

export type Asset = ImageAsset;
