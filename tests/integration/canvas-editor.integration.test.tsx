
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Canvas2D } from '../../src/components/editor/Canvas2D';
import { useFloorplanStore } from '../../src/stores/floorplanStore';
import { useUIStore } from '../../src/stores/uiStore';
import { Room } from '../../src/types';

// Mock canvas API for napi-rs/canvas if needed, but jsdom environment might need polyfills.
// However, the test environment likely uses jest-environment-jsdom.
// We need to inject real canvas if we want to test canvas rendering,
// but here we are testing React components (RoomShape, SVG).
// The task asked for "@napi-rs/canvas" usage.
// This is typically for "canvas" element testing (like thumbnail generation or direct canvas usage).
// But our Canvas2D uses SVG.
// So maybe the integration test refers to something else?
// "Integration Tests for Canvas functionality run in JSDOM but use @napi-rs/canvas injected via jest.spyOn(document, 'createElement')"
// This memory item suggests we need it if we render <canvas> elements.
// Our RoomLayer uses SVG.
// But we do have `Ruler` which uses HTML Canvas.
// And Grid/ConnectionLines are SVG.

// Let's create a basic integration test that verifies Room positioning and Drag Drop via standard DOM events on SVG elements.
// If we need to mock canvas, we can do it.

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
    // We can check store
    expect(useFloorplanStore.getState().getRoomById(room.id)?.position.x).toBe(0);

    // Perform Drag
    // 1. Mouse Down on room
    fireEvent.mouseDown(roomElement, { clientX: 100, clientY: 100, button: 0 });

    // 2. Mouse Move on Document (global listener)
    // Move 50 pixels (at zoom 1.0, 50px/m, this is 1 meter)
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

    fireEvent.mouseDown(room2Element, { clientX: 500, clientY: 100, button: 0 });
    fireEvent.mouseMove(document, { clientX: 100, clientY: 100 }); // Move to ~2m X

    // At this point, positions should be updated in store (via useRoomDrag)
    // And collision check logic in the hook updates local state

    // We can't easily check the toast here unless we mock it or check DOM for toast.
    // But we can check if the SVG stroke color changed to red (collision color)?
    // The RoomShape updates stroke based on `isOverlapping`.

    // The component re-renders on store update.

    // Verify room moved
    expect(useFloorplanStore.getState().getRoomById(room2.id)?.position.x).toBeLessThan(5);

    // The red stroke is '#ef4444'
    const rect = room2Element.querySelector('rect');
    expect(rect).toHaveAttribute('stroke', '#ef4444');

    fireEvent.mouseUp(document);
  });

});
