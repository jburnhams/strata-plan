import { Floorplan } from '../../types/floorplan';
import { exportToJSON } from './jsonExport';
import { exportToGLTF } from './gltfExport';
import { GLTFExportOptions, PDFExportOptions, ExportOptions } from './types';

export * from './types';
export type ExportFormat = 'json' | 'gltf' | 'pdf';

export interface ExportService {
  exportJSON(floorplan: Floorplan): Promise<Blob>;
  exportGLTF(floorplan: Floorplan, options?: GLTFExportOptions): Promise<Blob>;
  exportPDF(floorplan: Floorplan, options?: PDFExportOptions): Promise<Blob>;
  downloadBlob(blob: Blob, filename: string): void;
}

/**
 * Downloads a Blob as a file in the browser
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates a filename based on project name, date, and format
 */
export function generateFilename(projectName: string, format: string): string {
  // Sanitize project name (alphanumeric and spaces only, replace spaces with underscores)
  const sanitized = projectName
    .replace(/[^a-z0-9\s-]/gi, '')
    .trim()
    .replace(/\s+/g, '_');

  const date = new Date().toISOString().split('T')[0];
  const extension = format.startsWith('.') ? format.slice(1) : format;

  return `${sanitized || 'project'}_${date}.${extension}`;
}

/**
 * Unified export function
 */
export async function exportFloorplan(
  floorplan: Floorplan,
  format: ExportFormat,
  options?: ExportOptions
): Promise<void> {
  let blob: Blob;

  let filenameFormat = format;

  switch (format) {
    case 'json':
      blob = await exportToJSON(floorplan);
      break;
    case 'gltf':
      blob = await exportToGLTF(floorplan, options as GLTFExportOptions);
      // Determine extension based on binary option.
      // GLTFExportOptions.binary defaults to true in exportToGLTF.
      // However, we can't easily see the result blob type here to decide extension without checking options.
      const gltfOptions = options as GLTFExportOptions;
      if (gltfOptions?.binary === false) {
        filenameFormat = 'gltf';
      } else {
        filenameFormat = 'glb' as ExportFormat;
      }
      break;
    case 'pdf':
      throw new Error('PDF export not implemented yet');
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }

  const filename = generateFilename(floorplan.name, filenameFormat);
  downloadBlob(blob, filename);
}
