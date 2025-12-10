import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TopToolbar } from '../../../../src/components/layout/TopToolbar';

// Mock the ThemeToggle since it uses useTheme hook which might need mocking
jest.mock('../../../../src/components/layout/ThemeToggle', () => ({
  ThemeToggle: () => <div data-testid="theme-toggle">Theme Toggle</div>,
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

  it('renders the application title', () => {
    render(<TopToolbar />);
    expect(screen.getByText('StrataPlan')).toBeInTheDocument();
  });

  it('renders the File menu', () => {
    render(<TopToolbar />);
    const fileMenuTrigger = screen.getByText('File');
    expect(fileMenuTrigger).toBeInTheDocument();
  });

  it('renders the Edit menu', () => {
    render(<TopToolbar />);
    expect(screen.getByText('Edit')).toBeInTheDocument();
  });

  it('renders the View menu', () => {
    render(<TopToolbar />);
    expect(screen.getByText('View')).toBeInTheDocument();
  });

  it('renders the theme toggle', () => {
    render(<TopToolbar />);
    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
  });

  it('renders action buttons', () => {
    render(<TopToolbar />);
    expect(screen.getByText('View 3D')).toBeInTheDocument();
    expect(screen.getByText('Export')).toBeInTheDocument();
  });
});
