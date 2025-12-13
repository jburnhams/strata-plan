import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ColorSchemeDialog } from '@/components/dialogs/ColorSchemeDialog';
import { COLOR_SCHEMES } from '@/services/colorSchemes';

// Mock UI components
jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: any) => open ? <div>{children}</div> : null,
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <div>{children}</div>,
  DialogDescription: ({ children }: any) => <div>{children}</div>,
  DialogFooter: ({ children }: any) => <div>{children}</div>,
}));

jest.mock('@/components/ui/select', () => {
  const { COLOR_SCHEMES } = require('@/services/colorSchemes');
  return {
    Select: ({ value, onValueChange }: any) => (
        <select data-testid="scheme-select" value={value} onChange={e => onValueChange(e.target.value)}>
           {COLOR_SCHEMES.map((s: any) => (
               <option key={s.id} value={s.id}>{s.name}</option>
           ))}
        </select>
    ),
    SelectTrigger: () => null,
    SelectContent: () => null,
    SelectItem: () => null,
    SelectValue: () => null,
  };
});

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
}));

// Mock store
const mockApplyColorScheme = jest.fn();
jest.mock('@/stores/floorplanStore', () => ({
  useFloorplanStore: (selector: any) => selector({
    applyColorScheme: mockApplyColorScheme
  })
}));

describe('ColorSchemeDialog', () => {
  const defaultProps = {
    open: true,
    onOpenChange: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly when open', () => {
    render(<ColorSchemeDialog {...defaultProps} />);
    expect(screen.getByText('Color Schemes')).toBeInTheDocument();
    expect(screen.getByText('Apply Scheme')).toBeInTheDocument();
  });

  it('displays standard scheme by default', () => {
    render(<ColorSchemeDialog {...defaultProps} />);
    const standardScheme = COLOR_SCHEMES.find(s => s.id === 'standard');
    expect(screen.getByText(standardScheme!.description!)).toBeInTheDocument();
  });

  it('calls applyColorScheme with selected scheme', () => {
    render(<ColorSchemeDialog {...defaultProps} />);

    const select = screen.getByTestId('scheme-select');
    fireEvent.change(select, { target: { value: 'modern' } });

    fireEvent.click(screen.getByText('Apply Scheme'));

    const modernScheme = COLOR_SCHEMES.find(s => s.id === 'modern');
    expect(mockApplyColorScheme).toHaveBeenCalledWith(modernScheme);
    expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
  });
});
