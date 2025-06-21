import { ActionIcon, Group } from '@mantine/core';
import { IconHandStop, IconPointer } from '@tabler/icons-react';
import { useStore, type Tool } from './stores';

function ToolbarButton({ tool, icon }: { tool: Tool; icon: React.ReactElement }) {
  const { activeTool, setActiveTool } = useStore();
  return (
    <ActionIcon variant={activeTool === tool ? 'filled' : 'default'} onClick={() => setActiveTool(tool)}>
      {icon}
    </ActionIcon>
  );
}

export default function Toolbar() {
  return (
    <Group gap="sm">
      <ToolbarButton tool="hand" icon={<IconHandStop />} />
      <ToolbarButton tool="select" icon={<IconPointer />} />
    </Group>
  );
}
