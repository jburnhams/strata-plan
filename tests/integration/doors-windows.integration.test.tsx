import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Canvas2D } from '../../src/components/editor/Canvas2D';
import { useFloorplanStore } from '../../src/stores/floorplanStore';
import { useUIStore } from '../../src/stores/uiStore';
import { useToolStore } from '../../src/stores/toolStore';
import { mockFloorplan } from '../utils/mockData';

// Mock ResizeObserver
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = ResizeObserver;

// Mock canvas elements
jest.mock('../../src/components/editor/Grid', () => ({
  Grid: () => <g data-testid="grid-layer" />
}));

jest.mock('../../src/components/editor/Ruler', () => ({
  Ruler: () => <div data-testid="ruler" />
}));

describe('Doors and Windows Integration', () => {
  beforeEach(() => {
    // Reset stores
    useFloorplanStore.getState().clearFloorplan();
    // mockFloorplan is the function, not createMockFloorplan
    useFloorplanStore.getState().loadFloorplan(mockFloorplan()); // loadFloorplan instead of setFloorplan

    useUIStore.setState({
      zoomLevel: 1,
      panOffset: { x: 0, z: 0 },
      mode: 'canvas'
    });

    useToolStore.setState({ activeTool: 'select' });
  });

  it('Door placement flow: Add door to store -> verify appears in canvas', async () => {
    const room = useFloorplanStore.getState().addRoom({
      name: 'Test Room',
      length: 5,
      width: 4,
      type: 'living',
      height: 2.4,
      position: { x: 0, z: 0 }
    });

    render(<Canvas2D />);

    // Verify room
    expect(await screen.findByTestId(`room-shape-${room.id}`)).toBeInTheDocument();

    // Add door via store
    const door = useFloorplanStore.getState().addDoor({
        roomId: room.id,
        wallSide: 'north',
        position: 0.5,
        width: 0.9,
        height: 2.1
    });

    // Verify door shape appears
    const doorElement = await screen.findByTestId(`door-shape-${door.id}`);
    expect(doorElement).toBeInTheDocument();
  });

  it('Window placement flow: Add window to store -> verify appears in canvas', async () => {
    const room = useFloorplanStore.getState().addRoom({
      name: 'Test Room',
      length: 5,
      width: 4,
      type: 'living',
      height: 2.4,
      position: { x: 0, z: 0 }
    });

    render(<Canvas2D />);

    // Add window via store
    const window = useFloorplanStore.getState().addWindow({
        roomId: room.id,
        wallSide: 'south',
        position: 0.5,
        width: 1.2,
        height: 1.2,
        sillHeight: 0.9,
        frameType: 'double',
        material: 'pvc',
        openingType: 'casement'
    });

    // Verify window shape appears
    const windowElement = await screen.findByTestId(`window-shape-${window.id}`);
    expect(windowElement).toBeInTheDocument();
  });
});
