import { renderHook, act, waitFor } from '@testing-library/react';
import { useRoomDrag } from '@/hooks/useRoomDrag';
import { useFloorplanStore } from '@/stores/floorplanStore';
import { useHistoryStore } from '@/stores/historyStore';
import { useUIStore } from '@/stores/uiStore';
import { mockRoom, mockFloorplan } from '../utils/mockData';
import { Position2D } from '@/types';

// Mock getSnapGuides to avoid complexity in this test
jest.mock('@/services/geometry/snapping', () => ({
  getSnapGuides: jest.fn((room, otherRooms, position) => ({
    position,
    guides: [],
  })),
}));

// Mock doRoomsOverlap
jest.mock('@/services/geometry/room', () => ({
  doRoomsOverlap: jest.fn(() => false),
  calculateArea: jest.fn(() => 20),
  getRoomBounds: jest.fn(() => ({ minX: 0, maxX: 10, minZ: 0, maxZ: 10 })),
}));

// Mock uuid to be deterministic
jest.mock('uuid', () => ({
  v4: () => 'test-uuid',
}));

describe('Undo/Redo Integration', () => {
  beforeEach(() => {
    useFloorplanStore.getState().clearFloorplan();
    useHistoryStore.getState().clear();
    useUIStore.getState().setZoom(1);

    // Set up a floorplan
    const floorplan = mockFloorplan();
    const room = mockRoom('room-1', { x: 0, z: 0 }, 5, 4);
    floorplan.rooms = [room];
    useFloorplanStore.getState().loadFloorplan(floorplan);
  });

  it('should support undoing a room drag operation', async () => {
    const { result } = renderHook(() => useRoomDrag());

    // 1. Initial State Check
    expect(useFloorplanStore.getState().currentFloorplan?.rooms[0].position).toEqual({ x: 0, z: 0 });
    expect(useHistoryStore.getState().past).toHaveLength(0);

    // 2. Start Drag
    act(() => {
      // Simulate mousedown
      result.current.handleDragStart(
        {
          button: 0,
          clientX: 100,
          clientY: 100,
          stopPropagation: jest.fn(),
          preventDefault: jest.fn()
        } as unknown as React.MouseEvent,
        'room-1'
      );
    });

    // 3. Move Room (Drag)
    act(() => {
      // Simulate mousemove global event
      const moveEvent = new MouseEvent('mousemove', {
        clientX: 200, // +100 pixels
        clientY: 200, // +100 pixels
      });
      document.dispatchEvent(moveEvent);
    });

    // Verify room moved (assuming 50 pixels per meter, 100px = 2m)
    // Snap to grid (0.5m) is enabled by default?
    // In useRoomDrag, PIXELS_PER_METER is 50.
    // dx = 100px = 2m.
    await waitFor(() => {
        const room = useFloorplanStore.getState().currentFloorplan?.rooms[0];
        expect(room?.position.x).toBeCloseTo(2);
        expect(room?.position.z).toBeCloseTo(2);
    });

    // 4. End Drag (Commit)
    act(() => {
      const upEvent = new MouseEvent('mouseup', {
          clientX: 200,
          clientY: 200,
      });
      document.dispatchEvent(upEvent);
    });

    // 5. Verify History
    await waitFor(() => {
        expect(useHistoryStore.getState().past).toHaveLength(1);
    });

    // 6. Undo
    act(() => {
        useHistoryStore.getState().undo();
    });

    // 7. Verify Restoration
    const room = useFloorplanStore.getState().currentFloorplan?.rooms[0];
    expect(room?.position).toEqual({ x: 0, z: 0 });
  });
});
