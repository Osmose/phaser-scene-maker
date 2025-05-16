import { Alert, NumberInput, Stack, Title } from '@mantine/core';
import { useStore } from './stores';
import { IconInfoCircle } from '@tabler/icons-react';

function SceneProperties() {
  const {
    sceneProperties: { width, height },
    setSceneProperty,
  } = useStore();

  return (
    <>
      <Title order={2}>Scene properties</Title>
      <NumberInput
        label="width (px)"
        hideControls
        value={width}
        onBlur={(e) => setSceneProperty('width', Number.parseInt(e.target.value))}
      />
      <NumberInput
        label="height (px)"
        hideControls
        value={height}
        onBlur={(e) => setSceneProperty('height', Number.parseInt(e.target.value))}
      />
    </>
  );
}

function SceneObjectProperties({ sceneObjectId }: { sceneObjectId: string }) {
  const { sceneObjects, setSceneObjectProperty } = useStore();
  const sceneObject = sceneObjects.find((o) => o.id === sceneObjectId);

  if (!sceneObject) {
    return (
      <Alert variant="light" color="red" title="Error" icon={<IconInfoCircle />}>
        Could not find an object with the id {sceneObjectId}
      </Alert>
    );
  }

  return (
    <>
      <Title order={2}>{sceneObject.name}</Title>
      <NumberInput
        label="width (px)"
        hideControls
        value={sceneObject.width}
        onBlur={(e) => setSceneObjectProperty(sceneObjectId, 'width', Number.parseInt(e.target.value))}
      />
      <NumberInput
        label="height (px)"
        hideControls
        value={sceneObject.height}
        onBlur={(e) => setSceneObjectProperty(sceneObjectId, 'height', Number.parseInt(e.target.value))}
      />
    </>
  );
}

export default function Properties() {
  const { editorFocus } = useStore();

  return (
    <Stack align="stretch" justify="flex-start" gap="md">
      {editorFocus.type === 'scene' && <SceneProperties />}
      {editorFocus.type === 'object' && <SceneObjectProperties sceneObjectId={editorFocus.id} />}
    </Stack>
  );
}
