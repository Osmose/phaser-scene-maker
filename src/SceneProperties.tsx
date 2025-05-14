import { NumberInput, Stack, Title } from '@mantine/core';
import { useStore } from './stores';

export default function SceneProperties() {
  const {
    sceneProperties: { width, height },
    setSceneProperty,
  } = useStore();

  return (
    <Stack align="stretch" justify="flex-start" gap="md">
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
    </Stack>
  );
}
