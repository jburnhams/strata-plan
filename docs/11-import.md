# Section 11: Import System

> **Priority**: Medium - Enables loading external floorplans.
>
> **Phase**: MVP (Phase 1) for JSON, Phase 3+ for advanced formats
>
> **Dependencies**:
> - Section 01 (data model)
> - Section 09 (storage for saving imported projects)
>
> **Parallel Work**: Can run in parallel with other sections.

---

## Overview

The import system allows users to load floorplans from external files. JSON import (re-importing exported files) is essential for MVP. Advanced formats like glTF parsing and PDF tracing are future enhancements.

---

## Task 11.1: Import Service Architecture

**File**: `src/services/import/index.ts`

### Subtasks

- [ ] **11.1.1** Create import service interface:
  ```typescript
  interface ImportService {
    importJSON(file: File): Promise<ImportResult>
    importGLTF(file: File): Promise<ImportResult>  // Phase 3
    detectFormat(file: File): ImportFormat
    validateImport(data: unknown): ValidationResult
  }

  interface ImportResult {
    success: boolean
    floorplan?: Floorplan
    warnings?: string[]
    errors?: string[]
  }

  type ImportFormat = 'json' | 'gltf' | 'unknown'
  ```

- [ ] **11.1.2** Create unified import function:
  ```typescript
  async function importFloorplan(file: File): Promise<ImportResult>
  ```
  - Detect format from file extension/content
  - Route to appropriate parser
  - Validate result

- [ ] **11.1.3** File reading utilities:
  ```typescript
  async function readFileAsText(file: File): Promise<string>
  async function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer>
  ```

### Unit Tests

- [ ] Format detection works by extension
- [ ] File reading returns content
- [ ] Unknown format handled gracefully

---

## Task 11.2: JSON Import

**File**: `src/services/import/jsonImport.ts`

### Subtasks

- [ ] **11.2.1** Implement JSON import:
  ```typescript
  async function importFromJSON(file: File): Promise<ImportResult>
  ```
  - Read file as text
  - Parse JSON
  - Extract floorplan data
  - Validate structure

- [ ] **11.2.2** Handle export wrapper:
  - Check for `exportedFrom` metadata
  - Extract `floorplan` property if wrapped
  - Handle bare floorplan object

- [ ] **11.2.3** Validate imported data:
  ```typescript
  function validateFloorplanData(data: unknown): ValidationResult
  ```
  - Check required fields exist
  - Validate data types
  - Check value ranges
  - Return list of issues

- [ ] **11.2.4** Handle version differences:
  - Check schemaVersion
  - Run migrations if needed (from Section 09)
  - Warn if version is newer than app

- [ ] **11.2.5** Generate new IDs:
  - Option to regenerate all UUIDs
  - Prevents ID conflicts with existing projects

- [ ] **11.2.6** Error handling:
  - Invalid JSON syntax → "Invalid JSON file"
  - Missing required fields → List missing fields
  - Wrong data types → "Expected number for length, got string"

### Unit Tests

- [ ] Valid JSON imports successfully
- [ ] Invalid JSON returns error
- [ ] Missing fields detected
- [ ] Version migration triggered
- [ ] New IDs generated when requested

---

## Task 11.3: Import Validation

**File**: `src/services/import/validation.ts`

### Subtasks

- [ ] **11.3.1** Create comprehensive validator:
  ```typescript
  function validateImportedFloorplan(data: unknown): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []
    // ... validation logic
    return { valid: errors.length === 0, errors, warnings }
  }
  ```

- [ ] **11.3.2** Validate floorplan structure:
  - `id`: string, required
  - `name`: string, required
  - `units`: 'meters' | 'feet', required
  - `rooms`: array, required
  - `createdAt`: valid date string
  - `updatedAt`: valid date string

- [ ] **11.3.3** Validate each room:
  - Required: id, name, length, width, height, type, position
  - length, width, height: positive numbers
  - type: valid RoomType value
  - position: object with x, z numbers

- [ ] **11.3.4** Validate doors and windows:
  - Required fields present
  - Position in valid range (0-1)
  - Dimensions positive

- [ ] **11.3.5** Validate connections:
  - Referenced room IDs exist
  - Wall sides valid

- [ ] **11.3.6** Check for data consistency:
  - No duplicate IDs
  - All referenced IDs exist
  - No overlapping rooms (warning)

### Unit Tests

- [ ] Valid data passes validation
- [ ] Missing field detected
- [ ] Invalid type detected
- [ ] Duplicate ID detected
- [ ] Orphan reference detected

---

## Task 11.4: glTF Import (Advanced)

**File**: `src/services/import/gltfImport.ts`

### Subtasks

- [ ] **11.4.1** Parse glTF file:
  ```typescript
  async function importFromGLTF(file: File): Promise<ImportResult>
  ```
  - Use Three.js GLTFLoader
  - Parse scene structure

- [ ] **11.4.2** Extract rooms from meshes:
  - Identify room meshes by name pattern
  - Calculate dimensions from bounding box
  - Extract position from mesh position

- [ ] **11.4.3** Heuristic room detection:
  - Group meshes that form enclosed spaces
  - Detect floor planes
  - Calculate room bounds from walls

- [ ] **11.4.4** Limitations and warnings:
  - May not perfectly reconstruct original
  - Warn about approximations
  - Manual adjustment may be needed

- [ ] **11.4.5** Handle non-StrataPlan glTF:
  - Generic 3D model import
  - Best-effort room extraction
  - Clear warning about limitations

### Unit Tests

- [ ] StrataPlan glTF imports correctly
- [ ] Room names extracted from mesh names
- [ ] Dimensions calculated from geometry
- [ ] Non-StrataPlan handled gracefully

---

## Task 11.5: Import Dialog UI

**File**: `src/components/dialogs/ImportDialog.tsx`

### Subtasks

- [ ] **11.5.1** Create import dialog:
  - Opens from File menu or Import button
  - Drag-and-drop zone
  - File browser button

- [ ] **11.5.2** Drag-and-drop zone:
  ```typescript
  interface DropZoneProps {
    onFileDrop: (file: File) => void
    acceptedTypes: string[]
  }
  ```
  - Visual feedback on drag over
  - Shows accepted file types
  - Handles multiple files (use first)

- [ ] **11.5.3** File browser:
  - Button to open file picker
  - Filter by accepted types (.json, .gltf, .glb)

- [ ] **11.5.4** File preview:
  - Show filename and size
  - Detect format
  - Show format icon

- [ ] **11.5.5** Validation display:
  - Show validation errors in red
  - Show warnings in yellow
  - List all issues

- [ ] **11.5.6** Import options:
  - "Replace current project" vs "Create new project"
  - Checkbox: "Generate new IDs"

- [ ] **11.5.7** Import button:
  - Disabled until valid file selected
  - Shows progress during import
  - "Import" text changes to "Importing..."

- [ ] **11.5.8** Confirmation for replace:
  - If replacing, confirm: "This will replace your current project"

### Unit Tests

- [ ] Drop zone accepts valid files
- [ ] Drop zone rejects invalid types
- [ ] Validation errors displayed
- [ ] Import button disabled when invalid

---

## Task 11.6: Import Hook

**File**: `src/hooks/useImport.ts`

### Subtasks

- [ ] **11.6.1** Create import hook:
  ```typescript
  function useImport(): {
    importFile: (file: File, options?: ImportOptions) => Promise<ImportResult>
    isImporting: boolean
    progress: number
    error: Error | null
    validationResult: ValidationResult | null
  }
  ```

- [ ] **11.6.2** Handle import flow:
  - Validate file
  - Parse content
  - Validate data
  - Create/replace project
  - Update store

- [ ] **11.6.3** Progress tracking:
  - Report progress for large files
  - Stages: reading, parsing, validating, saving

- [ ] **11.6.4** Error handling:
  - File read errors
  - Parse errors
  - Validation errors
  - Storage errors

### Unit Tests

- [ ] Import hook processes file
- [ ] Progress updates during import
- [ ] Errors captured and reported

---

## Task 11.7: Import from URL (Optional)

**File**: `src/services/import/urlImport.ts`

### Subtasks

- [ ] **11.7.1** Import from URL:
  ```typescript
  async function importFromURL(url: string): Promise<ImportResult>
  ```
  - Fetch file from URL
  - Detect format from content-type or extension
  - Process as normal import

- [ ] **11.7.2** URL input in dialog:
  - Tab or section for URL import
  - URL input field
  - "Load" button

- [ ] **11.7.3** CORS handling:
  - Note that CORS may block some URLs
  - Error message for CORS failures
  - Suggest downloading file manually

### Unit Tests

- [ ] URL import fetches and processes
- [ ] Invalid URL handled
- [ ] CORS error handled gracefully

---

## Task 11.8: Recent Imports

**File**: `src/services/import/history.ts`

### Subtasks

- [ ] **11.8.1** Track import history:
  - Store last 10 import filenames
  - Store import timestamps
  - Stored in user settings

- [ ] **11.8.2** Display in import dialog:
  - "Recent imports" section
  - Filename and date
  - Note: Can't re-import from history (file not stored)

### Unit Tests

- [ ] Import history updated on import
- [ ] History limited to 10 entries
- [ ] Oldest entries removed

---

## Task 11.9: Sample/Demo Projects

**File**: `src/services/import/samples.ts`, `public/samples/`

### Subtasks

- [ ] **11.9.1** Create sample project files:
  - `studio-apartment.json`: Simple 1-room
  - `two-bedroom.json`: 5-room layout
  - `office-space.json`: Open floor plan
  - Store in `public/samples/`

- [ ] **11.9.2** Load sample projects:
  ```typescript
  async function loadSampleProject(sampleId: string): Promise<Floorplan>
  ```
  - Fetch from public folder
  - Parse and validate
  - Return floorplan

- [ ] **11.9.3** Sample selector in landing page:
  - "Try a demo" button
  - Dropdown of sample projects
  - Loads directly into editor

- [ ] **11.9.4** Sample selector in import dialog:
  - Section: "Or try a sample project"
  - List of available samples

### Unit Tests

- [ ] Sample projects load correctly
- [ ] Sample files are valid JSON
- [ ] All samples pass validation

---

## Integration Tests

**File**: `tests/integration/import.integration.test.tsx`

### Test Cases

- [ ] **JSON round-trip**: Export → Import → Verify identical
- [ ] **Drop zone interaction**: Simulate file drop → Verify import triggered
- [ ] **Validation flow**: Import invalid file → Verify errors shown
- [ ] **Replace project**: Import with replace → Verify old project replaced
- [ ] **New project**: Import as new → Verify new project created
- [ ] **Sample loading**: Load sample → Verify renders correctly

---

## Acceptance Criteria

- [ ] JSON files import successfully
- [ ] Validation catches invalid files with helpful errors
- [ ] Drag-and-drop works
- [ ] File browser works
- [ ] Replace vs new project option works
- [ ] Sample projects load
- [ ] Import progress shown
- [ ] Error handling is user-friendly
- [ ] Unit test coverage > 85%

---

## Files Created

```
src/
├── services/
│   └── import/
│       ├── index.ts
│       ├── jsonImport.ts
│       ├── gltfImport.ts
│       ├── validation.ts
│       ├── urlImport.ts
│       ├── history.ts
│       └── samples.ts
├── components/
│   └── dialogs/
│       └── ImportDialog.tsx
├── hooks/
│   └── useImport.ts
└── public/
    └── samples/
        ├── studio-apartment.json
        ├── two-bedroom.json
        └── office-space.json

tests/
├── unit/
│   └── services/
│       └── import/
│           ├── jsonImport.test.ts
│           └── validation.test.ts
└── integration/
    └── import.integration.test.tsx
```
