import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DoorPropertiesPanel } from '@/components/properties/DoorPropertiesPanel';
import { useFloorplanStore } from '@/stores/floorplanStore';
import { Door } from '@/types/door';

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

describe('DoorPropertiesPanel', () => {
  const mockUpdateDoor = jest.fn();
  const mockDeleteDoor = jest.fn();
  const mockGetDoorById = jest.fn();

  const mockDoor: Door = {
    id: 'door-1',
    roomId: 'room-1',
    wallSide: 'north',
    position: 0.5,
    width: 0.9,
    height: 2.1,
    type: 'single',
    swing: 'inward',
    handleSide: 'left',
    isExterior: false,
  };

  const mockFloorplan = {
    units: 'meters',
    rooms: [
      { id: 'room-1', name: 'Living Room' },
      { id: 'room-2', name: 'Kitchen' },
    ],
    connections: [
      { id: 'conn-1', room1Id: 'room-1', room2Id: 'room-2' },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useFloorplanStore as unknown as jest.Mock).mockImplementation((selector: any) => {
      const state = {
        selectedDoorId: 'door-1',
        getDoorById: mockGetDoorById,
        updateDoor: mockUpdateDoor,
        deleteDoor: mockDeleteDoor,
        currentFloorplan: mockFloorplan,
      };
      return selector(state);
    });
    mockGetDoorById.mockReturnValue(mockDoor);
  });

  it('renders nothing when no door is selected', () => {
    mockGetDoorById.mockReturnValue(undefined);
    const { container } = render(<DoorPropertiesPanel />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders door properties when a door is selected', () => {
    render(<DoorPropertiesPanel />);
    expect(screen.getByTestId('door-properties-panel')).toBeInTheDocument();
  });

  it('displays room and wall info', () => {
    render(<DoorPropertiesPanel />);
    expect(screen.getByText(/Living Room/)).toBeInTheDocument();
    expect(screen.getByText(/North Wall/)).toBeInTheDocument();
  });

  it('displays connected room info for interior doors', () => {
    mockGetDoorById.mockReturnValue({
      ...mockDoor,
      connectionId: 'conn-1',
      isExterior: false,
    });
    render(<DoorPropertiesPanel />);
    expect(screen.getByText('Connects to:')).toBeInTheDocument();
    expect(screen.getByText('Kitchen')).toBeInTheDocument();
  });

  it('updates door position via slider', () => {
    render(<DoorPropertiesPanel />);
    const slider = screen.getByTestId('mock-slider');
    fireEvent.change(slider, { target: { value: '0.7' } });
    expect(mockUpdateDoor).toHaveBeenCalledWith('door-1', { position: 0.7 });
  });

  it('renders door swing preview', () => {
    render(<DoorPropertiesPanel />);
    expect(screen.getByTestId('door-swing-preview')).toBeInTheDocument();
  });

  it('updates door width', () => {
    render(<DoorPropertiesPanel />);
    const widthInput = screen.getByLabelText(/Width/);
    fireEvent.change(widthInput, { target: { value: '1.2' } });
    expect(mockUpdateDoor).toHaveBeenCalledWith('door-1', { width: 1.2 });
  });

  it('calls delete door when delete button is clicked', () => {
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
    render(<DoorPropertiesPanel />);
    const deleteButton = screen.getByText('Delete Door');
    fireEvent.click(deleteButton);
    expect(confirmSpy).toHaveBeenCalled();
    expect(mockDeleteDoor).toHaveBeenCalledWith('door-1');
    confirmSpy.mockRestore();
  });
});
