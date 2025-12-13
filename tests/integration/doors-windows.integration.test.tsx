import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Canvas2D } from '../../src/components/editor/Canvas2D';
import { useFloorplanStore } from '../../src/stores/floorplanStore';
import { useUIStore } from '../../src/stores/uiStore';
import { useToolStore } from '../../src/stores/toolStore';
import { mockFloorplan } from '../utils/mockData';
import { PIXELS_PER_METER } from '../../src/constants/defaults';
import { calculateAllConnections } from '../../src/services/adjacency/graph';

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
    useFloorplanStore.getState().loadFloorplan(mockFloorplan());

    useUIStore.setState({
      zoomLevel: 1,
      panOffset: { x: 0, z: 0 },
      mode: 'canvas'
    });

    useToolStore.setState({ activeTool: 'select' });

    // Mock dimensions for screenToWorld in CanvasViewport
    jest.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
        x: 0, y: 0, width: 800, height: 600, top: 0, left: 0, bottom: 600, right: 800, toJSON: () => {}
    } as DOMRect);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('Door placement flow: Add door to store -> verify appears in canvas', async () => {
    const room = useFloorplanStore.getState().addRoom({
      name: 'Test Room',
      length: 5,
      width: 4,
      type: 'living',
      height: 2.4,
      position: { x: 0, z: 0 },
      rotation: 0
    });

    render(<Canvas2D />);

    // Verify room
    expect(await screen.findByTestId(`room-shape-${room.id}`)).toBeInTheDocument();

    // Add door via store
    let door;
    act(() => {
      door = useFloorplanStore.getState().addDoor({
          roomId: room.id,
          wallSide: 'north',
          position: 0.5,
          width: 0.9,
          height: 2.1,
          type: 'single',
          swing: 'inward',
          handleSide: 'left',
          isExterior: false
      });
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
      position: { x: 0, z: 0 },
      rotation: 0
    });

    render(<Canvas2D />);

    // Add window via store
    let window;
    act(() => {
      window = useFloorplanStore.getState().addWindow({
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
    });

    // Verify window shape appears
    const windowElement = await screen.findByTestId(`window-shape-${window.id}`);
    expect(windowElement).toBeInTheDocument();
  });

  it('Drag door: Drag door along wall -> verify position updates', async () => {
     const room = useFloorplanStore.getState().addRoom({
      name: 'Test Room',
      length: 4, // 4m length (Z axis)
      width: 4, // 4m width (X axis)
      type: 'living',
      height: 2.4,
      position: { x: 0, z: 0 },
      rotation: 0
    });

    // North wall is along X axis (width). Length = 4m.
    let door;
    act(() => {
      door = useFloorplanStore.getState().addDoor({
          roomId: room.id,
          wallSide: 'north',
          position: 0.5, // 2m from left
          width: 1.0,
          height: 2.1,
          type: 'single',
          swing: 'inward',
          handleSide: 'left',
          isExterior: false
      });
    });

    render(<Canvas2D />);
    const doorElement = await screen.findByTestId(`door-shape-${door.id}`);

    // Drag door
    // We assume CanvasViewport centers content.
    // However, in our mock environment, we need to be precise about screenToWorld.
    // If pan=0, zoom=1, dimensions=800x600.
    // CenterX=400, CenterY=300.
    // Transform translate is (400, 300).
    // World 0,0 maps to Screen 400,300.
    // North wall is at Z=0. X goes from 0 to 4.
    // Door at 0.5 is at X=2.
    // World (2,0) -> Screen (400 + 2*50, 300 + 0) = (500, 300).

    // Start drag at door position
    fireEvent.mouseDown(doorElement, { button: 0, clientX: 500, clientY: 300 });

    // Move 1m right (+50px) to X=550.
    // World X should become 3.
    // 3/4 = 0.75.
    fireEvent.mouseMove(document, { clientX: 550, clientY: 300 });

    fireEvent.mouseUp(document);

    const updatedDoor = useFloorplanStore.getState().getDoorById(door.id);
    expect(updatedDoor?.position).toBeCloseTo(0.75, 2);
  });

  it('Connection linking: Place door on shared wall -> verify links to connection', async () => {
     const room1 = useFloorplanStore.getState().addRoom({
      name: 'Room 1',
      length: 4, width: 4, height: 2.4,
      type: 'living',
      position: { x: 0, z: 0 },
      rotation: 0
    });

    // Room 2 to the right, sharing East wall of Room 1 / West wall of Room 2
    // Room 1: X[0-4], Z[0-4]
    // Room 2: X[4-8], Z[0-4]
    const room2 = useFloorplanStore.getState().addRoom({
      name: 'Room 2',
      length: 4, width: 4, height: 2.4,
      type: 'kitchen',
      position: { x: 4, z: 0 },
      rotation: 0
    });

    // Force connection calculation
    act(() => {
        useFloorplanStore.getState().recalculateConnections();
    });

    const connections = useFloorplanStore.getState().currentFloorplan?.connections;
    expect(connections).toHaveLength(1);
    const connection = connections![0];

    render(<Canvas2D />);

    // Create door on non-shared wall (North of Room 1).
    let door;
    act(() => {
        door = useFloorplanStore.getState().addDoor({
            roomId: room1.id,
            wallSide: 'north',
            position: 0.5,
            width: 0.9, height: 2.1,
            type: 'single', swing: 'inward', handleSide: 'left',
            isExterior: true
        });
    });

    const doorElement = await screen.findByTestId(`door-shape-${door.id}`);

    // Drag to East wall (Shared)
    // Room 1 East wall is at X=4, Z=[0-4]. Center (4, 2).
    // Screen coords:
    // World (4, 2) -> Screen (400 + 4*50, 300 + 2*50) = (600, 400).

    // Start at North wall center (2,0) -> (500, 300)
    fireEvent.mouseDown(doorElement, { button: 0, clientX: 500, clientY: 300 });

    // Move to East wall center (4, 2) -> (600, 400)
    fireEvent.mouseMove(document, { clientX: 600, clientY: 400 });

    fireEvent.mouseUp(document);

    const updatedDoor = useFloorplanStore.getState().getDoorById(door.id);
    expect(updatedDoor?.wallSide).toBe('east');
    expect(updatedDoor?.connectionId).toBe(connection.id);
    expect(updatedDoor?.isExterior).toBe(false);
  });

  it('Delete cascade: Delete room -> verify its doors removed', async () => {
    const room = useFloorplanStore.getState().addRoom({
      name: 'Test Room',
      length: 5,
      width: 4,
      type: 'living',
      height: 2.4,
      position: { x: 0, z: 0 },
      rotation: 0
    });

    let door;
    act(() => {
        door = useFloorplanStore.getState().addDoor({
            roomId: room.id,
            wallSide: 'north',
            position: 0.5,
            width: 1.0,
            height: 2.1,
            type: 'single',
            swing: 'inward',
            handleSide: 'left',
            isExterior: false
        });
    });

    render(<Canvas2D />);

    expect(useFloorplanStore.getState().getDoorById(door.id)).toBeDefined();

    act(() => {
        useFloorplanStore.getState().deleteRoom(room.id);
    });

    expect(useFloorplanStore.getState().getDoorById(door.id)).toBeUndefined();
  });
});
