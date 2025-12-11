import { createManualConnection, isManualConnection } from '../../../../src/services/adjacency/manualConnections';
import { v4 as uuidv4 } from 'uuid';

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid'),
}));

describe('manualConnections', () => {
  describe('createManualConnection', () => {
    it('creates a connection with correct manual properties', () => {
      const room1Id = 'room1';
      const room2Id = 'room2';

      const connection = createManualConnection(room1Id, room2Id);

      expect(connection).toEqual({
        id: 'mock-uuid',
        room1Id,
        room2Id,
        sharedWall: 'manual',
        overlapStart: 0,
        overlapEnd: 0,
        doors: [],
        isManual: true,
      });
    });
  });

  describe('isManualConnection', () => {
    it('returns true for manual connections', () => {
      const manualConnection = createManualConnection('r1', 'r2');
      expect(isManualConnection(manualConnection)).toBe(true);
    });

    it('returns false for auto-generated connections', () => {
        const autoConnection: any = {
            id: 'auto-1',
            room1Id: 'r1',
            room2Id: 'r2',
            isManual: undefined
        }
        expect(isManualConnection(autoConnection)).toBe(false);
    });
  });
});
