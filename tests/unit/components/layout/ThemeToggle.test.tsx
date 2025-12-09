import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { useTheme } from '@/hooks/useTheme';
import '@testing-library/jest-dom';

// Mock the hook
jest.mock('@/hooks/useTheme', () => ({
  useTheme: jest.fn(),
}));

// Mock DropdownMenu components to avoid Radix UI complexity in unit tests
jest.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuItem: ({ children, onClick }: { children: React.ReactNode; onClick: () => void }) => (
    <button onClick={onClick}>{children}</button>
  ),
}));

describe('ThemeToggle', () => {
  const mockSetTheme = jest.fn();

  beforeEach(() => {
    (useTheme as jest.Mock).mockReturnValue({
      setTheme: mockSetTheme,
    });
    mockSetTheme.mockClear();
  });

  it('renders correctly', () => {
    render(<ThemeToggle />);
    // Select the trigger button which has "Toggle theme" screen reader text
    const button = screen.getByRole('button', { name: /toggle theme/i });
    expect(button).toBeInTheDocument();
  });

  it('opens menu and changes theme to light', () => {
    render(<ThemeToggle />);

    // With our mock, the items are always visible
    const lightOption = screen.getByText('Light');
    fireEvent.click(lightOption);

    expect(mockSetTheme).toHaveBeenCalledWith('light');
  });

  it('changes theme to dark', () => {
    render(<ThemeToggle />);

    const darkOption = screen.getByText('Dark');
    fireEvent.click(darkOption);

    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  it('changes theme to system', () => {
    render(<ThemeToggle />);

    const systemOption = screen.getByText('System');
    fireEvent.click(systemOption);

    expect(mockSetTheme).toHaveBeenCalledWith('system');
  });
});
