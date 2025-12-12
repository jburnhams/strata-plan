import { mergeConnections } from '../../../../src/services/adjacency/graph';
import { RoomConnection } from '../../../../src/types/floorplan';
import { Room } from '../../../../src/types/room';

describe('mergeConnections', () => {
  const baseConnection: RoomConnection = {
    id: 'old-id',
    room1Id: 'room1',
    room2Id: 'room2',
    room1Wall: 'north',
    room2Wall: 'south',
    sharedWallLength: 3,
    doors: ['door1']
  };

  const rooms: Room[] = [
    { id: 'room1' } as Room,
    { id: 'room2' } as Room,
    { id: 'room3' } as Room,
    { id: 'room4' } as Room,
  ];

  it('preserves existing ID and doors when matching connection found', () => {
    const newConnection: RoomConnection = {
      ...baseConnection,
      id: 'new-temp-id',
      doors: [],
      sharedWallLength: 4 // Changed length
    };

    const result = mergeConnections([newConnection], [baseConnection], rooms);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(baseConnection.id);
    expect(result[0].doors).toEqual(baseConnection.doors);
    expect(result[0].sharedWallLength).toBe(4); // Should have new geometry
  });

  it('preserves matching even if room order is swapped', () => {
    const newConnection: RoomConnection = {
      ...baseConnection,
      id: 'new-temp-id',
      room1Id: 'room2', // Swapped
      room2Id: 'room1',
      doors: []
    };

    const result = mergeConnections([newConnection], [baseConnection], rooms);

    expect(result[0].id).toBe(baseConnection.id);
  });

  it('uses new ID for completely new connections', () => {
    const newConnection: RoomConnection = {
      ...baseConnection,
      id: 'new-id',
      room1Id: 'room3',
      room2Id: 'room4',
      doors: []
    };

    const result = mergeConnections([newConnection], [baseConnection], rooms);

    expect(result[0].id).toBe('new-id');
    expect(result[0].doors).toEqual([]);
  });

  it('preserves manual connections that are not auto-detected', () => {
    const manualConnection: RoomConnection = {
      id: 'manual-id',
      room1Id: 'room1',
      room2Id: 'room3',
      isManual: true,
      doors: []
    };

    const result = mergeConnections([], [manualConnection], rooms);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('manual-id');
  });

  it('merges manual connection into auto-detected connection if they match', () => {
    const manualConnection: RoomConnection = {
      id: 'manual-id',
      room1Id: 'room1',
      room2Id: 'room2',
      isManual: true,
      doors: ['door1']
    };

    // Auto connections do not have isManual set
    const autoConnection: RoomConnection = {
      id: 'auto-id',
      room1Id: 'room1',
      room2Id: 'room2',
      room1Wall: 'north',
      room2Wall: 'south',
      sharedWallLength: 3,
      doors: []
    };

    const result = mergeConnections([autoConnection], [manualConnection], rooms);

    expect(result).toHaveLength(1);
    // It should keep the ID of the existing connection
    expect(result[0].id).toBe('manual-id');
    // It should keep the doors
    expect(result[0].doors).toEqual(['door1']);
    // It should NOT have isManual: true because it is now auto-detected
    expect(result[0].isManual).toBeUndefined();
  });

  it('removes manual connection if one of the rooms no longer exists', () => {
    const manualConnection: RoomConnection = {
      id: 'manual-id',
      room1Id: 'room1',
      room2Id: 'deleted-room',
      isManual: true,
      doors: []
    };

    const result = mergeConnections([], [manualConnection], rooms); // rooms has 'room1' but not 'deleted-room'

    expect(result).toHaveLength(0);
  });
});
