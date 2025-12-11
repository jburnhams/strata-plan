import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useFloorplanStore } from '../../src/stores/floorplanStore';
import { useUIStore } from '../../src/stores/uiStore';
import { CanvasViewport } from '../../src/components/editor/CanvasViewport';

// We need to mock things that don't work in JSDOM or are complex
jest.mock('../../src/components/viewer/Viewer3D', () => ({
  Viewer3D: () => <div data-testid="viewer-3d">Viewer 3D</div>
}));

// Mock ResizeObserver
// We need it to actually trigger the callback to update dimensions in CanvasViewport
let resizeCallback: ResizeObserverCallback | null = null;

global.ResizeObserver = class ResizeObserver {
  constructor(callback: ResizeObserverCallback) {
    resizeCallback = callback;
  }
  observe(target: Element) {
      // Simulate initial resize immediately
      if (resizeCallback) {
          // Wrap in act because it updates state
          act(() => {
             resizeCallback!([{
                 target,
                 contentRect: { width: 1000, height: 800 } as DOMRectReadOnly
             } as ResizeObserverEntry], this);
          });
      }
  }
  unobserve() {}
  disconnect() {}
};

// Mock Canvas context for Rulers
HTMLCanvasElement.prototype.getContext = jest.fn(() => {
    return {
        translate: jest.fn(),
        scale: jest.fn(),
        clearRect: jest.fn(),
        beginPath: jest.fn(),
        moveTo: jest.fn(),
        lineTo: jest.fn(),
        stroke: jest.fn(),
        fillText: jest.fn(),
        measureText: jest.fn(() => ({ width: 0 })),
        setLineDash: jest.fn(),
        restore: jest.fn(),
        save: jest.fn(),
        strokeRect: jest.fn(),
        fillRect: jest.fn(),
    } as unknown as CanvasRenderingContext2D;
});

// Integration test for Canvas Editor
describe('Canvas Editor Integration', () => {
    beforeEach(() => {
        // Reset stores
        useFloorplanStore.setState({
            currentFloorplan: {
                id: 'integration-test',
                name: 'Integration Test',
                units: 'meters',
                rooms: [],
                connections: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            selectedRoomIds: [],
        });
        useUIStore.setState({
            mode: 'canvas',
            zoomLevel: 1.0,
            showGrid: true,
            panOffset: { x: 0, y: 0 }
        });

        // Mock getBoundingClientRect for the container
        Element.prototype.getBoundingClientRect = jest.fn(() => {
            return {
                width: 1000,
                height: 800,
                top: 0,
                left: 0,
                bottom: 800,
                right: 1000,
                x: 0,
                y: 0,
                toJSON: () => {}
            };
        });
    });

    it('allows resizing a room via handle drag', async () => {
        // 1. Setup: Add a room
        act(() => {
            useFloorplanStore.getState().addRoom({
                name: 'Resize Me',
                length: 5, width: 4, height: 3, type: 'living',
                position: { x: 0, z: 0 }, rotation: 0
            });
        });

        // Select it
        const room = useFloorplanStore.getState().currentFloorplan!.rooms[0];
        act(() => {
            useFloorplanStore.getState().selectRoom(room.id);
        });

        // 2. Render Canvas Viewport
        // CanvasViewport creates SelectionOverlay which uses useRoomResize
        // But SelectionOverlay is NOT a child of CanvasViewport in the main App structure usually.
        // Wait, CanvasViewport accepts children.
        // In App.tsx or Canvas2D.tsx, SelectionOverlay is rendered inside CanvasViewport?
        // Let's check Canvas2D.tsx structure.

        // But here we are just rendering CanvasViewport.
        // We need to pass the children that are normally inside it (Grid, RoomLayer, SelectionOverlay).
        // Let's import them.
        const { SelectionOverlay } = await import('../../src/components/editor/SelectionOverlay');
        const { RoomLayer } = await import('../../src/components/editor/RoomLayer');
        const { Grid } = await import('../../src/components/editor/Grid');

        render(
            <CanvasViewport>
                <Grid />
                <RoomLayer />
                <SelectionOverlay />
            </CanvasViewport>
        );

        // 3. Find Handle
        const seHandle = await screen.findByTestId(`handle-se-${room.id}`);
        expect(seHandle).toBeInTheDocument();

        // 4. Perform Drag
        act(() => {
            const downEvent = new MouseEvent('mousedown', {
                bubbles: true, cancelable: true,
                clientX: 250, clientY: 200,
            });
            Object.defineProperty(downEvent, 'button', { value: 0 });
            seHandle.dispatchEvent(downEvent);
        });

        // Move Mouse
        // 50px right, 50px down. At 50px/m, this is +1m to length and width
        act(() => {
             const moveEvent = new MouseEvent('mousemove', {
                bubbles: true, cancelable: true,
                clientX: 300, clientY: 250 // +50, +50
             });
             document.dispatchEvent(moveEvent);
        });

        // End Drag
        act(() => {
            const upEvent = new MouseEvent('mouseup', {
               bubbles: true, cancelable: true
            });
            document.dispatchEvent(upEvent);
        });

        // 5. Verify Store Update
        const updatedRoom = useFloorplanStore.getState().currentFloorplan!.rooms[0];

        // Initial: 5x4. Delta: +1x+1. Expected: 6x5.
        // Delta = 50/50 = 1.0 meter.

        expect(updatedRoom.length).toBeCloseTo(6.0);
        expect(updatedRoom.width).toBeCloseTo(5.0);
    });

    it('renders the full Canvas2D interface with toolbar', async () => {
         const { Canvas2D } = await import('../../src/components/editor/Canvas2D');

         render(<Canvas2D />);

         expect(screen.getByTestId('editor-toolbar')).toBeInTheDocument();
         expect(screen.getByTestId('canvas-viewport')).toBeInTheDocument();
         // Check a specific tool button
         expect(screen.getByTestId('tool-select')).toBeInTheDocument();
    });

    it('opens properties panel on double click', async () => {
        // Setup room
        act(() => {
            useFloorplanStore.getState().addRoom({
                name: 'Click Me',
                length: 5, width: 4, height: 3, type: 'living',
                position: { x: 0, z: 0 }, rotation: 0
            });
        });
        const room = useFloorplanStore.getState().currentFloorplan!.rooms[0];

        // Ensure closed
        act(() => {
            useUIStore.setState({ propertiesPanelOpen: false, focusProperty: null });
        });

        const { RoomLayer } = await import('../../src/components/editor/RoomLayer');
        const { Grid } = await import('../../src/components/editor/Grid');

        render(
            <CanvasViewport>
                <Grid />
                <RoomLayer />
            </CanvasViewport>
        );

        // Double click room
        const roomShape = await screen.findByTestId(`room-shape-${room.id}`);
        act(() => {
             const dblClickEvent = new MouseEvent('dblclick', {
                bubbles: true, cancelable: true,
             });
             roomShape.dispatchEvent(dblClickEvent);
        });

        // Verify store
        expect(useUIStore.getState().propertiesPanelOpen).toBe(true);
        expect(useUIStore.getState().focusProperty).toBe('room-name');
        expect(useFloorplanStore.getState().selectedRoomId).toBe(room.id);
    });
});
