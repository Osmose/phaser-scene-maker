import { Modal, NavLink, Stack } from '@mantine/core';
import { IconBox, IconList, IconPhotoScan, IconPlus, IconRectangle, IconTheater } from '@tabler/icons-react';
import { useStore, type SceneObject } from './stores';
import { useDisclosure } from '@mantine/hooks';

function SceneObjectIcon({ sceneObject }: { sceneObject: SceneObject }) {
  switch (sceneObject.type) {
    case 'rectangle':
      return <IconRectangle />;
    default:
      return <IconBox />;
  }
}

export default function Outline() {
  const { editorFocus, addSceneObject, sceneObjects, focusScene, focusSceneObject } = useStore();
  const [objectChooserOpened, { open: openObjectChooser, close: closeObjectChooser }] = useDisclosure(false);
  const [assetChooserOpened, { open: openAssetChooser, close: closeAssetChooser }] = useDisclosure(false);

  function makeAddSceneObjectCallback(type: Parameters<typeof addSceneObject>[0]) {
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
            leftSection={<SceneObjectIcon sceneObject={sceneObject} />}
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
          <NavLink
            href="#rectangle"
            label="Rectangle"
            leftSection={<IconRectangle />}
            onClick={makeAddSceneObjectCallback('rectangle')}
          />
        </Stack>
      </Modal>
    </>
  );
}
