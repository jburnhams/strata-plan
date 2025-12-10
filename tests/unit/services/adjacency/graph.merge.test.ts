import { mergeConnections } from '../../../../src/services/adjacency/graph';
import { RoomConnection } from '../../../../src/types/floorplan';

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

  it('preserves existing ID and doors when matching connection found', () => {
    const newConnection: RoomConnection = {
      ...baseConnection,
      id: 'new-temp-id',
      doors: [],
      sharedWallLength: 4 // Changed length
    };

    const result = mergeConnections([newConnection], [baseConnection]);

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

    const result = mergeConnections([newConnection], [baseConnection]);

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

    const result = mergeConnections([newConnection], [baseConnection]);

    expect(result[0].id).toBe('new-id');
    expect(result[0].doors).toEqual([]);
  });
});
