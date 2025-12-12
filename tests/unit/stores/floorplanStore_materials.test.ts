import { act } from '@testing-library/react';
import { useFloorplanStore } from '@/stores/floorplanStore';
import { ROOM_TYPE_MATERIALS } from '@/constants/defaults';
import { RoomType } from '@/types/room';

// Mock generateUUID
jest.mock('@/services/geometry', () => ({
  generateUUID: jest.fn(() => 'mock-uuid-' + Math.random().toString(36).substr(2, 9)),
}));

// Mock calculateAllConnections
jest.mock('@/services/adjacency/graph', () => ({
  calculateAllConnections: jest.fn(() => []),
}));

describe('floorplanStore Material Actions', () => {
  const initialState = useFloorplanStore.getState();

  beforeEach(() => {
    useFloorplanStore.setState(initialState, true);
    // Create a floorplan to work with
    act(() => {
      useFloorplanStore.getState().createFloorplan('Test Plan', 'meters');
    });
  });

  it('should apply default materials when adding a room', () => {
    const roomType: RoomType = 'kitchen';

    let addedRoom;
    act(() => {
      addedRoom = useFloorplanStore.getState().addRoom({
        name: 'Test Kitchen',
        length: 4,
        width: 3,
        height: 2.7,
        type: roomType,
        position: { x: 0, z: 0 },
        rotation: 0,
      });
    });

    const room = useFloorplanStore.getState().currentFloorplan?.rooms.find(r => r.id === addedRoom.id);
    expect(room).toBeDefined();
    expect(room?.floorMaterial).toBe(ROOM_TYPE_MATERIALS[roomType].floor);
    expect(room?.wallMaterial).toBe(ROOM_TYPE_MATERIALS[roomType].wall);
    expect(room?.ceilingMaterial).toBe(ROOM_TYPE_MATERIALS[roomType].ceiling);
  });

  it('should set room floor material and clear custom floor color', () => {
    // First add a room
    let roomId;
    act(() => {
      const room = useFloorplanStore.getState().addRoom({
        name: 'Test Room',
        length: 4,
        width: 4,
        height: 2.7,
        type: 'bedroom',
        position: { x: 0, z: 0 },
        rotation: 0,
        customFloorColor: '#ff0000',
      });
      roomId = room.id;
    });

    // Verify initial state
    let room = useFloorplanStore.getState().currentFloorplan?.rooms.find(r => r.id === roomId);
    expect(room?.customFloorColor).toBe('#ff0000');

    // Update floor material
    act(() => {
      useFloorplanStore.getState().setRoomFloorMaterial(roomId!, 'tile-ceramic');
    });

    // Verify update
    room = useFloorplanStore.getState().currentFloorplan?.rooms.find(r => r.id === roomId);
    expect(room?.floorMaterial).toBe('tile-ceramic');
    expect(room?.customFloorColor).toBeUndefined();
  });

  it('should set room wall material and clear custom wall color', () => {
    let roomId;
    act(() => {
      const room = useFloorplanStore.getState().addRoom({
        name: 'Test Room',
        length: 4,
        width: 4,
        height: 2.7,
        type: 'bedroom',
        position: { x: 0, z: 0 },
        rotation: 0,
        customWallColor: '#00ff00',
      });
      roomId = room.id;
    });

    act(() => {
      useFloorplanStore.getState().setRoomWallMaterial(roomId!, 'brick-red');
    });

    const room = useFloorplanStore.getState().currentFloorplan?.rooms.find(r => r.id === roomId);
    expect(room?.wallMaterial).toBe('brick-red');
    expect(room?.customWallColor).toBeUndefined();
  });

  it('should set room ceiling material and clear custom ceiling color', () => {
    let roomId;
    act(() => {
      const room = useFloorplanStore.getState().addRoom({
        name: 'Test Room',
        length: 4,
        width: 4,
        height: 2.7,
        type: 'bedroom',
        position: { x: 0, z: 0 },
        rotation: 0,
        customCeilingColor: '#0000ff',
      });
      roomId = room.id;
    });

    act(() => {
      useFloorplanStore.getState().setRoomCeilingMaterial(roomId!, 'wood-beam');
    });

    const room = useFloorplanStore.getState().currentFloorplan?.rooms.find(r => r.id === roomId);
    expect(room?.ceilingMaterial).toBe('wood-beam');
    expect(room?.customCeilingColor).toBeUndefined();
  });

  it('should set custom room color', () => {
    let roomId;
    act(() => {
      const room = useFloorplanStore.getState().addRoom({
        name: 'Test Room',
        length: 4,
        width: 4,
        height: 2.7,
        type: 'bedroom',
        position: { x: 0, z: 0 },
        rotation: 0,
      });
      roomId = room.id;
    });

    // Set custom floor color
    act(() => {
      useFloorplanStore.getState().setRoomCustomColor(roomId!, 'floor', '#123456');
    });

    let room = useFloorplanStore.getState().currentFloorplan?.rooms.find(r => r.id === roomId);
    expect(room?.customFloorColor).toBe('#123456');

    // Set custom wall color
    act(() => {
      useFloorplanStore.getState().setRoomCustomColor(roomId!, 'wall', '#654321');
    });
    room = useFloorplanStore.getState().currentFloorplan?.rooms.find(r => r.id === roomId);
    expect(room?.customWallColor).toBe('#654321');

    // Set custom ceiling color
    act(() => {
      useFloorplanStore.getState().setRoomCustomColor(roomId!, 'ceiling', '#abcdef');
    });
    room = useFloorplanStore.getState().currentFloorplan?.rooms.find(r => r.id === roomId);
    expect(room?.customCeilingColor).toBe('#abcdef');
  });
});
