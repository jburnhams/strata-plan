import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { Canvas2D } from '../../src/components/editor/Canvas2D';
import { useFloorplanStore } from '../../src/stores/floorplanStore';
import { useUIStore } from '../../src/stores/uiStore';
import { Room } from '../../src/types';

// We need to mock ResizeObserver for CanvasViewport
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock ScrollIntoView
Element.prototype.scrollIntoView = jest.fn();

// Mock pointer capture methods
Element.prototype.setPointerCapture = jest.fn();
Element.prototype.releasePointerCapture = jest.fn();
Element.prototype.hasPointerCapture = jest.fn();

describe('Adjacency Integration', () => {
  beforeEach(() => {
    // Reset stores
    act(() => {
        useFloorplanStore.setState({
            currentFloorplan: {
                id: 'test',
                name: 'Test Plan',
                units: 'meters',
                rooms: [],
                walls: [],
                doors: [],
                windows: [],
                connections: [],
                createdAt: new Date(),
                updatedAt: new Date(),
                version: '1.0.0'
            }
        });
        useUIStore.setState({
            showConnections: true, // Enable connection lines
            showPath: false
        });
    });
  });

  it('should auto-detect adjacency and render connection line', async () => {
    // 1. Create two adjacent rooms
    const room1: Room = {
        id: '1', name: 'Room 1', length: 5, width: 5, height: 2.4, type: 'bedroom',
        position: { x: 0, z: 0 }, rotation: 0, doors: [], windows: []
    };
    const room2: Room = {
        id: '2', name: 'Room 2', length: 5, width: 5, height: 2.4, type: 'bedroom',
        position: { x: 5, z: 0 }, rotation: 0, doors: [], windows: []
    };

    act(() => {
        // Use loadFloorplan to set the initial state correctly
        const store = useFloorplanStore.getState();
        store.loadFloorplan({
            ...store.currentFloorplan!,
            rooms: [room1, room2]
        });
        store.recalculateConnections();
    });

    // 2. Render Canvas2D
    const { container } = render(<Canvas2D />);

    // 3. Check for connection line
    const titleElement = await screen.findByText(/Room 1 ↔ Room 2/);
    expect(titleElement).toBeInTheDocument();
    expect(titleElement).toHaveTextContent('5.00m shared');

    // Also check for the blue shared wall highlight
    // stroke="#3B82F6"
    const sharedWallLine = container.querySelector('line[stroke="#3B82F6"]');
    expect(sharedWallLine).toBeInTheDocument();
  });

  it('should remove connection when room moves away', async () => {
    const room1: Room = {
        id: '1', name: 'Room 1', length: 5, width: 5, height: 2.4, type: 'bedroom',
        position: { x: 0, z: 0 }, rotation: 0, doors: [], windows: []
    };
    const room2: Room = {
        id: '2', name: 'Room 2', length: 5, width: 5, height: 2.4, type: 'bedroom',
        position: { x: 5, z: 0 }, rotation: 0, doors: [], windows: []
    };

    // Initial setup with connection
    act(() => {
        const store = useFloorplanStore.getState();
        store.loadFloorplan({ ...store.currentFloorplan!, rooms: [room1, room2] });
        store.recalculateConnections();
    });

    const { container, rerender } = render(<Canvas2D />);
    expect(await screen.findByText(/Room 1 ↔ Room 2/)).toBeInTheDocument();

    // Move Room 2 away
    act(() => {
        const store = useFloorplanStore.getState();
        store.updateRoom('2', { position: { x: 10, z: 0 } });
        // Manually trigger recalculation as we don't have the sync hook running
        store.recalculateConnections();
    });

    // Re-render to reflect changes
    rerender(<Canvas2D />);

    // Expect connection to be gone
    const titleElement = screen.queryByText(/Room 1 ↔ Room 2/);
    expect(titleElement).not.toBeInTheDocument();

    const sharedWallLine = container.querySelector('line[stroke="#3B82F6"]');
    expect(sharedWallLine).toBeNull();
  });
});
