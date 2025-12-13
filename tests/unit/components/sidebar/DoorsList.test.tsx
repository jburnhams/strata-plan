import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DoorsList } from '@/components/sidebar/DoorsList';
import { useFloorplanStore } from '@/stores/floorplanStore';
import { mockFloorplan } from '../../../utils/mockData';

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  DoorOpen: () => <div data-testid="door-icon" />,
  ChevronDown: () => <div data-testid="chevron-down" />,
  ChevronRight: () => <div data-testid="chevron-right" />
}));

describe('DoorsList', () => {
  beforeEach(() => {
    useFloorplanStore.getState().clearFloorplan();
    useFloorplanStore.getState().loadFloorplan(mockFloorplan());
  });

  it('renders correctly with no doors', () => {
    render(<DoorsList />);
    expect(screen.getByText('Doors')).toBeInTheDocument();

    // Expand section
    const button = screen.getByText('Doors').closest('button');
    if (button) fireEvent.click(button);

    expect(screen.getByText('No doors')).toBeInTheDocument();
  });

  it('renders list of doors', () => {
    const room = useFloorplanStore.getState().addRoom({
      name: 'Living Room',
      length: 5,
      width: 4,
      type: 'living',
      height: 2.4,
      position: { x: 0, z: 0 },
      rotation: 0
    });

    useFloorplanStore.getState().addDoor({
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

    useFloorplanStore.getState().addDoor({
      roomId: room.id,
      wallSide: 'south',
      position: 0.5,
      width: 1.5,
      height: 2.1,
      type: 'double',
      swing: 'outward',
      handleSide: 'right',
      isExterior: true
    });

    render(<DoorsList />);

    // Expand section
    const button = screen.getByText('Doors').closest('button');
    if (button) fireEvent.click(button);

    expect(screen.getByText('Single Door')).toBeInTheDocument();
    expect(screen.getByText('Double Door')).toBeInTheDocument();

    const roomNames = screen.getAllByText('Living Room');
    expect(roomNames.length).toBeGreaterThanOrEqual(2);
  });

  it('selects door on click', () => {
    const room = useFloorplanStore.getState().addRoom({
      name: 'Test Room',
      length: 5,
      width: 4,
      type: 'living',
      height: 2.4,
      position: { x: 0, z: 0 },
      rotation: 0
    });

    const door = useFloorplanStore.getState().addDoor({
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

    render(<DoorsList />);

    // Expand section
    const button = screen.getByText('Doors').closest('button');
    if (button) fireEvent.click(button);

    const doorItem = screen.getByTestId(`door-list-item-${door.id}`);
    fireEvent.click(doorItem);

    expect(useFloorplanStore.getState().selectedDoorId).toBe(door.id);
  });
});
