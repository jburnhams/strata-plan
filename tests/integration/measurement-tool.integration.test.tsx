import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Canvas2D } from '../../src/components/editor/Canvas2D';
import { useToolStore } from '../../src/stores/toolStore';
import { useMeasurementStore } from '../../src/stores/measurementStore';
import { useUIStore } from '../../src/stores/uiStore';
import { useFloorplanStore } from '../../src/stores/floorplanStore';
import * as coordinates from '../../src/utils/coordinates';

// Mock dependencies
jest.mock('../../src/utils/coordinates', () => ({
  screenToWorld: jest.fn(),
  worldToScreen: jest.fn().mockReturnValue({ x: 0, y: 0 }),
}));

// Mock ResizeObserver for CanvasViewport
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('Measurement Tool Integration', () => {
  beforeEach(() => {
    // Reset stores
    useToolStore.setState({ activeTool: 'select' });
    useMeasurementStore.setState({ activeMeasurement: null, measurements: [] });
    useUIStore.setState({ zoomLevel: 1, panOffset: { x: 0, z: 0 }, showGrid: false });
    useFloorplanStore.setState({ currentFloorplan: {
        id: 'fp-1', name: 'Test', units: 'meters', rooms: [], connections: [], walls: [],
        createdAt: new Date(), updatedAt: new Date()
    }});

    // Setup mocks
    (coordinates.screenToWorld as jest.Mock).mockImplementation((x, y) => ({ x: x / 50, z: y / 50 })); // 50 pixels per meter
  });

  it('activates measurement tool and creates a measurement', async () => {
    render(<Canvas2D />);

    // Select measure tool
    const measureBtn = screen.getByLabelText(/Measure/i);
    fireEvent.click(measureBtn);

    expect(useToolStore.getState().activeTool).toBe('measure');

    // CanvasViewport has data-testid="canvas-viewport"
    const canvasViewport = screen.getByTestId('canvas-viewport');

    // Simulate First Click (0,0)
    (coordinates.screenToWorld as jest.Mock).mockReturnValueOnce({ x: 0, z: 0 });

    fireEvent.mouseDown(canvasViewport, { clientX: 0, clientY: 0 });

    // Verify active measurement started
    expect(useMeasurementStore.getState().activeMeasurement).toEqual({
        startPoint: { x: 0, z: 0 },
        endPoint: { x: 0, z: 0 },
        distance: 0
    });

    // Simulate Mouse Move (to 2m, 0m -> 100px, 0px)
    (coordinates.screenToWorld as jest.Mock).mockReturnValueOnce({ x: 2, z: 0 });

    fireEvent.mouseMove(document, { clientX: 100, clientY: 0 });

    expect(useMeasurementStore.getState().activeMeasurement).toEqual({
        startPoint: { x: 0, z: 0 },
        endPoint: { x: 2, z: 0 },
        distance: 2
    });

    // Simulate Second Click (finish)
    (coordinates.screenToWorld as jest.Mock).mockReturnValueOnce({ x: 2, z: 0 });

    fireEvent.mouseDown(canvasViewport, { clientX: 100, clientY: 0 });

    // Verify measurement saved
    const measurements = useMeasurementStore.getState().measurements;
    expect(measurements).toHaveLength(1);
    expect(measurements[0].distance).toBe(2);

    // Verify visual presence
    expect(screen.getByText('2.00 m')).toBeInTheDocument();
  });
});
