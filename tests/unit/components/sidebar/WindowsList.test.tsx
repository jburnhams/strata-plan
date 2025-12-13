import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { WindowsList } from '@/components/sidebar/WindowsList';
import { useFloorplanStore } from '@/stores/floorplanStore';
import { mockFloorplan } from '../../../utils/mockData';

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  Maximize: () => <div data-testid="window-icon" />,
  ChevronDown: () => <div data-testid="chevron-down" />,
  ChevronRight: () => <div data-testid="chevron-right" />
}));

describe('WindowsList', () => {
  beforeEach(() => {
    useFloorplanStore.getState().clearFloorplan();
    useFloorplanStore.getState().loadFloorplan(mockFloorplan());
  });

  it('renders correctly with no windows', () => {
    render(<WindowsList />);
    expect(screen.getByText('Windows')).toBeInTheDocument();

    // Expand section
    const button = screen.getByText('Windows').closest('button');
    if (button) fireEvent.click(button);

    expect(screen.getByText('No windows')).toBeInTheDocument();
  });

  it('renders list of windows', () => {
    const room = useFloorplanStore.getState().addRoom({
      name: 'Kitchen',
      length: 5,
      width: 4,
      type: 'kitchen',
      height: 2.4,
      position: { x: 0, z: 0 },
      rotation: 0
    });

    const window1 = useFloorplanStore.getState().addWindow({
      roomId: room.id,
      wallSide: 'north',
      position: 0.5,
      width: 1.2,
      height: 1.2,
      sillHeight: 0.9,
      frameType: 'double',
      material: 'pvc',
      openingType: 'casement'
    });

    render(<WindowsList />);

    // Expand section
    const button = screen.getByText('Windows').closest('button');
    if (button) fireEvent.click(button);

    expect(screen.getByText('1.2m x 1.2m')).toBeInTheDocument();
    expect(screen.getByText('Kitchen')).toBeInTheDocument();
  });

  it('selects window on click', () => {
    const room = useFloorplanStore.getState().addRoom({
      name: 'Test Room',
      length: 5,
      width: 4,
      type: 'living',
      height: 2.4,
      position: { x: 0, z: 0 },
      rotation: 0
    });

    const window = useFloorplanStore.getState().addWindow({
      roomId: room.id,
      wallSide: 'north',
      position: 0.5,
      width: 1.2,
      height: 1.2,
      sillHeight: 0.9,
      frameType: 'double',
      material: 'pvc',
      openingType: 'casement'
    });

    render(<WindowsList />);

    // Expand section
    const button = screen.getByText('Windows').closest('button');
    if (button) fireEvent.click(button);

    const windowItem = screen.getByTestId(`window-list-item-${window.id}`);
    fireEvent.click(windowItem);

    expect(useFloorplanStore.getState().selectedWindowId).toBe(window.id);
  });
});
