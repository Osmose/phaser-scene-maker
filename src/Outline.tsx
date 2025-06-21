import { Modal, NavLink, Stack } from '@mantine/core';
import { IconList, IconPhotoScan, IconPlus, IconTheater } from '@tabler/icons-react';
import { useStore } from './stores';
import { useDisclosure } from '@mantine/hooks';
import { SCENE_OBJECT_HANDLERS } from './scene_objects';
import { ASSET_HANDLERS } from './assets';

export default function Outline() {
  const { editorFocus, addSceneObject, sceneObjects, focusScene, focusSceneObject, assets, addAsset } = useStore();
  const [objectChooserOpened, { open: openObjectChooser, close: closeObjectChooser }] = useDisclosure(false);
  const [assetChooserOpened, { open: openAssetChooser, close: closeAssetChooser }] = useDisclosure(false);

  function makeAddSceneObjectCallback(type: keyof typeof SCENE_OBJECT_HANDLERS) {
    return () => {
      addSceneObject(type);
      closeObjectChooser();
    };
  }

  function makeAddAssetCallback(type: keyof typeof ASSET_HANDLERS) {
    return () => {
      addAsset(type);
      closeAssetChooser();
    };
  }

  return (
    <>
      <NavLink
        href="#scene"
        label="Scene"
        leftSection={<IconTheater />}
        active={editorFocus.type === 'scene'}
        onClick={focusScene}
      />
      <NavLink href="#assets" label="Assets" childrenOffset="md" defaultOpened leftSection={<IconList />}>
        {assets.map((asset) => (
          <NavLink
            key={asset.key}
            href={`#${asset.key}`}
            label={asset.key}
            leftSection={ASSET_HANDLERS[asset.type].icon()}
            // onClick={() => focusSceneObject(sceneObject.id)}
            // active={editorFocus.type === 'object' && editorFocus.id === sceneObject.id}
          />
        ))}
        <NavLink label="New asset" leftSection={<IconPlus />} onClick={openAssetChooser} />
      </NavLink>
      <NavLink href="#objects" label="Objects" childrenOffset="md" defaultOpened leftSection={<IconList />}>
        {sceneObjects.map((sceneObject) => (
          <NavLink
            key={sceneObject.id}
            href={`#${sceneObject.id}`}
            label={sceneObject.name}
            leftSection={SCENE_OBJECT_HANDLERS[sceneObject.type].icon()}
            onClick={() => focusSceneObject(sceneObject.id)}
            active={editorFocus.type === 'object' && editorFocus.id === sceneObject.id}
          />
        ))}
        <NavLink label="New object" leftSection={<IconPlus />} onClick={openObjectChooser} />
      </NavLink>

      <Modal opened={assetChooserOpened} onClose={closeAssetChooser} title="Choose asset type">
        <Stack align="stretch" justify="flex-start" gap="md">
          {Object.entries(ASSET_HANDLERS).map(([type, handler]) => (
            <NavLink
              key={type}
              href={`#${type}`}
              label={handler.name}
              leftSection={handler.icon()}
              onClick={makeAddAssetCallback(type as keyof typeof ASSET_HANDLERS)}
            />
          ))}
        </Stack>
      </Modal>

      <Modal opened={objectChooserOpened} onClose={closeObjectChooser} title="Choose object type">
        <Stack align="stretch" justify="flex-start" gap="md">
          {Object.entries(SCENE_OBJECT_HANDLERS).map(([type, handler]) => (
            <NavLink
              key={type}
              href={`#${type}`}
              label={handler.name}
              leftSection={handler.icon()}
              onClick={makeAddSceneObjectCallback(type as keyof typeof SCENE_OBJECT_HANDLERS)}
            />
          ))}
        </Stack>
      </Modal>
    </>
  );
}
