export interface ExportOptions {
  // Generic options
}

export interface GLTFExportOptions extends ExportOptions {
  binary?: boolean;
  includeTextures?: boolean;
  quality?: 'low' | 'medium' | 'high';
}

export interface PDFExportOptions extends ExportOptions {
  pageSize?: 'a4' | 'letter';
  orientation?: 'portrait' | 'landscape';
  includeTable?: boolean;
  include2DView?: boolean;
  include3DView?: boolean;
}
