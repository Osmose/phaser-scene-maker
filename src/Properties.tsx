import { Alert, ColorInput, NumberInput, Stack, Title } from '@mantine/core';
import { useStore } from './stores';
import { IconInfoCircle } from '@tabler/icons-react';
import { SCENE_OBJECT_HANDLERS } from './scene_objects';

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

  const handler = SCENE_OBJECT_HANDLERS[sceneObject.type];

  return (
    <>
      <Title order={2}>{sceneObject.name}</Title>
      {handler.fields.map((field) => {
        switch (field.type) {
          case 'number':
            return (
              <NumberInput
                key={field.name}
                label={field.name}
                hideControls
                value={sceneObject[field.name]}
                onBlur={(e) => setSceneObjectProperty(sceneObjectId, field.name, Number.parseFloat(e.target.value))}
              />
            );
          case 'color':
            return (
              <ColorInput
                key={field.name}
                label={field.name}
                value={`#${sceneObject[field.name].toString(16)}`}
                onChangeEnd={(value) =>
                  setSceneObjectProperty(sceneObjectId, field.name, Number.parseInt(value.substring(1), 16))
                }
              />
            );
        }
      })}
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
