import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppShell } from '@/components/layout/AppShell';
import { useUIStore } from '@/stores/uiStore';
import '@testing-library/jest-dom';

// Mock child components to simplify testing structure
jest.mock('@/components/layout/TopToolbar', () => ({
  TopToolbar: () => <div data-testid="top-toolbar">TopToolbar</div>
}));
jest.mock('@/components/layout/StatusBar', () => ({
  StatusBar: () => <div data-testid="status-bar">StatusBar</div>
}));
// Mock Toaster
jest.mock('@/components/ui/toaster', () => ({
  Toaster: () => <div data-testid="toaster">Toaster</div>
}));

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('AppShell', () => {
  beforeEach(() => {
    useUIStore.setState({
        sidebarOpen: true,
        propertiesPanelOpen: true
    });
  });

  it('renders layout components', () => {
    render(<AppShell><div>Main Content</div></AppShell>);
    expect(screen.getByTestId('top-toolbar')).toBeInTheDocument();
    expect(screen.getByTestId('status-bar')).toBeInTheDocument();
    expect(screen.getByTestId('toaster')).toBeInTheDocument();
    expect(screen.getByText('Main Content')).toBeInTheDocument();
  });

  it('toggles sidebar on [ key', () => {
    render(<AppShell>Content</AppShell>);

    // Initial state check
    expect(useUIStore.getState().sidebarOpen).toBe(true);

    // Trigger keydown
    fireEvent.keyDown(window, { key: '[' });
    expect(useUIStore.getState().sidebarOpen).toBe(false);

    fireEvent.keyDown(window, { key: '[' });
    expect(useUIStore.getState().sidebarOpen).toBe(true);
  });

  it('toggles properties panel on ] key', () => {
    render(<AppShell>Content</AppShell>);

    expect(useUIStore.getState().propertiesPanelOpen).toBe(true);

    fireEvent.keyDown(window, { key: ']' });
    expect(useUIStore.getState().propertiesPanelOpen).toBe(false);
  });

  it('does not toggle when typing in input', () => {
    render(
      <AppShell>
        <input data-testid="input" />
      </AppShell>
    );

    const input = screen.getByTestId('input');
    input.focus();

    fireEvent.keyDown(input, { key: '[' });
    expect(useUIStore.getState().sidebarOpen).toBe(true); // Should remain true
  });
});
