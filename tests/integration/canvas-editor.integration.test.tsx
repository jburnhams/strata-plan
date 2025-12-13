import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Canvas2D } from '../../src/components/editor/Canvas2D';
import { useFloorplanStore } from '../../src/stores/floorplanStore';
import { useUIStore } from '../../src/stores/uiStore';
import { Room } from '../../src/types';

// We need to mock ResizeObserver for CanvasViewport
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = ResizeObserver;

describe('Canvas Editor Integration', () => {
  // Setup store and mocks
  beforeEach(() => {
    useFloorplanStore.getState().clearFloorplan();
    useFloorplanStore.getState().createFloorplan('Test Plan', 'meters');

    // Reset UI store
    useUIStore.setState({
        zoomLevel: 1,
        panOffset: { x: 0, z: 0 },
        showGrid: true,
        snapToGrid: true
    });
  });

  it('Room positioning: Add room via store -> verify appears in canvas', async () => {
    render(<Canvas2D />);

    // Add a room directly to store
    const room = useFloorplanStore.getState().addRoom({
        name: 'Test Room',
        length: 5,
        width: 4,
        type: 'living',
        height: 2.4,
        position: { x: 0, z: 0 }
    });

    // Verify it appears in the document
    // RoomShape renders a rect with test id
    const roomElement = await screen.findByTestId(`room-shape-${room.id}`);
    expect(roomElement).toBeInTheDocument();

    // Verify text
    expect(screen.getByText('Test Room')).toBeInTheDocument();
  });

  it('Drag and drop: Select room -> drag -> verify position updated', async () => {
    const room = useFloorplanStore.getState().addRoom({
        name: 'Drag Room',
        length: 5,
        width: 4,
        type: 'bedroom',
        height: 2.4,
        position: { x: 0, z: 0 }
    });

    render(<Canvas2D />);

    const roomElement = await screen.findByTestId(`room-shape-${room.id}`);

    // Get initial position
    expect(useFloorplanStore.getState().getRoomById(room.id)?.position.x).toBe(0);

    // Perform Drag
    // 1. Mouse Down on room (clientX=100)
    fireEvent.mouseDown(roomElement, { clientX: 100, clientY: 100, button: 0 });

    // 2. Mouse Move on Document (global listener)
    // Move 50 pixels (at zoom 1.0, 50px/m, this is 1 meter) -> clientX=150
    fireEvent.mouseMove(document, { clientX: 150, clientY: 100 });

    // 3. Mouse Up
    fireEvent.mouseUp(document);

    // Verify new position
    // Should be +1m in X
    const updatedRoom = useFloorplanStore.getState().getRoomById(room.id);
    expect(updatedRoom?.position.x).toBeCloseTo(1.0);
    expect(updatedRoom?.position.z).toBeCloseTo(0);
  });

  it('Collision Detection: overlapping drag shows warning', async () => {
     // Create two rooms
     const room1 = useFloorplanStore.getState().addRoom({
        name: 'Room 1',
        length: 4,
        width: 4,
        type: 'living',
        height: 2.4,
        position: { x: 0, z: 0 }
    });

    const room2 = useFloorplanStore.getState().addRoom({
        name: 'Room 2',
        length: 4,
        width: 4,
        type: 'kitchen',
        height: 2.4,
        position: { x: 10, z: 0 }
    });

    render(<Canvas2D />);

    const room2Element = await screen.findByTestId(`room-shape-${room2.id}`);

    // Drag Room 2 onto Room 1
    // Room 1 is at 0,0 to 4,4
    // Room 2 is at 10,0. We need to move it left by ~8 meters.
    // 8 meters * 50 px/m = 400 pixels.
    // Start at 500, move to 100.

    fireEvent.mouseDown(room2Element, { clientX: 500, clientY: 100, button: 0 });
    fireEvent.mouseMove(document, { clientX: 100, clientY: 100 });

    // Verify room moved close to 0 (overlapping)
    expect(useFloorplanStore.getState().getRoomById(room2.id)?.position.x).toBeLessThan(5);

    // The red stroke is '#ef4444'
    const rect = room2Element.querySelector('rect');
    expect(rect).toHaveAttribute('stroke', '#ef4444');

    fireEvent.mouseUp(document);
  });

  it('Smart Guides: Snap to alignment', async () => {
    // Room 1 (Static) at 0,0
    const room1 = useFloorplanStore.getState().addRoom({
        name: 'Static',
        length: 4,
        width: 4,
        type: 'living',
        height: 2.4,
        position: { x: 0, z: 0 }
    });

    // Room 2 (Moving) at 10,0
    const room2 = useFloorplanStore.getState().addRoom({
        name: 'Moving',
        length: 4,
        width: 4,
        type: 'kitchen',
        height: 2.4,
        position: { x: 10, z: 0 }
    });

    render(<Canvas2D />);

    const room2Element = await screen.findByTestId(`room-shape-${room2.id}`);

    // Drag Room 2 close to x=0 (align left edge)
    // Move from 10 to ~0.1.
    // Pixels: 10m -> 500px. 0.1m -> 5px.
    // Start 500, Move to 5.

    fireEvent.mouseDown(room2Element, { clientX: 500, clientY: 100, button: 0 });

    // Move to x=0.1 (5px)
    fireEvent.mouseMove(document, { clientX: 5, clientY: 100 });

    // Should snap to 0 exactly (left edge alignment)
    const updatedRoom = useFloorplanStore.getState().getRoomById(room2.id);
    expect(updatedRoom?.position.x).toBe(0);

    // Verify guide is rendered
    const guidesOverlay = screen.getByTestId('smart-guides-overlay');
    expect(guidesOverlay).toBeInTheDocument();
    // Should have children (lines)
    expect(guidesOverlay.children.length).toBeGreaterThan(0);

    fireEvent.mouseUp(document);
  });

  it('Measurement Overlay: Shows dimensions when room selected', async () => {
    render(<Canvas2D />);

    const room = useFloorplanStore.getState().addRoom({
        name: 'Measure Room',
        length: 5,
        width: 4,
        type: 'living',
        height: 2.4,
        position: { x: 0, z: 0 }
    });

    const roomElement = await screen.findByTestId(`room-shape-${room.id}`);

    // Measurements should not be visible initially (no selection)
    expect(screen.queryByText('5.00 m')).not.toBeInTheDocument();

    // Select room
    fireEvent.click(roomElement);

    // Measurements should be visible
    expect(screen.getByText('5.00 m')).toBeInTheDocument();
    expect(screen.getByText('4.00 m')).toBeInTheDocument();
  });

  it('Wall drawing: Draw walls -> create room from closed area', async () => {
      render(<Canvas2D />);

      // Manually add 4 walls forming a 5x5 rectangle at 0,0
      const { addWall } = useFloorplanStore.getState();

      // Wall 1: 0,0 -> 5,0
      addWall({ from: { x: 0, z: 0 }, to: { x: 5, z: 0 }, thickness: 0.2 });
      // Wall 2: 5,0 -> 5,5
      addWall({ from: { x: 5, z: 0 }, to: { x: 5, z: 5 }, thickness: 0.2 });
      // Wall 3: 5,5 -> 0,5
      addWall({ from: { x: 5, z: 5 }, to: { x: 0, z: 5 }, thickness: 0.2 });
      // Wall 4: 0,5 -> 0,0
      addWall({ from: { x: 0, z: 5 }, to: { x: 0, z: 0 }, thickness: 0.2 });

      // The RoomCreationOverlay should detect this and render a clickable area
      // It might take a render cycle for useMemo to update

      const overlay = await screen.findByTestId('room-creation-overlay');
      expect(overlay).toBeInTheDocument();

      // There should be a path element inside representing the room
      // Need to hover to see the text
      const polygonPath = overlay.querySelector('path');
      expect(polygonPath).toBeInTheDocument();

      if (polygonPath) {
        fireEvent.mouseEnter(polygonPath);
      }

      // We can search for the text "Click to Create Room"
      // Wait for it because detecting might be async or require re-render
      const createText = await screen.findByText('Click to Create Room');
      expect(createText).toBeInTheDocument();

      // Click the text/group to create room
      fireEvent.click(createText);

      // Verify room was created
      // The store should now have a room
      await waitFor(() => {
          expect(useFloorplanStore.getState().currentFloorplan?.rooms.length).toBe(1);
      });

      const room = useFloorplanStore.getState().currentFloorplan?.rooms[0];
      expect(room?.length).toBeCloseTo(5);
      expect(room?.width).toBeCloseTo(5);
  });
});
