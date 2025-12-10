import { act } from '@testing-library/react';
import { useFloorplanStore } from '../../../src/stores/floorplanStore';
import { Room } from '../../../src/types/room';

describe('floorplanStore adjacency', () => {
  beforeEach(() => {
    const { createFloorplan } = useFloorplanStore.getState();
    act(() => {
        createFloorplan('Test Floorplan', 'meters');
    });
  });

  afterEach(() => {
    act(() => {
        useFloorplanStore.getState().clearFloorplan();
    });
  });

  const room1Data: Omit<Room, 'id'> = {
    name: 'Room 1',
    length: 5,
    width: 5,
    height: 3,
    type: 'bedroom',
    position: { x: 0, z: 0 },
    rotation: 0,
    doors: [],
    windows: []
  };

  const room2Data: Omit<Room, 'id'> = {
    name: 'Room 2',
    length: 5,
    width: 5,
    height: 3,
    type: 'kitchen',
    position: { x: 5, z: 0 }, // Adjacent to Room 1 (Right)
    rotation: 0,
    doors: [],
    windows: []
  };

  it('addRoom triggers connection calculation', () => {
    const { addRoom } = useFloorplanStore.getState();

    let r1: Room, r2: Room;
    act(() => {
      r1 = addRoom(room1Data);
    });

    // We need to override auto-positioning for room 2 to ensure it's adjacent
    act(() => {
      // By default addRoom might auto-position.
      // But we pass position in room2Data.
      // wait, addRoom auto-position logic:
      // if (room.position.x === 0 && room.position.z === 0 && ...)
      // room2Data has x=5. So auto-position won't trigger.
      r2 = addRoom(room2Data);
    });

    const connections = useFloorplanStore.getState().currentFloorplan?.connections;
    expect(connections).toHaveLength(1);
    // Order might be swapped by buildGraph loop
    const conn = connections![0];
    expect([conn.room1Id, conn.room2Id]).toContain(r1!.id);
    expect([conn.room1Id, conn.room2Id]).toContain(r2!.id);
  });

  it('deleteRoom removes connections', () => {
    const { addRoom, deleteRoom } = useFloorplanStore.getState();

    let r1: Room;
    act(() => {
      r1 = addRoom(room1Data);
      addRoom(room2Data);
    });

    expect(useFloorplanStore.getState().currentFloorplan?.connections).toHaveLength(1);

    act(() => {
      deleteRoom(r1!.id);
    });

    expect(useFloorplanStore.getState().currentFloorplan?.connections).toHaveLength(0);
  });

  it('getAdjacentRooms returns connected rooms', () => {
    const { addRoom, getAdjacentRooms } = useFloorplanStore.getState();

    let r1: Room, r2: Room;
    act(() => {
      r1 = addRoom(room1Data);
      r2 = addRoom(room2Data);
    });

    const adjacentToR1 = getAdjacentRooms(r1!.id);
    expect(adjacentToR1).toHaveLength(1);
    expect(adjacentToR1[0].id).toBe(r2!.id);
  });
});
