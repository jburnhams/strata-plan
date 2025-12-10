import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PropertiesPanel } from '../../../../src/components/layout/PropertiesPanel';
import { useUIStore } from '../../../../src/stores/uiStore';

// Mock icons
jest.mock('lucide-react', () => ({
  ChevronRight: () => <div data-testid="chevron-right" />,
  Settings2: () => <div data-testid="settings-icon" />,
}));

describe('PropertiesPanel', () => {
  const initialState = useUIStore.getState();

  beforeEach(() => {
    useUIStore.setState(initialState, true);
  });

  it('renders visible by default', () => {
    render(<PropertiesPanel />);
    const panel = screen.getByTestId('properties-panel');

    expect(panel).toBeInTheDocument();
    expect(screen.getByText('Properties')).toBeInTheDocument();
    expect(screen.getByText('Select an item')).toBeInTheDocument();
  });

  it('does not render when propertiesPanelOpen is false', () => {
    useUIStore.setState({ propertiesPanelOpen: false });
    render(<PropertiesPanel />);

    expect(screen.queryByTestId('properties-panel')).not.toBeInTheDocument();
  });

  it('toggles state when close button is clicked', () => {
    render(<PropertiesPanel />);

    const closeButton = screen.getByLabelText('Close properties panel');
    fireEvent.click(closeButton);

    expect(useUIStore.getState().propertiesPanelOpen).toBe(false);
  });
});
