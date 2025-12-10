import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeToggle } from '../../../../src/components/layout/ThemeToggle';
import { useTheme } from '../../../../src/hooks/useTheme';

// Mock useTheme
jest.mock('../../../../src/hooks/useTheme');

// Radix UI often uses ResizeObserver which isn't in jsdom
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = ResizeObserver;

// Also might need hasPointerCapture for some interactions
window.HTMLElement.prototype.hasPointerCapture = jest.fn();
window.HTMLElement.prototype.setPointerCapture = jest.fn();
window.HTMLElement.prototype.releasePointerCapture = jest.fn();


describe('ThemeToggle', () => {
  const mockSetTheme = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useTheme as jest.Mock).mockReturnValue({
      theme: 'system',
      setTheme: mockSetTheme,
    });
  });

  it('renders the toggle button', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button', { name: /toggle theme/i });
    expect(button).toBeInTheDocument();
  });

  it('opens dropdown menu on click', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);
    const button = screen.getByRole('button', { name: /toggle theme/i });

    await user.click(button);

    // Radix Dropdown Content usually appears in a portal.
    // We can look for the items.
    expect(await screen.findByRole('menuitem', { name: /light/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /dark/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /system/i })).toBeInTheDocument();
  });

  it('calls setTheme with "light" when Light option is clicked', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(screen.getByRole('button', { name: /toggle theme/i }));

    const lightOption = await screen.findByRole('menuitem', { name: /light/i });
    await user.click(lightOption);

    expect(mockSetTheme).toHaveBeenCalledWith('light');
  });

  it('calls setTheme with "dark" when Dark option is clicked', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(screen.getByRole('button', { name: /toggle theme/i }));

    const darkOption = await screen.findByRole('menuitem', { name: /dark/i });
    await user.click(darkOption);

    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  it('calls setTheme with "system" when System option is clicked', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(screen.getByRole('button', { name: /toggle theme/i }));

    const systemOption = await screen.findByRole('menuitem', { name: /system/i });
    await user.click(systemOption);

    expect(mockSetTheme).toHaveBeenCalledWith('system');
  });

  it('shows checkmark for current theme', async () => {
    (useTheme as jest.Mock).mockReturnValue({
      theme: 'dark',
      setTheme: mockSetTheme,
    });

    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(screen.getByRole('button', { name: /toggle theme/i }));

    // Find the item containing "Dark"
    const darkItem = await screen.findByRole('menuitem', { name: /dark/i });
    expect(darkItem).toHaveTextContent('✓');

    // Light shouldn't have checkmark
    const lightItem = await screen.findByRole('menuitem', { name: /light/i });
    expect(lightItem).not.toHaveTextContent('✓');
  });
});
