import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DoorPropertiesPanel } from '@/components/properties/DoorPropertiesPanel';
import { WindowPropertiesPanel } from '@/components/properties/WindowPropertiesPanel';
import { useFloorplanStore } from '@/stores/floorplanStore';
import { createJSONStorage } from 'zustand/middleware';

// Mock storage to avoid IDB errors in test env
jest.mock('@/services/storage/projectStorage', () => ({
  projectStorage: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
}));

describe('Doors and Windows Integration', () => {
  beforeEach(() => {
    const store = useFloorplanStore.getState();
    store.loadFloorplan({
      id: 'test-plan',
      name: 'Test Plan',
      units: 'meters',
      rooms: [],
      connections: [],
      doors: [],
      windows: [],
      walls: [],
      version: '1.0.0',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  it('allows updating door properties', async () => {
    const store = useFloorplanStore.getState();
    const room = store.addRoom({
        name: 'Living Room',
        width: 5,
        length: 5,
        type: 'living',
        height: 2.4,
        position: { x: 0, z: 0 } // Explicitly provide position to match store expectation
    });

    // Add a door
    const door = store.addDoor({
      roomId: room.id,
      wallSide: 'north',
      position: 0.5,
      width: 0.9,
      height: 2.1,
      type: 'single',
      swing: 'inward',
      handleSide: 'left',
      isExterior: true
    });

    store.selectDoor(door.id);

    render(<DoorPropertiesPanel />);

    // Verify initial render
    expect(screen.getByText('Living Room')).toBeInTheDocument();
    expect(screen.getByLabelText(/Width/)).toHaveValue(0.9);

    // Update width
    const widthInput = screen.getByLabelText(/Width/);
    fireEvent.change(widthInput, { target: { value: '1.2' } });

    // Verify store update
    await waitFor(() => {
        const updatedDoor = useFloorplanStore.getState().getDoorById(door.id);
        expect(updatedDoor?.width).toBe(1.2);
    });
  });

  it('allows updating window properties', async () => {
    const store = useFloorplanStore.getState();
    const room = store.addRoom({
        name: 'Kitchen',
        width: 4,
        length: 4,
        type: 'kitchen',
        height: 2.4,
        position: { x: 0, z: 0 }
    });

    // Add a window
    const windowObj = store.addWindow({
      roomId: room.id,
      wallSide: 'south',
      position: 0.3,
      width: 1.2,
      height: 1.2,
      frameType: 'single',
      material: 'pvc',
      openingType: 'fixed',
      sillHeight: 0.9
    });

    store.selectWindow(windowObj.id);

    render(<WindowPropertiesPanel />);

    // Verify initial render
    expect(screen.getByText('Kitchen')).toBeInTheDocument();
    expect(screen.getByLabelText(/Width/)).toHaveValue(1.2);

    // Update width
    const widthInput = screen.getByLabelText(/Width/);
    fireEvent.change(widthInput, { target: { value: '1.5' } });

    // Verify store update
    await waitFor(() => {
        const updatedWindow = useFloorplanStore.getState().getWindowById(windowObj.id);
        expect(updatedWindow?.width).toBe(1.5);
    });
  });
});
