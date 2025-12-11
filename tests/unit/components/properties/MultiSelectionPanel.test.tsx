import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import { MultiSelectionPanel } from '../../../../src/components/properties/MultiSelectionPanel';
import { useFloorplanStore } from '../../../../src/stores/floorplanStore';
import { Room } from '../../../../src/types/room';

describe('MultiSelectionPanel', () => {
  const mockUpdateRoom = jest.fn();
  const mockDeleteRoom = jest.fn();

  beforeEach(() => {
    // Reset store state and mocks
    useFloorplanStore.setState({
      currentFloorplan: {
        id: 'test',
        name: 'test',
        units: 'meters',
        rooms: [],
        walls: [],
        doors: [],
        windows: [],
        connections: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0.0',
      },
      selectedRoomIds: [],
    });

    // Spy on actions
    jest.spyOn(useFloorplanStore.getState(), 'updateRoom').mockImplementation(mockUpdateRoom);
    jest.spyOn(useFloorplanStore.getState(), 'deleteRoom').mockImplementation(mockDeleteRoom);
    mockUpdateRoom.mockClear();
    mockDeleteRoom.mockClear();
  });

  const setupSelection = (rooms: Room[]) => {
    const store = useFloorplanStore.getState();
    const currentFloorplan = store.currentFloorplan!;

    useFloorplanStore.setState({
        currentFloorplan: {
            ...currentFloorplan,
            rooms: rooms
        },
        selectedRoomIds: rooms.map(r => r.id)
    });
  };

  it('renders nothing if less than 2 rooms selected', () => {
    setupSelection([{ id: '1', type: 'bedroom' } as any]);
    render(<MultiSelectionPanel />);
    expect(screen.queryByTestId('multi-selection-panel')).not.toBeInTheDocument();
  });

  it('renders mixed types correctly', () => {
    setupSelection([
      { id: '1', type: 'bedroom', height: 2.4, color: '#ffffff' } as any,
      { id: '2', type: 'kitchen', height: 2.4, color: '#ffffff' } as any,
    ]);

    render(<MultiSelectionPanel />);

    expect(screen.getByText('2 Rooms Selected')).toBeInTheDocument();
    expect(screen.getByText('Mixed Types')).toBeInTheDocument();
  });

  it('renders common type correctly', () => {
    setupSelection([
      { id: '1', type: 'bedroom', height: 2.4, color: '#ffffff' } as any,
      { id: '2', type: 'bedroom', height: 2.4, color: '#ffffff' } as any,
    ]);

    render(<MultiSelectionPanel />);

    expect(screen.getByText('Bedroom')).toBeInTheDocument();
  });

  it('renders mixed height correctly', () => {
     setupSelection([
      { id: '1', type: 'bedroom', height: 2.4, color: '#ffffff' } as any,
      { id: '2', type: 'bedroom', height: 3.0, color: '#ffffff' } as any,
    ]);

    render(<MultiSelectionPanel />);

    const input = screen.getByLabelText(/height/i);
    expect(input).toHaveValue('');
    expect(input).toHaveAttribute('placeholder', 'Mixed Values');
  });

  it('updates all rooms when type changes', () => {
    setupSelection([
      { id: '1', type: 'bedroom', height: 2.4, color: '#ffffff' } as any,
      { id: '2', type: 'kitchen', height: 2.4, color: '#ffffff' } as any,
    ]);

    render(<MultiSelectionPanel />);

    // Open select
    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);

    // Select 'Office'
    const option = screen.getByRole('option', { name: 'Office' });
    fireEvent.click(option);

    expect(mockUpdateRoom).toHaveBeenCalledWith('1', { type: 'office' });
    expect(mockUpdateRoom).toHaveBeenCalledWith('2', { type: 'office' });
  });

   it('updates all rooms when height changes on blur', () => {
    setupSelection([
      { id: '1', type: 'bedroom', height: 2.4, color: '#ffffff' } as any,
      { id: '2', type: 'bedroom', height: 2.4, color: '#ffffff' } as any,
    ]);

    render(<MultiSelectionPanel />);

    const input = screen.getByLabelText(/height/i);
    fireEvent.change(input, { target: { value: '3.5' } });

    // Should not handle yet
    expect(mockUpdateRoom).not.toHaveBeenCalled();

    // Trigger blur
    fireEvent.blur(input);

    expect(mockUpdateRoom).toHaveBeenCalledWith('1', { height: 3.5 });
    expect(mockUpdateRoom).toHaveBeenCalledWith('2', { height: 3.5 });
  });

  it('updates all rooms when height changes on enter', () => {
    setupSelection([
      { id: '1', type: 'bedroom', height: 2.4, color: '#ffffff' } as any,
      { id: '2', type: 'bedroom', height: 2.4, color: '#ffffff' } as any,
    ]);

    render(<MultiSelectionPanel />);

    const input = screen.getByLabelText(/height/i);
    fireEvent.change(input, { target: { value: '3.5' } });

    // Trigger Enter
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(mockUpdateRoom).toHaveBeenCalledWith('1', { height: 3.5 });
    expect(mockUpdateRoom).toHaveBeenCalledWith('2', { height: 3.5 });
  });

  it('deletes all selected rooms', () => {
    window.confirm = jest.fn(() => true);
    setupSelection([
      { id: '1', type: 'bedroom', height: 2.4, color: '#ffffff' } as any,
      { id: '2', type: 'bedroom', height: 2.4, color: '#ffffff' } as any,
    ]);

    render(<MultiSelectionPanel />);

    const deleteBtn = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteBtn);

    expect(window.confirm).toHaveBeenCalled();
    expect(mockDeleteRoom).toHaveBeenCalledWith('1');
    expect(mockDeleteRoom).toHaveBeenCalledWith('2');
  });

  it('renders link rooms button when 2 rooms are selected and not connected', () => {
    setupSelection([
      { id: '1', type: 'bedroom', height: 2.4 } as any,
      { id: '2', type: 'kitchen', height: 2.4 } as any,
    ]);

    render(<MultiSelectionPanel />);
    expect(screen.getByText(/Link Rooms/i)).toBeInTheDocument();
  });

  it('calls addManualConnection when link button is clicked', () => {
    setupSelection([
      { id: '1', type: 'bedroom', height: 2.4 } as any,
      { id: '2', type: 'kitchen', height: 2.4 } as any,
    ]);
    const mockAddManualConnection = jest.fn();
    // We need to attach the mock to the store instance
    useFloorplanStore.setState({ addManualConnection: mockAddManualConnection } as any);

    render(<MultiSelectionPanel />);
    const linkBtn = screen.getByText(/Link Rooms/i);
    fireEvent.click(linkBtn);
    expect(mockAddManualConnection).toHaveBeenCalledWith('1', '2');
  });

  it('does not render link button if rooms are already connected', () => {
    const store = useFloorplanStore.getState();
    useFloorplanStore.setState({
      currentFloorplan: {
        ...store.currentFloorplan!,
        rooms: [{ id: '1', height: 2.4 }, { id: '2', height: 2.4 }] as any,
        connections: [{ room1Id: '1', room2Id: '2', id: 'c1' } as any]
      },
      selectedRoomIds: ['1', '2']
    });

    render(<MultiSelectionPanel />);
    expect(screen.queryByText(/Link Rooms/i)).not.toBeInTheDocument();
  });
});
