import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { WallPropertiesPanel } from '../../../../src/components/properties/WallPropertiesPanel';
import { useFloorplanStore } from '../../../../src/stores/floorplanStore';
import { Wall } from '../../../../src/types';

// Mock Slider
jest.mock('../../../../src/components/ui/slider', () => ({
  Slider: ({ value, onValueChange, min, max, step }: any) => (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value[0]}
      onChange={(e) => onValueChange([parseFloat(e.target.value)])}
      data-testid="wall-thickness-slider"
      aria-label="Thickness"
    />
  ),
}));

describe('WallPropertiesPanel', () => {
  const mockWall: Wall = {
    id: 'wall-1',
    from: { x: 0, z: 0 },
    to: { x: 5, z: 0 },
    thickness: 0.2,
  };

  const setupStore = (wall: Wall | null = mockWall) => {
    useFloorplanStore.setState({
      currentFloorplan: {
        id: 'fp-1',
        name: 'Test Plan',
        units: 'meters',
        rooms: [],
        walls: wall ? [wall] : [],
        doors: [],
        windows: [],
        connections: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0.0',
      },
      selectedWallId: wall ? wall.id : null,
    });
  };

  beforeEach(() => {
    setupStore();
  });

  it('renders nothing if no wall selected', () => {
    setupStore(null);
    const { container } = render(<WallPropertiesPanel />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders wall properties when wall selected', () => {
    render(<WallPropertiesPanel />);
    expect(screen.getByText('Wall Properties')).toBeInTheDocument();
    // Length is 5
    expect(screen.getByText('5.00')).toBeInTheDocument();
    // Thickness is 0.20
    expect(screen.getByText('0.20')).toBeInTheDocument();
  });

  it('updates thickness when slider changes', () => {
    render(<WallPropertiesPanel />);
    const slider = screen.getByTestId('wall-thickness-slider');
    fireEvent.change(slider, { target: { value: '0.3' } });

    const updated = useFloorplanStore.getState().getWallById(mockWall.id);
    expect(updated?.thickness).toBe(0.3);
  });

  it('deletes wall on button click and confirm', () => {
      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
      render(<WallPropertiesPanel />);

      const deleteBtn = screen.getByText('Delete Wall');
      fireEvent.click(deleteBtn);

      expect(confirmSpy).toHaveBeenCalled();
      const updated = useFloorplanStore.getState().getWallById(mockWall.id);
      expect(updated).toBeUndefined();

      confirmSpy.mockRestore();
  });
});
