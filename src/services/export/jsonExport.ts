import { Floorplan } from '../../types/floorplan';
import { serializeFloorplan, SerializedFloorplan, CURRENT_VERSION } from '../storage/serialization';

export interface ExportedJSON {
  exportedAt: string;
  exportedFrom: string;
  schemaVersion: string;
  floorplan: SerializedFloorplan;
}

/**
 * Validates the floorplan before export
 */
function validateFloorplan(floorplan: Floorplan): void {
  if (!floorplan) {
    throw new Error('Cannot export null or undefined floorplan');
  }
  if (!floorplan.id) {
    throw new Error('Floorplan is missing ID');
  }
  if (!floorplan.rooms) {
    console.warn('Exporting floorplan with no rooms array');
  }
}

/**
 * Generates the full export object (metadata + serialized floorplan)
 */
function generateExportData(floorplan: Floorplan): ExportedJSON {
  validateFloorplan(floorplan);

  const serializedFloorplan = serializeFloorplan(floorplan);

  return {
    exportedAt: new Date().toISOString(),
    exportedFrom: `StrataPlan v${CURRENT_VERSION}`,
    schemaVersion: CURRENT_VERSION,
    floorplan: serializedFloorplan
  };
}

/**
 * Calculates the exact size of the export in bytes
 */
export function calculateExportSize(floorplan: Floorplan): number {
  try {
    // We generate the data exactly as exportToJSON would
    const exportData = generateExportData(floorplan);

    // Use the same formatting (2-space indent)
    const jsonString = JSON.stringify(exportData, null, 2);

    // Blob size matches byte length of the UTF-8 string
    return new Blob([jsonString]).size;
  } catch (error) {
    console.warn('Failed to calculate export size:', error);
    return 0;
  }
}

/**
 * Exports a floorplan to a JSON Blob
 */
export async function exportToJSON(floorplan: Floorplan): Promise<Blob> {
  const exportData = generateExportData(floorplan);
  const jsonString = JSON.stringify(exportData, null, 2);
  return new Blob([jsonString], { type: 'application/json' });
}
