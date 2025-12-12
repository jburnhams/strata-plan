import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ColorSchemeDialog } from '@/components/dialogs/ColorSchemeDialog';
import { useFloorplanStore } from '@/stores/floorplanStore';
import { COLOR_SCHEMES } from '@/services/colorSchemes';

// Mock dependencies
jest.mock('@/stores/floorplanStore', () => ({
  useFloorplanStore: jest.fn(),
}));

jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: any) => open ? <div role="dialog">{children}</div> : null,
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <h2>{children}</h2>,
  DialogDescription: ({ children }: any) => <p>{children}</p>,
  DialogFooter: ({ children }: any) => <div>{children}</div>,
}));

jest.mock('@/components/ui/scroll-area', () => ({
  ScrollArea: ({ children }: any) => <div>{children}</div>,
}));

describe('ColorSchemeDialog', () => {
  const mockUpdateRoom = jest.fn();
  const mockRooms = [
    { id: 'room-1', type: 'living', name: 'Living Room' },
    { id: 'room-2', type: 'kitchen', name: 'Kitchen' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useFloorplanStore as unknown as jest.Mock).mockImplementation((selector) => {
      return selector({
        currentFloorplan: { rooms: mockRooms },
        updateRoom: mockUpdateRoom,
      });
    });

    window.confirm = jest.fn(() => true); // Auto-confirm dialogs
  });

  it('renders color schemes', () => {
    render(<ColorSchemeDialog open={true} onOpenChange={jest.fn()} />);

    COLOR_SCHEMES.forEach(scheme => {
      expect(screen.getByText(scheme.name)).toBeInTheDocument();
    });
  });

  it('applies selected scheme to all rooms', () => {
    render(<ColorSchemeDialog open={true} onOpenChange={jest.fn()} />);

    // Select first scheme (Modern)
    fireEvent.click(screen.getByText('Modern'));

    // Click Apply
    fireEvent.click(screen.getByText('Apply Scheme'));

    expect(window.confirm).toHaveBeenCalled();
    expect(mockUpdateRoom).toHaveBeenCalledTimes(mockRooms.length);

    // Check if updateRoom was called with correct parameters for Modern scheme
    // Modern: hardwood floor, drywall-white wall
    expect(mockUpdateRoom).toHaveBeenCalledWith('room-1', expect.objectContaining({
      floorMaterial: 'hardwood',
      wallMaterial: 'drywall-white'
    }));
  });
});
