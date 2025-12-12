import { exportToJSON, ExportedJSON, calculateExportSize } from '../../../../src/services/export/jsonExport';
import { Floorplan } from '../../../../src/types/floorplan';
import { CURRENT_VERSION } from '../../../../src/services/storage/serialization';

// Helper to read blob in JSDOM environment
function readBlobText(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(blob);
  });
}

describe('jsonExport', () => {
  const mockDate = new Date('2024-01-01T12:00:00.000Z');

  const mockFloorplan: Floorplan = {
    id: 'test-id',
    name: 'Test Project',
    units: 'meters',
    rooms: [],
    walls: [],
    doors: [],
    windows: [],
    connections: [],
    createdAt: mockDate,
    updatedAt: mockDate,
    version: CURRENT_VERSION
  };

  it('should export valid JSON blob', async () => {
    const blob = await exportToJSON(mockFloorplan);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('application/json');

    const text = await readBlobText(blob);
    const data = JSON.parse(text) as ExportedJSON;

    expect(data.schemaVersion).toBe(CURRENT_VERSION);
    expect(data.exportedFrom).toContain('StrataPlan');
    expect(data.floorplan.id).toBe(mockFloorplan.id);
    expect(data.floorplan.name).toBe(mockFloorplan.name);
    // Dates should be strings in the export
    expect(data.floorplan.createdAt).toBe(mockDate.toISOString());
  });

  it('should throw error for null floorplan', async () => {
    await expect(exportToJSON(null as unknown as Floorplan)).rejects.toThrow();
  });

  it('should include metadata in export', async () => {
    const blob = await exportToJSON(mockFloorplan);
    const text = await readBlobText(blob);
    const data = JSON.parse(text) as ExportedJSON;

    expect(data.exportedAt).toBeDefined();
    expect(new Date(data.exportedAt).toISOString()).toBe(data.exportedAt); // Valid ISO string
  });

  it('should calculate export size accurately', async () => {
    const size = calculateExportSize(mockFloorplan);
    const blob = await exportToJSON(mockFloorplan);

    // The calculated size should match the actual blob size exactly
    // (assuming both use the same date for exportedAt which is created instantly inside the functions)
    // Wait, exportedAt is created inside the function call, so it might differ by milliseconds if called sequentially?
    // exportToJSON calls new Date() and calculateExportSize calls new Date().
    // If they differ, the size might differ by byte length if the ISO string length changes (unlikely for ISO)
    // or if the implementation is deterministic.
    // However, the test might fail if milliseconds change.
    // Let's just check it's close or use a spy on Date if needed, but ISO string length is constant.

    expect(size).toBeGreaterThan(0);
    // Length of ISO string is constant (24 chars), so size should be identical regardless of actual time difference
    expect(size).toBe(blob.size);
  });
});
