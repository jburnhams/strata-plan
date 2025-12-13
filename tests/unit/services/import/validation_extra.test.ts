import { validateImportedFloorplan } from '../../../../src/services/import/validation';
import { mockFloorplan } from '../../../utils/mockData';

describe('validation coverage', () => {
  it('should detect invalid room dimensions and position', () => {
    const data = {
      ...mockFloorplan(),
      rooms: [
        { id: '1', length: 0, width: -1, height: 'invalid', type: 'unknown', position: { x: 'bad' } }
      ]
    };
    const result = validateImportedFloorplan(data);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Room 1: Invalid length');
    expect(result.errors).toContain('Room 1: Invalid width');
    expect(result.errors).toContain('Room 1: Invalid height');
    expect(result.errors).toContain('Room 1: Invalid position');
    expect(result.warnings[0]).toContain('Unknown room type');
  });

  it('should detect duplicate room IDs', () => {
    const data = {
      ...mockFloorplan(),
      rooms: [
        { id: '1', length: 1, width: 1, height: 1, position: { x: 0, z: 0 }, type: 'generic' },
        { id: '1', length: 1, width: 1, height: 1, position: { x: 0, z: 0 }, type: 'generic' }
      ]
    };
    const result = validateImportedFloorplan(data);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Duplicate room ID: 1');
  });

  it('should detect invalid door properties', () => {
    const data = {
      ...mockFloorplan(),
      rooms: [{ id: '1', length: 1, width: 1, height: 1, position: { x: 0, z: 0 }, type: 'generic' }],
      doors: [
        { id: 'd1', roomId: '999' }, // Bad room
        { id: 'd2', roomId: '1', width: 0, height: 0, position: 0 }, // Bad dims (width > 0 required?)
        { roomId: '1' } // Missing ID
      ]
    };
    const result = validateImportedFloorplan(data);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Door d1: Reference to non-existent roomId 999');
    expect(result.errors.some(e => e.includes('Door at index 2 missing ID'))).toBe(true);
    // door d2 might pass "typeof number" check but fail validateDoor logic if width=0 is invalid
    // validateDoor logic: width min 0.5?
    expect(result.errors.some(e => e.includes('Door d2: Door width must be between'))).toBe(true);
  });

  it('should detect missing door/window properties', () => {
      const data = {
          ...mockFloorplan(),
          rooms: [{ id: '1', length: 1, width: 1, height: 1, position: { x: 0, z: 0 }, type: 'generic' }],
          doors: [{ id: 'd1', roomId: '1' }], // Missing width/height/pos
          windows: [{ id: 'w1', roomId: '1' }] // Missing width/height/sill
      };
      const result = validateImportedFloorplan(data);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Door d1: Missing or invalid dimensions/position');
      expect(result.errors).toContain('Window w1: Missing or invalid dimensions');
  });

  it('should detect invalid connection properties', () => {
      const data = {
          ...mockFloorplan(),
          rooms: [{ id: '1', length: 1, width: 1, height: 1, position: { x: 0, z: 0 }, type: 'generic' }],
          connections: [
              { room1Id: '1' }, // Missing room2Id
              { room1Id: '999', room2Id: '1' }, // Bad room1
              { room1Id: '1', room2Id: '999' }  // Bad room2
          ]
      };
      const result = validateImportedFloorplan(data);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Connection at index 0: Missing room IDs'))).toBe(true);
      expect(result.errors.some(e => e.includes('Reference to non-existent room1Id 999'))).toBe(true);
      expect(result.errors.some(e => e.includes('Reference to non-existent room2Id 999'))).toBe(true);
  });

  it('should warn if doors/windows arrays are missing', () => {
      const data = mockFloorplan();
      delete (data as any).doors;
      delete (data as any).windows;

      const result = validateImportedFloorplan(data);
      expect(result.valid).toBe(true); // Warnings don't fail validation
      expect(result.warnings).toContain('Missing doors array, defaulting to empty');
      expect(result.warnings).toContain('Missing windows array, defaulting to empty');
  });
});
