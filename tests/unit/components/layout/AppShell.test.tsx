import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppShell } from '../../../../src/components/layout/AppShell';
import { useUIStore } from '../../../../src/stores/uiStore';

// Mock the child components to simplify testing
jest.mock('../../../../src/components/layout/TopToolbar', () => ({
  TopToolbar: () => <div data-testid="top-toolbar">TopToolbar</div>,
}));
jest.mock('../../../../src/components/layout/LeftSidebar', () => ({
  LeftSidebar: () => <div data-testid="left-sidebar">LeftSidebar</div>,
}));
jest.mock('../../../../src/components/layout/PropertiesPanel', () => ({
  PropertiesPanel: () => <div data-testid="properties-panel">PropertiesPanel</div>,
}));
jest.mock('../../../../src/components/layout/StatusBar', () => ({
  StatusBar: () => <div data-testid="status-bar">StatusBar</div>,
}));

describe('AppShell', () => {
  const initialState = useUIStore.getState();

  beforeEach(() => {
    useUIStore.setState(initialState, true);
    // Mock toggle functions
    jest.spyOn(useUIStore.getState(), 'toggleSidebar');
    jest.spyOn(useUIStore.getState(), 'togglePropertiesPanel');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders all layout sections', () => {
    render(
      <AppShell>
        <div data-testid="child-content">Child Content</div>
      </AppShell>
    );

    expect(screen.getByTestId('top-toolbar')).toBeInTheDocument();
    expect(screen.getByTestId('left-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('properties-panel')).toBeInTheDocument();
    expect(screen.getByTestId('status-bar')).toBeInTheDocument();
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });

  it('toggles sidebar on "[" key press', () => {
    render(<AppShell />);

    fireEvent.keyDown(window, { key: '[' });

    expect(useUIStore.getState().toggleSidebar).toHaveBeenCalled();
  });

  it('toggles properties panel on "]" key press', () => {
    render(<AppShell />);

    fireEvent.keyDown(window, { key: ']' });

    expect(useUIStore.getState().togglePropertiesPanel).toHaveBeenCalled();
  });

  it('does not toggle sidebar when typing in input', () => {
    render(
      <AppShell>
        <input data-testid="test-input" />
      </AppShell>
    );

    const input = screen.getByTestId('test-input');
    fireEvent.keyDown(input, { key: '[' });

    expect(useUIStore.getState().toggleSidebar).not.toHaveBeenCalled();
  });
});
