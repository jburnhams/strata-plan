import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PropertiesPanel } from '@/components/layout/PropertiesPanel';
import { useUIStore } from '@/stores/uiStore';
import { useFloorplanStore } from '@/stores/floorplanStore';

// Mock stores
jest.mock('@/stores/uiStore');
jest.mock('@/stores/floorplanStore');
jest.mock('@/components/properties/NoSelectionPanel', () => ({
  NoSelectionPanel: () => <div data-testid="no-selection-panel">No Selection Panel</div>
}));

describe('PropertiesPanel', () => {
  const mockTogglePropertiesPanel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useUIStore as unknown as jest.Mock).mockImplementation(() => ({
      propertiesPanelOpen: true,
      togglePropertiesPanel: mockTogglePropertiesPanel
    }));

    // Default: no selection
    (useFloorplanStore as unknown as jest.Mock).mockImplementation(() => ({
      selectedRoomIds: [],
      selectedWallId: null,
      selectedDoorId: null,
      selectedWindowId: null
    }));
  });

  it('renders NoSelectionPanel when no selection', () => {
    render(<PropertiesPanel />);
    expect(screen.getByText('Properties')).toBeInTheDocument();
    expect(screen.getByTestId('no-selection-panel')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    (useUIStore as unknown as jest.Mock).mockImplementation(() => ({
      propertiesPanelOpen: false,
      togglePropertiesPanel: mockTogglePropertiesPanel
    }));

    const { container } = render(<PropertiesPanel />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders Room Properties when a room is selected', () => {
    (useFloorplanStore as unknown as jest.Mock).mockImplementation(() => ({
      selectedRoomIds: ['room-1'],
      selectedWallId: null,
      selectedDoorId: null,
      selectedWindowId: null
    }));

    render(<PropertiesPanel />);
    expect(screen.getByText('Room Properties')).toBeInTheDocument();
  });

  it('renders Multiple Selection when multiple rooms selected', () => {
    (useFloorplanStore as unknown as jest.Mock).mockImplementation(() => ({
      selectedRoomIds: ['room-1', 'room-2'],
      selectedWallId: null,
      selectedDoorId: null,
      selectedWindowId: null
    }));

    render(<PropertiesPanel />);
    expect(screen.getByText('Multiple Selection')).toBeInTheDocument();
  });

  it('calls togglePropertiesPanel when close button clicked', () => {
    render(<PropertiesPanel />);
    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);
    expect(mockTogglePropertiesPanel).toHaveBeenCalled();
  });
});
