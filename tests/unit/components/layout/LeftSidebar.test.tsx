import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LeftSidebar } from '../../../../src/components/layout/LeftSidebar';
import { useUIStore } from '../../../../src/stores/uiStore';

// Mock the Lucide icons to avoid rendering issues
jest.mock('lucide-react', () => ({
  ChevronLeft: () => <div data-testid="chevron-left" />,
  ChevronRight: () => <div data-testid="chevron-right" />,
  LayoutDashboard: () => <div data-testid="layout-dashboard" />,
}));

describe('LeftSidebar', () => {
  const initialState = useUIStore.getState();

  beforeEach(() => {
    useUIStore.setState(initialState, true);
    jest.clearAllMocks();
  });

  it('renders expanded by default', () => {
    render(<LeftSidebar />);
    const sidebar = screen.getByTestId('left-sidebar');

    // Check for expanded width class
    expect(sidebar).toHaveClass('w-[280px]');

    // Check for expanded content
    expect(screen.getByText('Navigation')).toBeInTheDocument();
    expect(screen.getByLabelText('Collapse sidebar')).toBeInTheDocument();
  });

  it('renders collapsed when sidebarOpen is false', () => {
    useUIStore.setState({ sidebarOpen: false });
    render(<LeftSidebar />);
    const sidebar = screen.getByTestId('left-sidebar');

    // Check for collapsed width class
    expect(sidebar).toHaveClass('w-[48px]');

    // Check for collapsed content
    expect(screen.queryByText('Navigation')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Expand sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('layout-dashboard')).toBeInTheDocument();
  });

  it('toggles state when button is clicked', () => {
    render(<LeftSidebar />);

    const toggleButton = screen.getByLabelText('Collapse sidebar');
    fireEvent.click(toggleButton);

    expect(useUIStore.getState().sidebarOpen).toBe(false);

    // Re-render or check updated state if component re-renders (it should)
    // Note: In a real DOM, we'd check the class update, but here we check store first.
    // To check re-render, we might need to rely on the fact that the component is subscribed.
  });
});
