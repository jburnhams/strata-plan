import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PropertiesPanel } from '../../../../src/components/layout/PropertiesPanel';
import { useUIStore } from '../../../../src/stores/uiStore';
import { useFloorplanStore } from '../../../../src/stores/floorplanStore';
import { Room, Wall, Door, Window } from '../../../../src/types';

// Mock stores
jest.mock('../../../../src/stores/uiStore');
jest.mock('../../../../src/stores/floorplanStore');

// Mock MaterialPicker because it renders internal components that might complicate this high-level test
// and we only want to test that RoomPropertiesPanel is rendered and functions generally.
// Actually RoomPropertiesPanel is what's being tested implicitly.
// However, the test "calls updateRoom when other inputs change" specifically looks for color inputs.
// In RoomPropertiesPanel, the color input is:
// <Input id="room-color" type="color" ... />
// The MaterialPicker also has color inputs but they are inside an accordion which is likely closed by default?
// Wait, the error was "Unable to find an element with the display value: #ffffff".
// This suggests that the previous implementation of RoomPropertiesPanel had a color input that defaulted to #ffffff.
// In my update, I removed the generic "Color" input from RoomPropertiesPanel in favor of the Material Pickers?
// Let me check RoomPropertiesPanel.tsx content again.

// Mock ResizeObserver for ScrollArea
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('PropertiesPanel', () => {
  const mockTogglePropertiesPanel = jest.fn();
  const mockSetFocusProperty = jest.fn();
  const mockUpdateRoom = jest.fn();
  const mockDeleteRoom = jest.fn();
  const mockUpdateWall = jest.fn();
  const mockDeleteWall = jest.fn();
  const mockUpdateDoor = jest.fn();
  const mockDeleteDoor = jest.fn();
  const mockUpdateWindow = jest.fn();
  const mockDeleteWindow = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useUIStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = {
        propertiesPanelOpen: true,
        togglePropertiesPanel: mockTogglePropertiesPanel,
        focusProperty: null,
        setFocusProperty: mockSetFocusProperty,
      };
      return selector ? selector(state) : state;
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
        getWallById: () => null,
        getDoorById: () => null,
        getWindowById: () => null,
        updateRoom: mockUpdateRoom,
        deleteRoom: mockDeleteRoom,
        updateWall: mockUpdateWall,
        deleteWall: mockDeleteWall,
        updateDoor: mockUpdateDoor,
        deleteDoor: mockDeleteDoor,
        updateWindow: mockUpdateWindow,
        deleteWindow: mockDeleteWindow,
        setRoomFloorMaterial: jest.fn(),
        setRoomWallMaterial: jest.fn(),
        setRoomCeilingMaterial: jest.fn(),
        setRoomCustomColor: jest.fn(),
      };
      return selector(state);
    });
  });

  it('renders nothing when closed', () => {
    (useUIStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = {
        propertiesPanelOpen: false,
        togglePropertiesPanel: mockTogglePropertiesPanel,
        focusProperty: null,
        setFocusProperty: mockSetFocusProperty,
      };
      return selector ? selector(state) : state;
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
             setRoomFloorMaterial: jest.fn(),
            setRoomWallMaterial: jest.fn(),
            setRoomCeilingMaterial: jest.fn(),
            setRoomCustomColor: jest.fn(),
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
             setRoomFloorMaterial: jest.fn(),
            setRoomWallMaterial: jest.fn(),
            setRoomCeilingMaterial: jest.fn(),
            setRoomCustomColor: jest.fn(),
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
             setRoomFloorMaterial: jest.fn(),
            setRoomWallMaterial: jest.fn(),
            setRoomCeilingMaterial: jest.fn(),
            setRoomCustomColor: jest.fn(),
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
         setRoomFloorMaterial: jest.fn(),
            setRoomWallMaterial: jest.fn(),
            setRoomCeilingMaterial: jest.fn(),
            setRoomCustomColor: jest.fn(),
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

    // In Task 8.4, we removed the simple 'color' input from RoomPropertiesPanel
    // and replaced it with MaterialPicker which manages custom colors per surface.
    // The previous test expected a single color input.
    // We should either verify one of the material custom colors OR remove this part of the test.
    // Since the generic 'color' property on Room is still in the type definition but not used in the UI anymore (superseded by customFloorColor etc.),
    // we should update the test to not look for it, or look for the new material UI.
    // However, the test "calls updateRoom when other inputs change" was just bundling multiple inputs.
    // I will remove the color check from this test as it's now covered by specific material tests in RoomPropertiesPanel.test.tsx
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
         setRoomFloorMaterial: jest.fn(),
            setRoomWallMaterial: jest.fn(),
            setRoomCeilingMaterial: jest.fn(),
            setRoomCustomColor: jest.fn(),
      };
      return selector(state);
    });

    render(<PropertiesPanel />);
    const lengthInput = screen.getByLabelText(/Length/);

    // Invalid input - should not trigger update
    fireEvent.change(lengthInput, { target: { value: '-1' } });
    expect(mockUpdateRoom).not.toHaveBeenCalled();

    fireEvent.change(lengthInput, { target: { value: 'abc' } });
    expect(mockUpdateRoom).not.toHaveBeenCalled();
  });

  it('renders WallPropertiesPanel when a wall is selected', () => {
    const mockWall: Wall = {
      id: 'wall-1',
      from: { x: 0, z: 0 },
      to: { x: 5, z: 0 },
      thickness: 0.2,
      material: 'drywall',
    };

    (useFloorplanStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = {
        selectedRoomId: null,
        selectedWallId: 'wall-1',
        selectedDoorId: null,
        selectedWindowId: null,
        currentFloorplan: { units: 'meters' },
        getWallById: () => mockWall,
        updateWall: mockUpdateWall,
        deleteWall: mockDeleteWall,
      };
      return selector(state);
    });

    render(<PropertiesPanel />);
    expect(screen.getByTestId('wall-properties-panel')).toBeInTheDocument();
    expect(screen.getByText('Wall Properties')).toBeInTheDocument();

    // Check if thickness is displayed
    expect(screen.getByText('0.20')).toBeInTheDocument();
  });

  it('renders DoorPropertiesPanel when a door is selected', () => {
    const mockDoor: Door = {
      id: 'door-1',
      roomId: 'room-1',
      wallSide: 'north',
      position: 0.5,
      width: 0.9,
      height: 2.1,
      type: 'single',
      swing: 'inward',
      handleSide: 'right',
    };

    (useFloorplanStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = {
        selectedRoomId: null,
        selectedWallId: null,
        selectedDoorId: 'door-1',
        selectedWindowId: null,
        currentFloorplan: {
            units: 'meters',
            rooms: [{ id: 'room-1', name: 'Test Room' }]
        },
        getDoorById: () => mockDoor,
        updateDoor: mockUpdateDoor,
        deleteDoor: mockDeleteDoor,
      };
      return selector(state);
    });

    render(<PropertiesPanel />);
    expect(screen.getByTestId('door-properties-panel')).toBeInTheDocument();
    expect(screen.getByDisplayValue('0.9')).toBeInTheDocument();
  });

  it('renders WindowPropertiesPanel when a window is selected', () => {
    const mockWindow: Window = {
      id: 'window-1',
      roomId: 'room-1',
      wallSide: 'north',
      position: 0.5,
      width: 1.2,
      height: 1.2,
      sillHeight: 0.9,
      frameType: 'single',
    };

    (useFloorplanStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = {
        selectedRoomId: null,
        selectedWallId: null,
        selectedDoorId: null,
        selectedWindowId: 'window-1',
        currentFloorplan: {
            units: 'meters',
            rooms: [{ id: 'room-1', name: 'Test Room' }]
        },
        getWindowById: () => mockWindow,
        updateWindow: mockUpdateWindow,
        deleteWindow: mockDeleteWindow,
      };
      return selector(state);
    });

    render(<PropertiesPanel />);
    expect(screen.getByTestId('window-properties-panel')).toBeInTheDocument();
    expect(screen.getByLabelText(/^Width/)).toHaveValue(1.2);
    expect(screen.getByLabelText(/^Height/)).toHaveValue(1.2);
  });

  it('focuses room name input when requested', async () => {
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
         setRoomFloorMaterial: jest.fn(),
            setRoomWallMaterial: jest.fn(),
            setRoomCeilingMaterial: jest.fn(),
            setRoomCustomColor: jest.fn(),
      };
      return selector(state);
    });

    // 1. Initial render with no focus request
    (useUIStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = {
        propertiesPanelOpen: true,
        togglePropertiesPanel: mockTogglePropertiesPanel,
        focusProperty: null,
        setFocusProperty: mockSetFocusProperty,
      };
      return selector ? selector(state) : state;
    });

    const { rerender } = render(<PropertiesPanel />);

    const input = screen.getByDisplayValue('Test Room');
    // Spy on focus
    const focusSpy = jest.spyOn(input, 'focus');
    // Ensure document.getElementById finds this input
    jest.spyOn(document, 'getElementById').mockReturnValue(input);

    // 2. Update mock to request focus
    (useUIStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = {
        propertiesPanelOpen: true,
        togglePropertiesPanel: mockTogglePropertiesPanel,
        focusProperty: 'room-name',
        setFocusProperty: mockSetFocusProperty,
      };
      return selector ? selector(state) : state;
    });

    // 3. Rerender to trigger effect
    rerender(<PropertiesPanel />);

    // 4. Verify
    expect(focusSpy).toHaveBeenCalled();
    expect(mockSetFocusProperty).toHaveBeenCalledWith(null);
  });
});
