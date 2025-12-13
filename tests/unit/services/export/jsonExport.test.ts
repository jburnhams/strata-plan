import { exportToJSON } from '../../../../src/services/export/jsonExport';
import { Floorplan } from '../../../../src/types';

// Need to polyfill TextEncoder/TextDecoder for Blob usage in JSDOM environment if not present
// But jest-environment-jsdom usually has Blob.
// The previous failure was "Response is not defined".

describe('jsonExport', () => {
  const mockDate = new Date('2023-01-01');
  const mockFloorplan: Floorplan = {
    id: 'p1',
    name: 'Test Project',
    units: 'meters',
    rooms: [],
    walls: [],
    doors: [],
    windows: [],
    connections: [],
    createdAt: mockDate,
    updatedAt: mockDate,
    version: '1.0.0'
  };

  it('should export floorplan to JSON blob', async () => {
    const blob = await exportToJSON(mockFloorplan);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('application/json');
  });

  it('should contain correct data', async () => {
    const blob = await exportToJSON(mockFloorplan);

    // Read blob using FileReader
    const text = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsText(blob);
    });

    const data = JSON.parse(text);

    expect(data.floorplan).toBeDefined();
    expect(data.floorplan.id).toBe('p1');
    expect(data.exportedAt).toBeDefined();
    expect(data.schemaVersion).toBeDefined();
  });
});
