import { AppShell } from '@mantine/core';
import PhaserSceneContainer from './PhaserSceneContainer';
import Properties from './Properties';
import Outline from './Outline';

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
        <div>Phaser Scene Editor</div>
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
