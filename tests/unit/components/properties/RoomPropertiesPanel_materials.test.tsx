import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RoomPropertiesPanel } from '@/components/properties/RoomPropertiesPanel';
import { useFloorplanStore } from '@/stores/floorplanStore';
import { useUIStore } from '@/stores/uiStore';
import { Room } from '@/types';

// Mock dependencies
jest.mock('@/components/properties/AdjacentRoomsSection', () => ({
  AdjacentRoomsSection: () => <div data-testid="adjacent-rooms-section">Adjacent Rooms</div>
}));

jest.mock('@/components/properties/MaterialPicker', () => ({
  MaterialPicker: ({ type, value, onChange }: any) => (
    <div data-testid={`material-picker-${type}`}>
      <span>{type} Picker</span>
      <button onClick={() => onChange('new-material')}>Change {type}</button>
    </div>
  )
}));

// Mock stores
jest.mock('@/stores/floorplanStore', () => ({
  useFloorplanStore: jest.fn(),
}));

jest.mock('@/stores/uiStore', () => ({
  useUIStore: jest.fn(),
}));

// Mock geometry service
jest.mock('@/services/geometry/room', () => ({
  calculateArea: jest.fn(() => 20),
  calculateVolume: jest.fn(() => 60),
}));

describe('RoomPropertiesPanel', () => {
  const mockRoom: Room = {
    id: 'room-1',
    name: 'Bedroom',
    type: 'bedroom',
    length: 5,
    width: 4,
    height: 3,
    position: { x: 0, z: 0 },
    rotation: 0,
    floorMaterial: 'hardwood',
    wallMaterial: 'drywall-painted',
    ceilingMaterial: 'drywall'
  } as Room;

  const mockUpdateRoom = jest.fn();
  const mockDeleteRoom = jest.fn();
  const mockSetFocusProperty = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useFloorplanStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = {
        getSelectedRoom: () => mockRoom,
        updateRoom: mockUpdateRoom,
        deleteRoom: mockDeleteRoom,
        currentFloorplan: { units: 'meters' },
      };
      return selector(state);
    });

    (useUIStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = {
        focusProperty: null,
        setFocusProperty: mockSetFocusProperty,
      };
      return selector(state);
    });
  });

  it('renders room properties and material pickers', async () => {
    render(<RoomPropertiesPanel />);

    expect(screen.getByTestId('room-properties-panel')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Bedroom')).toBeInTheDocument();

    // Check if material section exists (accordion needs to be expanded or at least present)
    expect(screen.getByText('Materials & Styling')).toBeInTheDocument();

    // Simulate accordion open if necessary (Radix default is closed usually, but text is visible)
    // We can click the trigger
    fireEvent.click(screen.getByText('Materials & Styling'));

    // Check if pickers are rendered
    // Note: Radix Accordion content might be hidden or not rendered until expanded.
    // Assuming simple rendering or immediate mounting in test env if not using full animation
    await waitFor(() => {
      expect(screen.getByTestId('material-picker-floor')).toBeInTheDocument();
      expect(screen.getByTestId('material-picker-wall')).toBeInTheDocument();
      expect(screen.getByTestId('material-picker-ceiling')).toBeInTheDocument();
    });
  });

  it('updates material when changed', async () => {
    render(<RoomPropertiesPanel />);

    fireEvent.click(screen.getByText('Materials & Styling'));

    await waitFor(() => {
        expect(screen.getByTestId('material-picker-floor')).toBeVisible();
    });

    const changeButton = screen.getByText('Change floor');
    fireEvent.click(changeButton);

    expect(mockUpdateRoom).toHaveBeenCalledWith('room-1', { floorMaterial: 'new-material' });
  });
});
