import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useUIStore } from '@/stores/uiStore';
import { useFloorplanStore } from '@/stores/floorplanStore';

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  Menu: () => <div data-testid="icon-menu" />,
  LayoutGrid: () => <div data-testid="icon-grid" />,
  Maximize: () => <div data-testid="icon-maximize" />,
  Cuboid: () => <div data-testid="icon-cuboid" />,
  MoreHorizontal: () => <div data-testid="icon-more" />,
  Settings: () => <div data-testid="icon-settings" />,
  FileDown: () => <div data-testid="icon-export" />,
  FolderOpen: () => <div data-testid="icon-projects" />,
  X: () => <div data-testid="icon-close" />,
}));

// Mock hooks
jest.mock('@/stores/uiStore');
jest.mock('@/stores/floorplanStore');
jest.mock('@/hooks/useProject', () => ({
    useProject: () => ({ currentProject: null }) // Not used anymore
}));

// Mock Dialog
jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open, onOpenChange }: any) => {
    return (
      <div data-testid="dialog-root">
        {open && (
          <div data-testid="dialog-open">
             {children}
             <button onClick={() => onOpenChange(false)}>Close</button>
          </div>
        )}
      </div>
    );
  },
  DialogContent: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
  DialogTrigger: ({ children }: any) => <div data-testid="dialog-trigger">{children}</div>,
}));

describe('MobileLayout', () => {
  const mockSetMode = jest.fn();

  beforeEach(() => {
    (useUIStore as unknown as jest.Mock).mockReturnValue({
      mode: 'table',
      setMode: mockSetMode,
    });
    (useFloorplanStore as unknown as jest.Mock).mockReturnValue({
      currentFloorplan: { name: 'Test Project' },
    });
    mockSetMode.mockClear();
  });

  it('renders correctly', () => {
    render(
      <MobileLayout>
        <div data-testid="content">Content</div>
      </MobileLayout>
    );

    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.getByTestId('content')).toBeInTheDocument();
    expect(screen.getByText('Table')).toBeInTheDocument();
    expect(screen.getByText('2D')).toBeInTheDocument();
    expect(screen.getByText('3D')).toBeInTheDocument();
  });

  it('switches views using bottom navigation', () => {
    render(<MobileLayout />);

    fireEvent.click(screen.getByText('2D').closest('button')!);
    expect(mockSetMode).toHaveBeenCalledWith('canvas');

    fireEvent.click(screen.getByText('3D').closest('button')!);
    expect(mockSetMode).toHaveBeenCalledWith('view3d');

    fireEvent.click(screen.getByText('Table').closest('button')!);
    expect(mockSetMode).toHaveBeenCalledWith('table');
  });

  it('opens drawer on menu click', () => {
    render(<MobileLayout />);

    expect(screen.queryByTestId('dialog-open')).not.toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Menu'));

    expect(screen.getByTestId('dialog-open')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
  });
});
