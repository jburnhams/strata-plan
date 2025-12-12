import { act, renderHook } from '@testing-library/react';
import { useFloorplanStore } from '@/stores/floorplanStore';
import { FloorMaterial, WallMaterial, CeilingMaterial } from '@/types/materials';
import { Room } from '@/types';
import { generateUUID } from '@/services/geometry';

// Mock generateUUID to return a predictable ID
jest.mock('@/services/geometry', () => ({
  generateUUID: jest.fn(() => 'test-id'),
  calculateArea: jest.fn(() => 20),
  calculateVolume: jest.fn(() => 60),
  getRoomBounds: jest.fn(() => ({ minX: 0, maxX: 10, minZ: 0, maxZ: 10 })),
}));

// Mock adjacency services
jest.mock('@/services/adjacency/graph', () => ({
  calculateAllConnections: jest.fn(() => []),
}));
jest.mock('@/services/adjacency/manualConnections', () => ({
  createManualConnection: jest.fn(),
}));
jest.mock('@/services/geometry/room', () => ({
  calculateArea: jest.fn(() => 20),
  calculateVolume: jest.fn(() => 60),
  getRoomBounds: jest.fn(() => ({ minX: 0, maxX: 10, minZ: 0, maxZ: 10 })),
}));

describe('useFloorplanStore - Materials', () => {
  beforeEach(() => {
    act(() => {
      useFloorplanStore.getState().clearFloorplan();
      useFloorplanStore.getState().createFloorplan('Test Floorplan', 'meters');
    });
  });

  const addTestRoom = () => {
    let roomId: string = '';
    act(() => {
      const room = useFloorplanStore.getState().addRoom({
        name: 'Test Room',
        length: 5,
        width: 4,
        height: 3,
        type: 'bedroom',
        position: { x: 0, z: 0 },
        rotation: 0,
      });
      roomId = room.id;
    });
    return roomId;
  };

  it('should apply default materials when adding a room', () => {
    const roomId = addTestRoom();
    const room = useFloorplanStore.getState().getRoomById(roomId);

    expect(room).toBeDefined();
    expect(room?.floorMaterial).toBe('hardwood'); // Default for bedroom
    expect(room?.wallMaterial).toBe('drywall-painted'); // Default for bedroom
    // Ceiling material is optional and not strictly defaulted for all types in the store logic yet unless explicitly set
    // But let's check if it picked up undefined as expected or if we want to enforce it.
    // The store implementation does: ceilingMaterial: roomData.ceilingMaterial || defaults.ceiling
    // Bedroom default doesn't specify ceiling, so it should be undefined.
    expect(room?.ceilingMaterial).toBeUndefined();
  });

  it('should update room floor material', () => {
    const roomId = addTestRoom();
    const newMaterial: FloorMaterial = 'tile-ceramic';

    act(() => {
      useFloorplanStore.getState().setRoomFloorMaterial(roomId, newMaterial);
    });

    const room = useFloorplanStore.getState().getRoomById(roomId);
    expect(room?.floorMaterial).toBe(newMaterial);
  });

  it('should update room wall material', () => {
    const roomId = addTestRoom();
    const newMaterial: WallMaterial = 'brick-red';

    act(() => {
      useFloorplanStore.getState().setRoomWallMaterial(roomId, newMaterial);
    });

    const room = useFloorplanStore.getState().getRoomById(roomId);
    expect(room?.wallMaterial).toBe(newMaterial);
  });

  it('should update room ceiling material', () => {
    const roomId = addTestRoom();
    const newMaterial: CeilingMaterial = 'wood-beam';

    act(() => {
      useFloorplanStore.getState().setRoomCeilingMaterial(roomId, newMaterial);
    });

    const room = useFloorplanStore.getState().getRoomById(roomId);
    expect(room?.ceilingMaterial).toBe(newMaterial);
  });

  it('should update custom floor color', () => {
    const roomId = addTestRoom();
    const color = '#FF0000';

    act(() => {
      useFloorplanStore.getState().setRoomCustomColor(roomId, 'floor', color);
    });

    const room = useFloorplanStore.getState().getRoomById(roomId);
    expect(room?.customFloorColor).toBe(color);
  });

  it('should update custom wall color', () => {
    const roomId = addTestRoom();
    const color = '#00FF00';

    act(() => {
      useFloorplanStore.getState().setRoomCustomColor(roomId, 'wall', color);
    });

    const room = useFloorplanStore.getState().getRoomById(roomId);
    expect(room?.customWallColor).toBe(color);
  });

  it('should update custom ceiling color', () => {
    const roomId = addTestRoom();
    const color = '#0000FF';

    act(() => {
      useFloorplanStore.getState().setRoomCustomColor(roomId, 'ceiling', color);
    });

    const room = useFloorplanStore.getState().getRoomById(roomId);
    expect(room?.customCeilingColor).toBe(color);
  });
});
