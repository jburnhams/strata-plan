import { renderHook, act } from '@testing-library/react';
import { useFloorplanStore } from '@/stores/floorplanStore';
import * as GeometryRoom from '@/services/geometry/room';
import { generateUUID } from '@/services/geometry';
import { Room } from '@/types';

// Mock dependencies
jest.mock('@/services/geometry/room', () => ({
  ...jest.requireActual('@/services/geometry/room'),
  getRoomCorners: jest.fn(),
}));

jest.mock('@/services/geometry', () => ({
  ...jest.requireActual('@/services/geometry'),
  generateUUID: jest.fn(),
}));

describe('floorplanStore Extra Tests', () => {
  const mockFloorplan = {
    id: 'fp-1',
    rooms: [
      { id: 'room-1', name: 'Room 1', position: { x: 0, z: 0 }, length: 4, width: 4, height: 2.7 } as Room
    ],
    walls: [],
    doors: [],
    windows: [],
    connections: [],
    version: '1.0.0',
    units: 'meters' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
    name: 'Test Project'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (generateUUID as jest.Mock).mockReturnValue('new-uuid');

    // Reset store
    const { result } = renderHook(() => useFloorplanStore());
    act(() => {
      result.current.clearFloorplan();
      result.current.loadFloorplan(mockFloorplan);
    });
  });

  describe('convertRoomToWalls', () => {
    it('should convert room to 4 walls and remove room', () => {
      const mockCorners = [
        { x: 0, z: 0 },
        { x: 4, z: 0 },
        { x: 4, z: 4 },
        { x: 0, z: 4 }
      ];
      (GeometryRoom.getRoomCorners as jest.Mock).mockReturnValue(mockCorners);

      const { result } = renderHook(() => useFloorplanStore());

      act(() => {
        result.current.convertRoomToWalls('room-1');
      });

      expect(result.current.currentFloorplan?.rooms).toHaveLength(0);
      expect(result.current.currentFloorplan?.walls).toHaveLength(4);
      expect(result.current.isDirty).toBe(true);
    });

    it('should do nothing if room not found', () => {
      const { result } = renderHook(() => useFloorplanStore());

      act(() => {
        result.current.convertRoomToWalls('non-existent');
      });

      expect(result.current.currentFloorplan?.rooms).toHaveLength(1);
    });
  });

  describe('manual connections', () => {
      it('should add manual connection', () => {
          const { result } = renderHook(() => useFloorplanStore());
          act(() => {
              result.current.addManualConnection('room-1', 'room-2');
          });
          expect(result.current.currentFloorplan?.connections).toHaveLength(1);
          expect(result.current.currentFloorplan?.connections[0].isManual).toBe(true);
      });

      it('should remove connection', () => {
           const { result } = renderHook(() => useFloorplanStore());
           act(() => {
              result.current.addManualConnection('room-1', 'room-2');
          });
          const connId = result.current.currentFloorplan?.connections[0].id;

          act(() => {
              if(connId) result.current.removeConnection(connId);
          });

          expect(result.current.currentFloorplan?.connections).toHaveLength(0);
      });
  });
});
