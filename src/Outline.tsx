import { Modal, NavLink, Stack } from '@mantine/core';
import { IconList, IconPhotoScan, IconPlus, IconTheater } from '@tabler/icons-react';
import { useStore } from './stores';
import { useDisclosure } from '@mantine/hooks';
import { SCENE_OBJECT_HANDLERS } from './scene_objects';

export default function Outline() {
  const { editorFocus, addSceneObject, sceneObjects, focusScene, focusSceneObject } = useStore();
  const [objectChooserOpened, { open: openObjectChooser, close: closeObjectChooser }] = useDisclosure(false);
  const [assetChooserOpened, { open: openAssetChooser, close: closeAssetChooser }] = useDisclosure(false);

  function makeAddSceneObjectCallback(type: keyof typeof SCENE_OBJECT_HANDLERS) {
    return () => {
      addSceneObject(type);
      closeObjectChooser();
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
          <NavLink href="#image" label="Image" leftSection={<IconPhotoScan />} />
        </Stack>
      </Modal>

      <Modal opened={objectChooserOpened} onClose={closeObjectChooser} title="Choose object type">
        <Stack align="stretch" justify="flex-start" gap="md">
          <NavLink href="#image" label="Image" leftSection={<IconPhotoScan />} />
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
