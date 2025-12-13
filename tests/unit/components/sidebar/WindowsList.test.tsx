import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { WindowsList } from '../../../../src/components/sidebar/WindowsList';
import { useFloorplanStore } from '../../../../src/stores/floorplanStore';
import { mockFloorplan } from '../../../utils/mockData';

// Mock dependencies
jest.mock('lucide-react', () => ({
  Maximize: () => <div data-testid="icon-maximize" />,
  Layers: () => <div data-testid="icon-layers" />,
  List: () => <div data-testid="icon-list" />,
  ChevronDown: () => <div data-testid="icon-chevron-down" />,
  ChevronRight: () => <div data-testid="icon-chevron-right" />,
  Copy: () => <div data-testid="icon-copy" />,
  Trash2: () => <div data-testid="icon-trash" />,
}));

// Mock Context Menu
jest.mock('../../../../src/components/ui/context-menu', () => ({
  ContextMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  ContextMenuTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  ContextMenuContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  ContextMenuItem: ({ children, onClick }: { children: React.ReactNode, onClick: any }) => <div onClick={onClick} data-testid="context-menu-item">{children}</div>,
  ContextMenuSeparator: () => <div />,
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
