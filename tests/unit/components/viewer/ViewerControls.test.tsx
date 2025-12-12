import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ViewerControls } from '@/components/viewer/ViewerControls';
import { useUIStore } from '@/stores/uiStore';
import userEvent from '@testing-library/user-event';

// Mock dependencies
jest.mock('@/components/ui/button', () => {
  const React = require('react');
  return {
    Button: React.forwardRef(({ children, onClick, title, ...props }: any, ref: any) => (
      <button ref={ref} onClick={onClick} title={title} {...props}>{children}</button>
    ))
  };
});

// Mock other UI components minimally
jest.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: any) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: any) => <div data-testid="dropdown-trigger">{children}</div>,
  DropdownMenuContent: ({ children }: any) => <div data-testid="dropdown-content">{children}</div>,
  DropdownMenuLabel: ({ children }: any) => <div>{children}</div>,
  DropdownMenuSeparator: () => <hr />,
  DropdownMenuItem: ({ children, onClick }: any) => <div onClick={onClick} role="menuitem">{children}</div>,
}));

jest.mock('@/components/ui/select', () => ({
  Select: ({ children, onValueChange, value }: any) => (
    <div data-testid="select" data-value={value} onClick={() => onValueChange && onValueChange('detailed')}>
      {children}
    </div>
  ),
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children, value }: any) => <option value={value}>{children}</option>,
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
}));

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  Box: () => <span>Box</span>,
  ArrowUp: () => <span>ArrowUp</span>,
  ArrowDown: () => <span>ArrowDown</span>,
  ArrowRight: () => <span>ArrowRight</span>,
  RotateCcw: () => <span>RotateCcw</span>,
  ZoomIn: () => <span>ZoomIn</span>,
  ZoomOut: () => <span>ZoomOut</span>,
  Settings: () => <span>Settings</span>,
  Grid: () => <span>Grid</span>,
  Type: () => <span>Type</span>,
  Sun: () => <span>Sun</span>,
  Layers: () => <span>Layers</span>,
  User: () => <span>User</span>,
  Download: () => <span>Download</span>,
  Maximize: () => <span>Maximize</span>,
  HelpCircle: () => <span>HelpCircle</span>,
  FileImage: () => <span>FileImage</span>,
  FileBox: () => <span>FileBox</span>,
  Palette: () => <span>Palette</span>,
}));

describe('ViewerControls Material Quality', () => {
  const mockSetMaterialQuality = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset store
    useUIStore.setState({
      materialQuality: 'standard',
      setMaterialQuality: mockSetMaterialQuality
    } as any);
  });

  it('renders material quality setting in dropdown', async () => {
    render(
      <ViewerControls
        cameraControlsRef={{ current: null } as any}
      />
    );

    expect(screen.getByText('Material Quality')).toBeInTheDocument();
  });

  it('calls setMaterialQuality when changed', async () => {
    render(
      <ViewerControls
        cameraControlsRef={{ current: null } as any}
      />
    );

    // Find the select for material quality.
    // Since we have multiple selects, we need to be specific or assume order/text.
    // Our mock simple clicks to trigger 'detailed' change.

    // Find the label first, then the next sibling or parent structure
    // Or in our mock, we just look for data-value="standard" which matches initial state
    const selects = screen.getAllByTestId('select');
    // Assuming the last one is material quality (Shadow Quality is before it)
    const materialSelect = selects[selects.length - 1];

    expect(materialSelect).toHaveAttribute('data-value', 'standard');

    fireEvent.click(materialSelect);

    expect(mockSetMaterialQuality).toHaveBeenCalledWith('detailed');
  });
});
