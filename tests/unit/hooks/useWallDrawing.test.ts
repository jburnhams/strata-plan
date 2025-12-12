import { renderHook, act } from '@testing-library/react';
import { useWallDrawing } from '../../../src/hooks/useWallDrawing';
import { useToolStore } from '../../../src/stores/toolStore';
import { useFloorplanStore } from '../../../src/stores/floorplanStore';
import { useUIStore } from '../../../src/stores/uiStore';
import { Position2D } from '../../../src/types';

describe('useWallDrawing', () => {
    const mockAddWall = jest.fn();

    beforeEach(() => {
        useToolStore.setState({ activeTool: 'select' });
        useUIStore.setState({
            zoomLevel: 1.0,
            panOffset: { x: 0, z: 0 },
            showGrid: false
        });

        useFloorplanStore.setState({
            currentFloorplan: {
                id: 'fp-1',
                name: 'Test',
                units: 'meters',
                rooms: [],
                walls: [],
                connections: [],
                doors: [],
                windows: [],
                createdAt: new Date(),
                updatedAt: new Date(),
                version: '1.0'
            },
            addWall: mockAddWall
        });

        jest.clearAllMocks();
    });

    it('initializes with isDrawing false', () => {
        const { result } = renderHook(() => useWallDrawing());
        expect(result.current.isDrawing).toBe(false);
    });

    it('does not start drawing if tool is not wall', () => {
        useToolStore.setState({ activeTool: 'select' });
        const { result } = renderHook(() => useWallDrawing());

        const event = {
            button: 0,
            clientX: 100,
            clientY: 100,
            currentTarget: {
                getBoundingClientRect: () => ({ left: 0, top: 0, width: 1000, height: 1000 })
            },
            preventDefault: jest.fn(),
            stopPropagation: jest.fn()
        } as unknown as React.MouseEvent;

        act(() => {
            result.current.handleMouseDown(event);
        });

        expect(result.current.isDrawing).toBe(false);
        expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it('starts drawing on mouse down if tool is wall', () => {
        useToolStore.setState({ activeTool: 'wall' });
        const { result } = renderHook(() => useWallDrawing());

        const event = {
            button: 0,
            clientX: 500, // Center of 1000x1000 viewport
            clientY: 500,
            currentTarget: {
                getBoundingClientRect: () => ({ left: 0, top: 0, width: 1000, height: 1000 })
            },
            preventDefault: jest.fn(),
            stopPropagation: jest.fn()
        } as unknown as React.MouseEvent;

        act(() => {
            result.current.handleMouseDown(event);
        });

        expect(result.current.isDrawing).toBe(true);
        // Center (500,500) corresponds to (0,0) in world if pan is (0,0) and viewport is centered at (0,0)?
        // Wait, screenToWorld logic:
        // x = (screenX - pan.x - (width / 2)) / scale
        // x = (500 - 0 - 500) / 50 = 0.
        // z = (500 - 0 - 500) / 50 = 0.
        expect(result.current.startPoint).toEqual({ x: 0, z: 0 });
        expect(event.preventDefault).toHaveBeenCalled();
    });

    it('updates current point on mouse move', () => {
        useToolStore.setState({ activeTool: 'wall' });
        const { result } = renderHook(() => useWallDrawing());

        // Start
        const startEvent = {
            button: 0,
            clientX: 500,
            clientY: 500,
            currentTarget: {
                getBoundingClientRect: () => ({ left: 0, top: 0, width: 1000, height: 1000 })
            },
            preventDefault: jest.fn(),
            stopPropagation: jest.fn()
        } as unknown as React.MouseEvent;

        act(() => {
            result.current.handleMouseDown(startEvent);
        });

        // Move 50px (1m)
        const moveEvent = new MouseEvent('mousemove', {
            clientX: 550,
            clientY: 550
        });

        act(() => {
            document.dispatchEvent(moveEvent);
        });

        // x = (550 - 500) / 50 = 1
        // z = (550 - 500) / 50 = 1
        expect(result.current.currentPoint).toEqual({ x: 1, z: 1 });
    });

    it('adds wall and continues drawing on second click', () => {
        useToolStore.setState({ activeTool: 'wall' });
        const { result } = renderHook(() => useWallDrawing());

        // Start
        const click1 = {
            button: 0,
            clientX: 500,
            clientY: 500,
            currentTarget: {
                getBoundingClientRect: () => ({ left: 0, top: 0, width: 1000, height: 1000 })
            },
            preventDefault: jest.fn(),
            stopPropagation: jest.fn()
        } as unknown as React.MouseEvent;

        act(() => {
            result.current.handleMouseDown(click1);
        });

        expect(result.current.isDrawing).toBe(true);

        // Click to finish first segment (1m away)
        const click2 = {
            button: 0,
            clientX: 550,
            clientY: 550,
            currentTarget: {
                getBoundingClientRect: () => ({ left: 0, top: 0, width: 1000, height: 1000 })
            },
            preventDefault: jest.fn(),
            stopPropagation: jest.fn()
        } as unknown as React.MouseEvent;

        act(() => {
            result.current.handleMouseDown(click2);
        });

        expect(mockAddWall).toHaveBeenCalledWith(expect.objectContaining({
            from: { x: 0, z: 0 },
            to: { x: 1, z: 1 }
        }));
        expect(result.current.isDrawing).toBe(true); // Should continue
        expect(result.current.startPoint).toEqual({ x: 1, z: 1 }); // Start from end
    });

    it('stops drawing on Escape', () => {
        useToolStore.setState({ activeTool: 'wall' });
        const { result } = renderHook(() => useWallDrawing());

        act(() => {
            result.current.handleMouseDown({
                button: 0, clientX: 500, clientY: 500,
                currentTarget: {
                    getBoundingClientRect: () => ({ left: 0, top: 0, width: 1000, height: 1000 })
                },
                preventDefault: jest.fn(), stopPropagation: jest.fn()
            } as unknown as React.MouseEvent);
        });

        expect(result.current.isDrawing).toBe(true);

        const escEvent = new KeyboardEvent('keydown', { key: 'Escape' });
        act(() => {
            document.dispatchEvent(escEvent);
        });

        expect(result.current.isDrawing).toBe(false);
        expect(result.current.startPoint).toBeNull();
    });
});
