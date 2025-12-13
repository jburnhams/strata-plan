# Section 10: Export System

> **Priority**: High - Essential for getting data out of the application.
>
> **Phase**: MVP (Phase 1)
>
> **Dependencies**:
> - Section 01 (data model)
> - Section 05 (3D viewer for glTF export)
> - Section 09 (serialization utilities)
>
> **Parallel Work**: Can run in parallel once dependencies are met.

---

## Overview

The export system allows users to download their floorplans in multiple formats: JSON (for re-import), glTF (for 3D viewers), and PDF (for printing). All exports happen client-side with no server required.

---

## Task 10.1: Export Service Architecture

**File**: `src/services/export/index.ts`

### Subtasks

- [x] **10.1.1** Create export service interface:
  ```typescript
  interface ExportService {
    exportJSON(floorplan: Floorplan): Promise<Blob>
    exportGLTF(floorplan: Floorplan, options?: GLTFExportOptions): Promise<Blob>
    exportPDF(floorplan: Floorplan, options?: PDFExportOptions): Promise<Blob>
    downloadBlob(blob: Blob, filename: string): void
  }
  ```

- [x] **10.1.2** Create unified export function:
  ```typescript
  async function exportFloorplan(
    floorplan: Floorplan,
    format: 'json' | 'gltf' | 'pdf',
    options?: ExportOptions
  ): Promise<void>
  ```
  - Generates file
  - Triggers download

- [x] **10.1.3** Implement download helper:
  ```typescript
  function downloadBlob(blob: Blob, filename: string): void
  ```
  - Creates temporary URL
  - Triggers browser download
  - Cleans up URL

- [x] **10.1.4** Generate default filename:
  ```typescript
  function generateFilename(projectName: string, format: string): string
  ```
  - Format: `ProjectName_2024-01-15.json`
  - Sanitize project name for filename

### Unit Tests

- [x] Download helper triggers download
- [x] Filename generation handles special characters
- [x] Filename includes date

---

## Task 10.2: JSON Export

**File**: `src/services/export/jsonExport.ts`

### Subtasks

- [x] **10.2.1** Implement JSON export:
  ```typescript
  async function exportToJSON(floorplan: Floorplan): Promise<Blob>
  ```
  - Serialize floorplan to JSON
  - Pretty-print with 2-space indentation
  - Return as Blob with MIME type `application/json`

- [x] **10.2.2** Include export metadata:
  ```typescript
  interface ExportedJSON {
    exportedAt: string  // ISO date
    exportedFrom: string  // "StrataPlan v1.0.0"
    schemaVersion: string
    floorplan: SerializedFloorplan
  }
  ```

- [x] **10.2.3** Validate before export:
  - Ensure required fields present
  - Log warnings for unusual data

- [x] **10.2.4** Calculate export size:
  - Return file size with export
  - Show in export dialog

### Unit Tests

- [x] JSON export produces valid JSON
- [x] Metadata included in export
- [x] Blob has correct MIME type
- [x] Re-import produces identical data

---

## Task 10.3: glTF Export

**File**: `src/services/export/gltfExport.ts`

### Subtasks

- [x] **10.3.1** Install Three.js GLTFExporter:
  ```typescript
  import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter'
  ```

- [x] **10.3.2** Create export function:
  ```typescript
  async function exportToGLTF(
    floorplan: Floorplan,
    options?: GLTFExportOptions
  ): Promise<Blob>

  interface GLTFExportOptions {
    binary?: boolean  // .glb vs .gltf
    includeTextures?: boolean
    quality?: 'low' | 'medium' | 'high'
  }
  ```

- [x] **10.3.3** Generate 3D scene for export:
  - Create Three.js scene from floorplan
  - Include all rooms, doors, windows
  - Apply materials

- [x] **10.3.4** Configure exporter:
  ```typescript
  const exporter = new GLTFExporter()
  exporter.parse(scene, (gltf) => {
    // Handle result
  }, { binary: options.binary })
  ```

- [x] **10.3.5** Handle binary vs JSON:
  - `.glb`: Binary format, smaller file
  - `.gltf`: JSON format, human-readable
  - Default to binary

- [x] **10.3.6** Include scene metadata:
  - Project name in scene name
  - Room names as object names

- [x] **10.3.7** Texture embedding:
  - If includeTextures true, embed texture data
  - Otherwise, materials are solid colors

### Unit Tests

- [x] glTF export produces valid blob
- [x] Binary option produces .glb
- [x] Scene contains correct number of objects
- [x] Room names preserved

---

## Task 10.4: PDF Export

**File**: `src/services/export/pdfExport.ts`

### Subtasks

- [x] **10.4.1** Install jsPDF:
  ```bash
  npm install jspdf
  npm install --save-dev @types/jspdf
  ```

- [x] **10.4.2** Create PDF export function:
  ```typescript
  async function exportToPDF(
    floorplan: Floorplan,
    options?: PDFExportOptions
  ): Promise<Blob>

  interface PDFExportOptions {
    pageSize?: 'a4' | 'letter'
    orientation?: 'portrait' | 'landscape'
    includeTable?: boolean
    include2DView?: boolean
    include3DView?: boolean
  }
  ```

- [x] **10.4.3** Design PDF layout:
  ```
  Page 1:
  ┌─────────────────────────────────┐
  │ [Logo]     PROJECT NAME         │
  │            Date: 2024-01-15     │
  ├─────────────────────────────────┤
  │                                 │
  │     2D FLOORPLAN DIAGRAM        │
  │     (SVG rendered to canvas)    │
  │                                 │
  ├─────────────────────────────────┤
  │ Summary:                        │
  │ Total Area: 120.5 m²           │
  │ Total Volume: 325.4 m³         │
  │ Rooms: 5                       │
  └─────────────────────────────────┘

  Page 2 (if includeTable):
  ┌─────────────────────────────────┐
  │ ROOM DETAILS                    │
  ├───────┬───────┬───────┬────────┤
  │ Name  │ L × W │Height │ Area   │
  ├───────┼───────┼───────┼────────┤
  │Kitchen│ 5×4   │ 2.7m │ 20.0m² │
  │...    │       │      │        │
  └───────┴───────┴───────┴────────┘
  ```

- [ ] **10.4.4** Render 2D floorplan to PDF:
  - Create off-screen canvas
  - Render rooms to scale
  - Add to PDF as image

- [x] **10.4.5** Add room table:
  - Table with all room details
  - Auto-paginate if many rooms

- [x] **10.4.6** Add headers and footers:
  - Project name in header
  - Page numbers in footer
  - Date generated

- [x] **10.4.7** Handle units display:
  - Show dimensions in project units
  - Include unit label (m or ft)

### Unit Tests

- [x] PDF export produces valid blob
- [x] Page count correct for room count
- [x] Table data matches floorplan
- [x] Dimensions show correct units

---

## Task 10.5: Screenshot Export

**File**: `src/services/export/screenshotExport.ts`

### Subtasks

- [ ] **10.5.1** Create 2D screenshot:
  ```typescript
  async function export2DScreenshot(
    floorplan: Floorplan,
    options?: ScreenshotOptions
  ): Promise<Blob>

  interface ScreenshotOptions {
    width?: number
    height?: number
    format?: 'png' | 'jpeg'
    quality?: number  // 0-1 for JPEG
    background?: string
  }
  ```

- [ ] **10.5.2** Render 2D view to canvas:
  - Create off-screen canvas
  - Render at specified resolution
  - Export as PNG or JPEG

- [ ] **10.5.3** Create 3D screenshot:
  ```typescript
  async function export3DScreenshot(
    scene: THREE.Scene,
    camera: THREE.Camera,
    renderer: THREE.WebGLRenderer,
    options?: ScreenshotOptions
  ): Promise<Blob>
  ```

- [ ] **10.5.4** Render 3D view:
  - Use current camera position
  - Or: preset "beauty shot" angle
  - Render at high resolution

- [ ] **10.5.5** Add watermark option:
  - Optional "Made with StrataPlan" watermark
  - Position: bottom-right corner

### Unit Tests

- [ ] 2D screenshot has correct dimensions
- [ ] 3D screenshot captures current view
- [ ] Format option works correctly

---

## Task 10.6: Export Dialog UI

**File**: `src/components/dialogs/ExportDialog.tsx`

### Subtasks

- [ ] **10.6.1** Create export dialog:
  - Opens from File menu or Export button
  - Shows format options
  - Shows export preview/info

- [ ] **10.6.2** Format selector:
  - Radio buttons or tabs for format
  - JSON, glTF, PDF, Screenshot
  - Description for each format

- [ ] **10.6.3** Format-specific options:
  - JSON: None (or pretty-print toggle)
  - glTF: Binary toggle, include textures
  - PDF: Page size, orientation, content options
  - Screenshot: Resolution, format

- [ ] **10.6.4** Filename input:
  - Pre-filled with default filename
  - Editable by user
  - Extension auto-added based on format

- [ ] **10.6.5** Export button:
  - "Export" / "Download" button
  - Shows progress for large exports
  - Disables during export

- [ ] **10.6.6** Success feedback:
  - Toast: "Exported as filename.pdf"
  - Close dialog on success

### Unit Tests

- [ ] Dialog opens with correct options
- [ ] Format change updates options
- [ ] Export triggers download

---

## Task 10.7: Batch Export

**File**: `src/services/export/batchExport.ts`

### Subtasks

- [ ] **10.7.1** Export all formats at once:
  ```typescript
  async function exportAll(
    floorplan: Floorplan,
    formats: ExportFormat[]
  ): Promise<Map<ExportFormat, Blob>>
  ```

- [ ] **10.7.2** Create ZIP archive:
  ```bash
  npm install jszip
  ```
  ```typescript
  async function exportAsZip(
    floorplan: Floorplan,
    formats: ExportFormat[]
  ): Promise<Blob>
  ```
  - Include all selected formats in ZIP
  - Folder structure: `ProjectName/`

- [ ] **10.7.3** Add to export dialog:
  - "Export All" option
  - Downloads ZIP with all formats

### Unit Tests

- [ ] Batch export creates all formats
- [ ] ZIP contains all files
- [ ] ZIP structure is correct

---

## Task 10.8: Export Progress and Error Handling

**File**: `src/hooks/useExport.ts`

### Subtasks

- [ ] **10.8.1** Create export hook:
  ```typescript
  function useExport(): {
    exportFloorplan: (format: ExportFormat, options?: ExportOptions) => Promise<void>
    isExporting: boolean
    progress: number  // 0-100
    error: Error | null
  }
  ```

- [ ] **10.8.2** Track export progress:
  - Update progress during long exports
  - Show in progress bar

- [ ] **10.8.3** Handle export errors:
  - Catch and report errors
  - User-friendly error messages
  - Retry option

- [ ] **10.8.4** Export queue:
  - Queue multiple exports
  - Process sequentially
  - Prevent UI blocking

### Unit Tests

- [ ] Progress updates during export
- [ ] Error state set on failure
- [ ] Queue processes in order

---

## Task 10.9: Keyboard Shortcut

**File**: Update keyboard shortcuts

### Subtasks

- [ ] **10.9.1** Add export shortcut:
  - Ctrl+Shift+E: Open export dialog

- [ ] **10.9.2** Quick export shortcuts (optional):
  - Ctrl+Shift+J: Quick export to JSON
  - Ctrl+Shift+G: Quick export to glTF
  - Uses last-used options

### Unit Tests

- [ ] Shortcut opens export dialog

---

## Integration Tests

**File**: `tests/integration/export.integration.test.tsx`

### Test Cases

- [ ] **JSON round-trip**: Export JSON → Import JSON → Verify identical
- [ ] **glTF structure**: Export glTF → Parse → Verify scene structure
- [ ] **PDF generation**: Export PDF → Verify blob size > 0
- [ ] **Screenshot dimensions**: Export screenshot → Verify dimensions match options
- [ ] **Batch export**: Export ZIP → Extract → Verify all files present
- [ ] **Error handling**: Export with invalid data → Verify error shown

---

## Acceptance Criteria

- [ ] JSON export creates valid, re-importable file
- [ ] glTF export creates valid 3D model
- [ ] PDF export creates printable document with floorplan
- [ ] Screenshot export captures 2D and 3D views
- [ ] Export dialog shows all options
- [ ] Progress indicator for long exports
- [ ] Error handling with user-friendly messages
- [ ] Keyboard shortcut works
- [ ] Unit test coverage > 85%

---

## Files Created

```
src/
├── services/
│   └── export/
│       ├── index.ts
│       ├── jsonExport.ts
│       ├── gltfExport.ts
│       ├── pdfExport.ts
│       ├── screenshotExport.ts
│       └── batchExport.ts
├── components/
│   └── dialogs/
│       └── ExportDialog.tsx
└── hooks/
    └── useExport.ts

tests/
├── unit/
│   └── services/
│       └── export/
│           ├── jsonExport.test.ts
│           ├── gltfExport.test.ts
│           └── pdfExport.test.ts
└── integration/
    └── export.integration.test.tsx
```
