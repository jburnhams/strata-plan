import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TopToolbar } from '../../../../src/components/layout/TopToolbar';
import { useUIStore } from '../../../../src/stores/uiStore';
import { useDialogStore } from '../../../../src/stores/dialogStore';

// Mock the ThemeToggle
jest.mock('../../../../src/components/layout/ThemeToggle', () => ({
  ThemeToggle: () => <div data-testid="theme-toggle">Theme Toggle</div>,
}));

// Mock Dropdown Menu components to simplify testing interactions
jest.mock('../../../../src/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: any) => <div data-testid="dropdown-menu">{children}</div>,
  DropdownMenuTrigger: ({ children }: any) => <div data-testid="dropdown-trigger">{children}</div>,
  DropdownMenuContent: ({ children }: any) => <div data-testid="dropdown-content">{children}</div>,
  DropdownMenuItem: ({ children, onClick }: any) => (
    <div role="menuitem" onClick={onClick}>
      {children}
    </div>
  ),
  DropdownMenuCheckboxItem: ({ children, onCheckedChange, checked }: any) => (
    <div role="menuitemcheckbox" onClick={() => onCheckedChange(!checked)}>
      {children}
    </div>
  ),
  DropdownMenuSeparator: () => <hr />,
  DropdownMenuSub: ({ children }: any) => <div>{children}</div>,
  DropdownMenuSubTrigger: ({ children }: any) => <div>{children}</div>,
  DropdownMenuSubContent: ({ children }: any) => <div>{children}</div>,
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Save: () => <span data-testid="icon-save" />,
  FolderOpen: () => <span data-testid="icon-folder-open" />,
  FilePlus: () => <span data-testid="icon-file-plus" />,
  Settings: () => <span data-testid="icon-settings" />,
  HelpCircle: () => <span data-testid="icon-help-circle" />,
  Box: () => <span data-testid="icon-box" />,
  Download: () => <span data-testid="icon-download" />,
  Grid: () => <span data-testid="icon-grid" />,
  Ruler: () => <span data-testid="icon-ruler" />,
  Type: () => <span data-testid="icon-type" />,
  ZoomIn: () => <span data-testid="icon-zoom-in" />,
  ZoomOut: () => <span data-testid="icon-zoom-out" />,
  Maximize: () => <span data-testid="icon-maximize" />,
  Undo: () => <span data-testid="icon-undo" />,
  Redo: () => <span data-testid="icon-redo" />,
  Scissors: () => <span data-testid="icon-scissors" />,
  Copy: () => <span data-testid="icon-copy" />,
  Clipboard: () => <span data-testid="icon-clipboard" />,
  Trash2: () => <span data-testid="icon-trash2" />,
  MousePointer2: () => <span data-testid="icon-mouse-pointer2" />,
  CheckSquare: () => <span data-testid="icon-check-square" />,
}));

describe('TopToolbar', () => {
  it('renders correctly', () => {
    render(<TopToolbar />);
    expect(screen.getByTestId('top-toolbar')).toBeInTheDocument();
  });

  it('renders menu triggers', () => {
    render(<TopToolbar />);
    expect(screen.getByText('File')).toBeInTheDocument();
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('View')).toBeInTheDocument();
  });

  it('opens New Project dialog', () => {
    const openDialogSpy = jest.fn();
    useDialogStore.setState({ openDialog: openDialogSpy });

    render(<TopToolbar />);
    // With mocks, items are rendered. We find "New Project" directly.
    // Note: It might be visible even without clicking trigger due to mocks.
    // That's fine for unit testing the "onClick" logic.
    fireEvent.click(screen.getByText('New Project'));

    expect(openDialogSpy).toHaveBeenCalledWith('newProject');
  });

  it('toggles grid', () => {
    const toggleGridSpy = jest.fn();
    useUIStore.setState({ toggleGrid: toggleGridSpy, showGrid: false });

    render(<TopToolbar />);
    fireEvent.click(screen.getByText('Show Grid'));

    expect(toggleGridSpy).toHaveBeenCalledWith(true);
  });

  it('toggles measurements', () => {
    const toggleSpy = jest.fn();
    useUIStore.setState({ toggleMeasurements: toggleSpy, showMeasurements: false });

    render(<TopToolbar />);
    fireEvent.click(screen.getByText('Show Measurements'));

    expect(toggleSpy).toHaveBeenCalledWith(true);
  });

  it('zooms in', () => {
    const zoomInSpy = jest.fn();
    useUIStore.setState({ zoomIn: zoomInSpy });

    render(<TopToolbar />);
    fireEvent.click(screen.getByText('Zoom In'));

    expect(zoomInSpy).toHaveBeenCalled();
  });

  it('resets zoom', () => {
    const resetZoomSpy = jest.fn();
    useUIStore.setState({ resetZoom: resetZoomSpy });

    render(<TopToolbar />);
    fireEvent.click(screen.getByText('Zoom to Fit'));

    expect(resetZoomSpy).toHaveBeenCalled();
  });
});
