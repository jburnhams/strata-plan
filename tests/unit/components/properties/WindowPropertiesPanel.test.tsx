import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { WindowPropertiesPanel } from '../../../../src/components/properties/WindowPropertiesPanel';
import { useFloorplanStore } from '../../../../src/stores/floorplanStore';
import { Window } from '../../../../src/types';

describe('WindowPropertiesPanel', () => {
  const mockWindow: Window = {
    id: 'win-1',
    wallId: 'wall-1',
    width: 1.2,
    height: 1.5,
    offset: 2.0,
    sillHeight: 0.9,
    frameType: 'single',
    material: 'pvc'
  };

  const setupStore = (windowObj: Window | null = mockWindow) => {
    useFloorplanStore.setState({
      currentFloorplan: {
        id: 'fp-1',
        name: 'Test Plan',
        units: 'meters',
        rooms: [],
        walls: [],
        doors: [],
        windows: windowObj ? [windowObj] : [],
        connections: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0.0',
      },
      selectedWindowId: windowObj ? windowObj.id : null,
    });
  };

  beforeEach(() => {
    setupStore();
  });

  it('renders nothing if no window selected', () => {
    setupStore(null);
    const { container } = render(<WindowPropertiesPanel />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders window properties when window selected', () => {
    render(<WindowPropertiesPanel />);
    expect(screen.getByText('Window Properties')).toBeInTheDocument();
    expect(screen.getByLabelText(/^Width/)).toHaveValue(1.2);
    expect(screen.getByLabelText(/^Height/)).toHaveValue(1.5);
    expect(screen.getByLabelText(/Sill/)).toHaveValue(0.9);
  });

  it('updates width when input changes', () => {
    render(<WindowPropertiesPanel />);
    const input = screen.getByLabelText(/Width/);
    fireEvent.change(input, { target: { value: '1.8' } });

    const updated = useFloorplanStore.getState().getWindowById(mockWindow.id);
    expect(updated?.width).toBe(1.8);
  });

  it('updates sill height when input changes', () => {
    render(<WindowPropertiesPanel />);
    const input = screen.getByLabelText(/Sill/);
    fireEvent.change(input, { target: { value: '0.5' } });

    const updated = useFloorplanStore.getState().getWindowById(mockWindow.id);
    expect(updated?.sillHeight).toBe(0.5);
  });

  it('does not update for invalid input', () => {
      render(<WindowPropertiesPanel />);
      const input = screen.getByLabelText(/Width/);
      fireEvent.change(input, { target: { value: 'NaN' } });

      const updated = useFloorplanStore.getState().getWindowById(mockWindow.id);
      expect(updated?.width).toBe(1.2);
  });

  it('deletes window on button click and confirm', () => {
      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
      render(<WindowPropertiesPanel />);

      const deleteBtn = screen.getByText('Delete Window');
      fireEvent.click(deleteBtn);

      expect(confirmSpy).toHaveBeenCalled();
      const updated = useFloorplanStore.getState().getWindowById(mockWindow.id);
      expect(updated).toBeUndefined();

      confirmSpy.mockRestore();
  });
});
