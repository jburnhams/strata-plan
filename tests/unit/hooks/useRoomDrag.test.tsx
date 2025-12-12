import { renderHook, act } from '@testing-library/react';
import { useRoomDrag } from '../../../src/hooks/useRoomDrag';
import { useFloorplanStore } from '../../../src/stores/floorplanStore';
import { useUIStore } from '../../../src/stores/uiStore';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// Reset stores helper
const resetStore = () => {
    // @ts-ignore
    useFloorplanStore.setState({
        currentFloorplan: {
            id: 'test',
            name: 'Test',
            units: 'meters',
            rooms: [],
            walls: [],
            doors: [],
            windows: [],
            connections: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            version: '1.0.0',
        },
        selectedRoomIds: [],
        selectedRoomId: null,
    });
    // @ts-ignore
    useUIStore.setState({ zoomLevel: 1.0, showGrid: true });
};

describe('useRoomDrag', () => {
    beforeEach(() => {
        resetStore();
        // Setup room
        useFloorplanStore.getState().addRoom({
            name: 'Room 1',
            length: 5, width: 4, height: 2.7, type: 'bedroom',
            position: { x: 0, z: 0 }, rotation: 0
        });
    });

    it('updates room position on drag', () => {
        const { result } = renderHook(() => useRoomDrag());
        const store = useFloorplanStore.getState();
        const room = store.currentFloorplan?.rooms[0]!;

        const e = {
            button: 0,
            clientX: 100,
            clientY: 100,
            stopPropagation: jest.fn(),
            preventDefault: jest.fn(),
        } as unknown as React.MouseEvent;

        act(() => {
            result.current.handleDragStart(e, room.id);
        });

        expect(result.current.isDragging).toBe(true);

        // Simulate global mouse move
        // delta 50px x, 50px y
        // PIXELS_PER_METER = 50, zoom = 1.0
        // delta meters = 1.0, 1.0
        const moveEvent = new MouseEvent('mousemove', {
            clientX: 150,
            clientY: 150,
        });

        act(() => {
            document.dispatchEvent(moveEvent);
        });

        const updatedRoom = useFloorplanStore.getState().currentFloorplan?.rooms[0]!;
        expect(updatedRoom.position.x).toBe(1);
        expect(updatedRoom.position.z).toBe(1);

        // End drag
        const upEvent = new MouseEvent('mouseup');
        act(() => {
            document.dispatchEvent(upEvent);
        });

        expect(result.current.isDragging).toBe(false);
    });

    it('snaps to grid', () => {
        const { result } = renderHook(() => useRoomDrag());
        const store = useFloorplanStore.getState();
        const room = store.currentFloorplan?.rooms[0]!;

        const e = {
            button: 0,
            clientX: 100,
            clientY: 100,
            stopPropagation: jest.fn(),
            preventDefault: jest.fn(),
        } as unknown as React.MouseEvent;

        act(() => {
            result.current.handleDragStart(e, room.id);
        });

        // Move 20px -> 0.4m
        // Grid is 0.5m
        // Should snap to 0.5m (closest) if we cross threshold?
        // 0.4m rounds to 0.5m? 0.4/0.5 = 0.8 -> round(0.8) = 1 -> 1 * 0.5 = 0.5
        const moveEvent = new MouseEvent('mousemove', {
            clientX: 120, // +20px
            clientY: 100,
        });

        act(() => {
            document.dispatchEvent(moveEvent);
        });

        const updatedRoom = useFloorplanStore.getState().currentFloorplan?.rooms[0]!;
        expect(updatedRoom.position.x).toBe(0.5);
    });

    it('updates multi-selection room position on drag', () => {
        const store = useFloorplanStore.getState();
        const room1 = store.currentFloorplan?.rooms[0]!;
        const room2 = store.addRoom({
            name: 'Room 2',
            length: 5, width: 4, height: 2.7, type: 'bedroom',
            position: { x: 5, z: 0 }, rotation: 0
        });

        store.setRoomSelection([room1.id, room2.id]);

        const { result } = renderHook(() => useRoomDrag());

        const e = {
            button: 0,
            clientX: 100,
            clientY: 100,
            stopPropagation: jest.fn(),
            preventDefault: jest.fn(),
        } as unknown as React.MouseEvent;

        act(() => {
            result.current.handleDragStart(e, room1.id);
        });

        expect(result.current.isDragging).toBe(true);

        const moveEvent = new MouseEvent('mousemove', {
            clientX: 150, // +1m
            clientY: 150, // +1m
        });

        act(() => {
            document.dispatchEvent(moveEvent);
        });

        const updatedRoom1 = useFloorplanStore.getState().getRoomById(room1.id)!;
        const updatedRoom2 = useFloorplanStore.getState().getRoomById(room2.id)!;

        expect(updatedRoom1.position.x).toBe(1);
        expect(updatedRoom2.position.x).toBe(6); // 5 + 1
    });

    it('selects unselected room on drag start', () => {
        const store = useFloorplanStore.getState();
        const room1 = store.currentFloorplan?.rooms[0]!;

        // Deselect
        store.clearSelection();

        const { result } = renderHook(() => useRoomDrag());

        const e = {
            button: 0,
            clientX: 100,
            clientY: 100,
            stopPropagation: jest.fn(),
            preventDefault: jest.fn(),
        } as unknown as React.MouseEvent;

        act(() => {
            result.current.handleDragStart(e, room1.id);
        });

        expect(useFloorplanStore.getState().selectedRoomIds).toContain(room1.id);
    });
});
