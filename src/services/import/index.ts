import { Floorplan } from '../../types';
import { importFromJSON } from './jsonImport';
import { readFileAsText, readFileAsArrayBuffer } from './fileReader';

export { readFileAsText, readFileAsArrayBuffer };

export interface ImportService {
  detectFormat(file: File): ImportFormat;
  importJSON(file: File): Promise<ImportResult>;
  importGLTF(file: File): Promise<ImportResult>; // Phase 3+
  validateImport(data: unknown): ValidationResult;
}

export type ImportFormat = 'json' | 'gltf' | 'unknown';

export interface ImportResult {
  success: boolean;
  floorplan?: Floorplan;
  warnings?: string[];
  errors?: string[];
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Detects the format of a file based on its name and/or content.
 *
 * @param file The file to inspect
 * @returns 'json' | 'gltf' | 'unknown'
 */
export function detectFormat(file: File): ImportFormat {
  const name = file.name.toLowerCase();

  if (name.endsWith('.json')) {
    return 'json';
  }

  if (name.endsWith('.gltf') || name.endsWith('.glb')) {
    return 'gltf';
  }

  return 'unknown';
}

/**
 * Unified import function that delegates to specific importers based on format.
 *
 * @param file The file to import
 * @param options Optional import options
 * @returns Promise resolving to the import result
 */
export async function importFloorplan(
  file: File,
  options: { generateNewIds?: boolean } = {}
): Promise<ImportResult> {
  const format = detectFormat(file);

  try {
    switch (format) {
      case 'json':
        return importFromJSON(file, options);
      case 'gltf':
        // Delegate to GLTF importer (to be implemented)
        return {
          success: false,
          errors: ['GLTF import not yet implemented']
        };
      default:
        return {
          success: false,
          errors: [`Unsupported file format: ${file.name}`]
        };
    }
  } catch (error) {
    return {
      success: false,
      errors: [error instanceof Error ? error.message : 'Unknown error during import']
    };
  }
}
