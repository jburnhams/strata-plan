import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TopToolbar } from '@/components/layout/TopToolbar';
import { useUIStore } from '@/stores/uiStore';
import { useFloorplanStore } from '@/stores/floorplanStore';
import '@testing-library/jest-dom';

// Mock ThemeToggle
jest.mock('@/components/layout/ThemeToggle', () => ({
  ThemeToggle: () => <div data-testid="theme-toggle">ThemeToggle</div>
}));

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock PointerEvent for Radix UI
// @ts-ignore
window.PointerEvent = class PointerEvent extends Event {
  button: number;
  ctrlKey: boolean;
  metaKey: boolean;

  constructor(type: string, props: PointerEventInit = {}) {
    super(type, props);
    this.button = props.button || 0;
    this.ctrlKey = props.ctrlKey || false;
    this.metaKey = props.metaKey || false;
  }
} as any;

window.HTMLElement.prototype.scrollIntoView = jest.fn();
window.HTMLElement.prototype.releasePointerCapture = jest.fn();
window.HTMLElement.prototype.hasPointerCapture = jest.fn();

describe('TopToolbar', () => {
  const originalUIState = useUIStore.getState();
  const originalFloorplanState = useFloorplanStore.getState();

  beforeEach(() => {
    useUIStore.setState(originalUIState, true);
    useFloorplanStore.setState(originalFloorplanState, true);
  });

  it('renders the toolbar structure', () => {
    render(<TopToolbar />);
    expect(screen.getByTestId('top-toolbar')).toBeInTheDocument();
    expect(screen.getByText('StrataPlan')).toBeInTheDocument();
    expect(screen.getByText('File')).toBeInTheDocument();
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('View')).toBeInTheDocument();
    expect(screen.getByText('View 3D')).toBeInTheDocument();
    expect(screen.getByText('Export')).toBeInTheDocument();
    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
  });

  it('toggles grid setting from View menu', async () => {
    const user = userEvent.setup();
    render(<TopToolbar />);

    // Open View menu
    const viewButton = screen.getByText('View');
    await user.click(viewButton);

    // Wait for menu to open
    await waitFor(() => {
        expect(screen.getByText('Toggle Grid')).toBeInTheDocument();
    });

    // Check initial state
    expect(useUIStore.getState().showGrid).toBe(true);

    // Click toggle
    const toggleGridItem = screen.getByText('Toggle Grid');
    await user.click(toggleGridItem);

    // Verify state change
    expect(useUIStore.getState().showGrid).toBe(false);
  });

  it('updates zoom level from View menu', async () => {
    const user = userEvent.setup();
    render(<TopToolbar />);

    const viewButton = screen.getByText('View');
    await user.click(viewButton);

    await waitFor(() => {
        expect(screen.getByText('Zoom In')).toBeInTheDocument();
    });

    const initialZoom = useUIStore.getState().zoomLevel;

    const zoomInItem = screen.getByText('Zoom In');
    await user.click(zoomInItem);

    expect(useUIStore.getState().zoomLevel).toBeGreaterThan(initialZoom);
  });

  it('shows disabled Undo/Redo in Edit menu by default', async () => {
    const user = userEvent.setup();
    render(<TopToolbar />);

    const editButton = screen.getByText('Edit');
    await user.click(editButton);

    await waitFor(() => {
        expect(screen.getByText('Undo')).toBeInTheDocument();
    });

    const undoItem = screen.getByText('Undo').closest('[role="menuitem"]');
    expect(undoItem).toHaveAttribute('data-disabled');

    const redoItem = screen.getByText('Redo').closest('[role="menuitem"]');
    expect(redoItem).toHaveAttribute('data-disabled');
  });

  it('enables Save in File menu when dirty', async () => {
    const user = userEvent.setup();
    // Set dirty state
    useFloorplanStore.setState({ isDirty: true });

    render(<TopToolbar />);

    const fileButton = screen.getByText('File');
    await user.click(fileButton);

    await waitFor(() => {
        expect(screen.getByText('Save')).toBeInTheDocument();
    });

    const saveItem = screen.getByText('Save').closest('[role="menuitem"]');
    expect(saveItem).not.toHaveAttribute('data-disabled');
  });

  it('disables Save in File menu when clean', async () => {
    const user = userEvent.setup();
    // Set clean state
    useFloorplanStore.setState({ isDirty: false });

    render(<TopToolbar />);

    const fileButton = screen.getByText('File');
    await user.click(fileButton);

    await waitFor(() => {
        expect(screen.getByText('Save')).toBeInTheDocument();
    });

    const saveItem = screen.getByText('Save').closest('[role="menuitem"]');
    expect(saveItem).toHaveAttribute('data-disabled');
  });
});
