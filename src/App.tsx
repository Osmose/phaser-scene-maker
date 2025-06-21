import { AppShell, Center, Group } from '@mantine/core';
import PhaserSceneContainer from './PhaserSceneContainer';
import Properties from './Properties';
import Outline from './Outline';
import Toolbar from './Toolbar';

export default function App() {
  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
      }}
      aside={{ width: 300, breakpoint: 'sm' }}
      padding={0}
    >
      <AppShell.Header p="md">
        <Group preventGrowOverflow={false}>
          <div style={{ flex: '0 0 auto' }}>Phaser Scene Editor</div>
          <Center flex="1">
            <Toolbar />
          </Center>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md">
        <Outline />
      </AppShell.Navbar>
      <AppShell.Main>
        <PhaserSceneContainer />
      </AppShell.Main>
      <AppShell.Aside p="md">
        <Properties />
      </AppShell.Aside>
    </AppShell>
  );
}
