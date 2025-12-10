import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PropertiesPanel } from '../../../../src/components/layout/PropertiesPanel';
import { useUIStore } from '../../../../src/stores/uiStore';
import { useFloorplanStore } from '../../../../src/stores/floorplanStore';
import { Room } from '../../../../src/types';

// Mock stores
jest.mock('../../../../src/stores/uiStore');
jest.mock('../../../../src/stores/floorplanStore');

// Mock ResizeObserver for ScrollArea
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock Radix UI ScrollArea if needed or handle via ResizeObserver mock
// The component structure is complex so simple ResizeObserver mock is usually enough

describe('PropertiesPanel', () => {
  const mockTogglePropertiesPanel = jest.fn();
  const mockUpdateRoom = jest.fn();
  const mockDeleteRoom = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useUIStore as unknown as jest.Mock).mockReturnValue({
      propertiesPanelOpen: true,
      togglePropertiesPanel: mockTogglePropertiesPanel,
    });

    (useFloorplanStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = {
        selectedRoomId: null,
        selectedWallId: null,
        selectedDoorId: null,
        selectedWindowId: null,
        currentFloorplan: { units: 'meters' },
        getRoomCount: () => 0,
        getTotalArea: () => 0,
        getSelectedRoom: () => null,
        updateRoom: mockUpdateRoom,
        deleteRoom: mockDeleteRoom,
      };
      return selector(state);
    });
  });

  it('renders nothing when closed', () => {
    (useUIStore as unknown as jest.Mock).mockReturnValue({
      propertiesPanelOpen: false,
      togglePropertiesPanel: mockTogglePropertiesPanel,
    });

    const { container } = render(<PropertiesPanel />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders NoSelectionPanel when nothing is selected', () => {
    render(<PropertiesPanel />);
    expect(screen.getByTestId('no-selection-panel')).toBeInTheDocument();
    expect(screen.getByText('Properties')).toBeInTheDocument();
  });

  it('renders RoomPropertiesPanel when a room is selected', () => {
    const mockRoom: Room = {
      id: 'room-1',
      name: 'Test Room',
      type: 'bedroom',
      length: 4,
      width: 3,
      height: 2.5,
      position: { x: 0, z: 0 },
      rotation: 0,
    };

    (useFloorplanStore as unknown as jest.Mock).mockImplementation((selector) => {
        const state = {
            selectedRoomId: 'room-1',
            selectedWallId: null,
            selectedDoorId: null,
            selectedWindowId: null,
            currentFloorplan: { units: 'meters' },
            getRoomCount: () => 1,
            getTotalArea: () => 12,
            getSelectedRoom: () => mockRoom,
            updateRoom: mockUpdateRoom,
            deleteRoom: mockDeleteRoom,
        };
        return selector(state);
    });

    render(<PropertiesPanel />);
    expect(screen.getByTestId('room-properties-panel')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Room')).toBeInTheDocument();
  });

  it('calls updateRoom when input changes', () => {
    const mockRoom: Room = {
      id: 'room-1',
      name: 'Test Room',
      type: 'bedroom',
      length: 4,
      width: 3,
      height: 2.5,
      position: { x: 0, z: 0 },
      rotation: 0,
    };

    (useFloorplanStore as unknown as jest.Mock).mockImplementation((selector) => {
        const state = {
            selectedRoomId: 'room-1',
            selectedWallId: null,
            selectedDoorId: null,
            selectedWindowId: null,
            currentFloorplan: { units: 'meters' },
            getRoomCount: () => 1,
            getTotalArea: () => 12,
            getSelectedRoom: () => mockRoom,
            updateRoom: mockUpdateRoom,
            deleteRoom: mockDeleteRoom,
        };
        return selector(state);
    });

    render(<PropertiesPanel />);
    const nameInput = screen.getByDisplayValue('Test Room');
    fireEvent.change(nameInput, { target: { value: 'New Name' } });
    expect(mockUpdateRoom).toHaveBeenCalledWith('room-1', { name: 'New Name' });
  });

  it('calls deleteRoom when delete button is clicked', () => {
     const mockRoom: Room = {
      id: 'room-1',
      name: 'Test Room',
      type: 'bedroom',
      length: 4,
      width: 3,
      height: 2.5,
      position: { x: 0, z: 0 },
      rotation: 0,
    };

    (useFloorplanStore as unknown as jest.Mock).mockImplementation((selector) => {
        const state = {
            selectedRoomId: 'room-1',
            selectedWallId: null,
            selectedDoorId: null,
            selectedWindowId: null,
            currentFloorplan: { units: 'meters' },
            getRoomCount: () => 1,
            getTotalArea: () => 12,
            getSelectedRoom: () => mockRoom,
            updateRoom: mockUpdateRoom,
            deleteRoom: mockDeleteRoom,
        };
        return selector(state);
    });

    // Mock window.confirm
    jest.spyOn(window, 'confirm').mockImplementation(() => true);

    render(<PropertiesPanel />);
    const deleteButton = screen.getByRole('button', { name: /delete room/i });
    fireEvent.click(deleteButton);
    expect(mockDeleteRoom).toHaveBeenCalledWith('room-1');
  });

  it('calls updateRoom when other inputs change', () => {
    const mockRoom: Room = {
      id: 'room-1',
      name: 'Test Room',
      type: 'bedroom',
      length: 4,
      width: 3,
      height: 2.5,
      position: { x: 0, z: 0 },
      rotation: 0,
      color: '#ffffff'
    };

    (useFloorplanStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = {
        selectedRoomId: 'room-1',
        selectedWallId: null,
        selectedDoorId: null,
        selectedWindowId: null,
        currentFloorplan: { units: 'meters' },
        getRoomCount: () => 1,
        getTotalArea: () => 12,
        getSelectedRoom: () => mockRoom,
        updateRoom: mockUpdateRoom,
        deleteRoom: mockDeleteRoom,
      };
      return selector(state);
    });

    render(<PropertiesPanel />);

    // Number inputs
    const lengthInput = screen.getByLabelText(/Length/);
    fireEvent.change(lengthInput, { target: { value: '5' } });
    expect(mockUpdateRoom).toHaveBeenCalledWith('room-1', { length: 5 });

    const widthInput = screen.getByLabelText(/Width/);
    fireEvent.change(widthInput, { target: { value: '4' } });
    expect(mockUpdateRoom).toHaveBeenCalledWith('room-1', { width: 4 });

    const heightInput = screen.getByLabelText(/Height/);
    fireEvent.change(heightInput, { target: { value: '3' } });
    expect(mockUpdateRoom).toHaveBeenCalledWith('room-1', { height: 3 });

    // Color input
    // We have two inputs for color, one type=color and one text
    const colorInputs = screen.getAllByDisplayValue('#ffffff');
    fireEvent.change(colorInputs[0], { target: { value: '#000000' } });
    expect(mockUpdateRoom).toHaveBeenCalledWith('room-1', { color: '#000000' });
  });

  it('validates number inputs', () => {
    const mockRoom: Room = {
      id: 'room-1',
      name: 'Test Room',
      type: 'bedroom',
      length: 4,
      width: 3,
      height: 2.5,
      position: { x: 0, z: 0 },
      rotation: 0,
    };

    (useFloorplanStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = {
        selectedRoomId: 'room-1',
        selectedWallId: null,
        selectedDoorId: null,
        selectedWindowId: null,
        currentFloorplan: { units: 'meters' },
        getRoomCount: () => 1,
        getTotalArea: () => 12,
        getSelectedRoom: () => mockRoom,
        updateRoom: mockUpdateRoom,
        deleteRoom: mockDeleteRoom,
      };
      return selector(state);
    });

    render(<PropertiesPanel />);
    const lengthInput = screen.getByLabelText(/Length/);

    // Invalid input - should not trigger update
    fireEvent.change(lengthInput, { target: { value: '-1' } });
    // Reset mock to ensure we don't catch previous calls if any (though clearAllMocks is in beforeEach)
    // But here we want to ensure *no new call* was made.
    // Since we called clearAllMocks in beforeEach, and previous tests might have run,
    // but this test is isolated.
    // However, the component might trigger on blur or change.
    // The handler is:
    // const handleNumberChange = (field, value) => {
    //   const numValue = parseFloat(value);
    //   if (!isNaN(numValue) && numValue > 0) {
    //     handleChange(field, numValue);
    //   }
    // };
    // So if value is '-1', numValue is -1. numValue > 0 is false. handleChange not called.
    expect(mockUpdateRoom).not.toHaveBeenCalled();

    fireEvent.change(lengthInput, { target: { value: 'abc' } });
    expect(mockUpdateRoom).not.toHaveBeenCalled();
  });
});
