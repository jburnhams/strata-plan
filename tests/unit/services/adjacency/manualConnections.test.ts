import { RoomConnection } from '../../../../src/types';
import { createManualConnection, validateManualConnections } from '../../../../src/services/adjacency/manualConnections';

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid')
}));

describe('Manual Connections', () => {
  it('creates a manual connection correctly', () => {
    const conn = createManualConnection('room1', 'room2');
    expect(conn).toEqual({
      id: 'mock-uuid',
      room1Id: 'room1',
      room2Id: 'room2',
      room1Wall: 'north',
      room2Wall: 'south',
      sharedWallLength: 0,
      doors: [],
      isManual: true
    });
  });

  it('validates and removes connections for deleted rooms', () => {
    const connections: RoomConnection[] = [
      { id: '1', room1Id: 'A', room2Id: 'B', room1Wall: 'north', room2Wall: 'south', sharedWallLength: 0, doors: [], isManual: true },
      { id: '2', room1Id: 'B', room2Id: 'C', room1Wall: 'north', room2Wall: 'south', sharedWallLength: 0, doors: [], isManual: true }
    ];

    // Room C is deleted
    const validRooms = ['A', 'B'];
    const result = validateManualConnections(connections, validRooms);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });
});
