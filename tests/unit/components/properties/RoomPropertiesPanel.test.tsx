import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RoomPropertiesPanel } from '@/components/properties/RoomPropertiesPanel';
import { useFloorplanStore } from '@/stores/floorplanStore';
import { Room } from '@/types/room';

// Mock dependencies
jest.mock('@/components/properties/AdjacentRoomsSection', () => ({
  AdjacentRoomsSection: () => <div data-testid="adjacent-rooms-section">Adjacent Rooms</div>,
}));

// Mock MaterialPicker to simplify testing
jest.mock('@/components/properties/MaterialPicker', () => ({
  MaterialPicker: ({ type, value, onChange, customColor, onCustomColorChange }: any) => (
    <div data-testid={`material-picker-${type}`}>
      <span data-testid={`material-value-${type}`}>{value}</span>
      <span data-testid={`custom-color-${type}`}>{customColor}</span>
      <button
        onClick={() => onChange('new-material')}
        data-testid={`change-material-${type}`}
      >
        Change Material
      </button>
      <button
        onClick={() => onCustomColorChange('#newcolor')}
        data-testid={`change-color-${type}`}
      >
        Change Color
      </button>
    </div>
  ),
}));

// Mock ResizeObserver
const ResizeObserverMock = jest.fn(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

global.ResizeObserver = ResizeObserverMock as any;

describe('RoomPropertiesPanel', () => {
  const mockRoom: Room = {
    id: 'room-1',
    name: 'Test Room',
    type: 'bedroom',
    length: 4,
    width: 3,
    height: 2.7,
    position: { x: 0, z: 0 },
    rotation: 0,
    floorMaterial: 'hardwood',
    wallMaterial: 'drywall-white',
    ceilingMaterial: 'drywall',
  };

  const initialState = useFloorplanStore.getState();

  beforeEach(() => {
    useFloorplanStore.setState(initialState, true);

    // Setup store with a room and select it
    const { addRoom, selectRoom } = useFloorplanStore.getState();
    useFloorplanStore.setState({
      currentFloorplan: {
        id: 'fp-1',
        name: 'Test Plan',
        units: 'meters',
        rooms: [mockRoom],
        walls: [],
        doors: [],
        windows: [],
        connections: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0.0',
      }
    });
    selectRoom(mockRoom.id);
  });

  it('renders room properties and material section', () => {
    render(<RoomPropertiesPanel />);

    expect(screen.getByLabelText('Name')).toHaveValue('Test Room');
    expect(screen.getByText('Materials & Finishes')).toBeInTheDocument();
  });

  it('updates room name', () => {
    render(<RoomPropertiesPanel />);
    const nameInput = screen.getByLabelText('Name');

    fireEvent.change(nameInput, { target: { value: 'New Name' } });

    const updatedRoom = useFloorplanStore.getState().getRoomById(mockRoom.id);
    expect(updatedRoom?.name).toBe('New Name');
  });

  it('updates materials via MaterialPicker', async () => {
    render(<RoomPropertiesPanel />);

    // Open accordion
    const accordionTrigger = screen.getByText('Materials & Finishes');
    fireEvent.click(accordionTrigger);

    // Verify pickers are present (after accordion animation/state change)
    await waitFor(() => {
        expect(screen.getByTestId('material-picker-floor')).toBeInTheDocument();
    });

    // Change floor material
    fireEvent.click(screen.getByTestId('change-material-floor'));

    const updatedRoom = useFloorplanStore.getState().getRoomById(mockRoom.id);
    expect(updatedRoom?.floorMaterial).toBe('new-material');
  });

  it('updates custom colors via MaterialPicker', async () => {
    render(<RoomPropertiesPanel />);

    // Open accordion
    const accordionTrigger = screen.getByText('Materials & Finishes');
    fireEvent.click(accordionTrigger);

     await waitFor(() => {
        expect(screen.getByTestId('material-picker-wall')).toBeInTheDocument();
     });

    // Change wall custom color
    fireEvent.click(screen.getByTestId('change-color-wall'));

    const updatedRoom = useFloorplanStore.getState().getRoomById(mockRoom.id);
    expect(updatedRoom?.customWallColor).toBe('#newcolor');
  });

  it('resets materials to default', async () => {
     // First change material to something non-default
    const { updateRoom } = useFloorplanStore.getState();
    updateRoom(mockRoom.id, { floorMaterial: 'carpet', customFloorColor: '#000000' });

    render(<RoomPropertiesPanel />);

    // Open accordion
    const accordionTrigger = screen.getByText('Materials & Finishes');
    fireEvent.click(accordionTrigger);

     await waitFor(() => {
        expect(screen.getByText('Reset to bedroom Defaults')).toBeInTheDocument();
     });

    // Click reset
    fireEvent.click(screen.getByText('Reset to bedroom Defaults'));

    const updatedRoom = useFloorplanStore.getState().getRoomById(mockRoom.id);
    // Should be back to bedroom default (hardwood)
    expect(updatedRoom?.floorMaterial).toBe('hardwood');
    // Should clear custom color
    expect(updatedRoom?.customFloorColor).toBeUndefined();
  });
});
