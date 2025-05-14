import React from 'react';
import { useStore } from './stores';

export default function PhaserSceneContainer() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { initPhaser } = useStore();

  React.useEffect(() => {
    if (containerRef.current !== null) {
      initPhaser(containerRef.current);
    }
  }, [containerRef, initPhaser]);

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div ref={containerRef} />
    </div>
  );
}
