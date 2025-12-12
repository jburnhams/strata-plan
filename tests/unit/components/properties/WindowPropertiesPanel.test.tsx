import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { WindowPropertiesPanel } from '@/components/properties/WindowPropertiesPanel';
import { useFloorplanStore } from '@/stores/floorplanStore';
import { Window } from '@/types/window';

// Mock the store
jest.mock('@/stores/floorplanStore');

// Mock UI components
jest.mock('@/components/ui/select', () => ({
  Select: ({ children, onValueChange, value }: any) => (
    <div data-testid="mock-select" data-value={value} onClick={() => onValueChange && onValueChange('double')}>
      {children}
    </div>
  ),
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: () => <div>Select Value</div>,
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children, value, onClick }: any) => (
    <div data-testid={`select-item-${value}`} onClick={onClick}>
      {children}
    </div>
  ),
}));

jest.mock('@/components/ui/slider', () => ({
  Slider: ({ value, onValueChange, max, step }: any) => (
    <input
      data-testid="mock-slider"
      type="range"
      value={value[0]}
      max={max}
      step={step}
      onChange={(e) => onValueChange([parseFloat(e.target.value)])}
    />
  ),
}));

describe('WindowPropertiesPanel', () => {
  const mockUpdateWindow = jest.fn();
  const mockDeleteWindow = jest.fn();
  const mockGetWindowById = jest.fn();

  const mockWindow: Window = {
    id: 'window-1',
    roomId: 'room-1',
    wallSide: 'north',
    position: 0.5,
    width: 1.2,
    height: 1.2,
    sillHeight: 0.9,
    frameType: 'single',
    material: 'pvc',
    openingType: 'fixed',
  };

  const mockFloorplan = {
    units: 'meters',
    rooms: [
      { id: 'room-1', name: 'Master Bedroom' },
    ],
    connections: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useFloorplanStore as unknown as jest.Mock).mockImplementation((selector: any) => {
      const state = {
        selectedWindowId: 'window-1',
        getWindowById: mockGetWindowById,
        updateWindow: mockUpdateWindow,
        deleteWindow: mockDeleteWindow,
        currentFloorplan: mockFloorplan,
      };
      return selector(state);
    });
    mockGetWindowById.mockReturnValue(mockWindow);
  });

  it('renders nothing when no window is selected', () => {
    mockGetWindowById.mockReturnValue(undefined);
    const { container } = render(<WindowPropertiesPanel />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders window properties when a window is selected', () => {
    render(<WindowPropertiesPanel />);
    expect(screen.getByTestId('window-properties-panel')).toBeInTheDocument();
  });

  it('displays room and wall info', () => {
    render(<WindowPropertiesPanel />);
    expect(screen.getByText(/Master Bedroom/)).toBeInTheDocument();
    expect(screen.getByText(/North Wall/)).toBeInTheDocument();
  });

  it('updates window position via slider', () => {
    render(<WindowPropertiesPanel />);
    const slider = screen.getByTestId('mock-slider');
    fireEvent.change(slider, { target: { value: '0.8' } });
    expect(mockUpdateWindow).toHaveBeenCalledWith('window-1', { position: 0.8 });
  });

  it('updates window width', () => {
    render(<WindowPropertiesPanel />);
    const widthInput = screen.getByLabelText(/Width/);
    fireEvent.change(widthInput, { target: { value: '1.5' } });
    expect(mockUpdateWindow).toHaveBeenCalledWith('window-1', { width: 1.5 });
  });

  it('calls delete window when delete button is clicked', () => {
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
    render(<WindowPropertiesPanel />);
    const deleteButton = screen.getByText('Delete Window');
    fireEvent.click(deleteButton);
    expect(confirmSpy).toHaveBeenCalled();
    expect(mockDeleteWindow).toHaveBeenCalledWith('window-1');
    confirmSpy.mockRestore();
  });
});
