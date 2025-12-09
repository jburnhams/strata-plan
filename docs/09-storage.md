# Section 09: Storage & Persistence

> **Priority**: High - Essential for saving and loading projects.
>
> **Phase**: MVP (Phase 1)
>
> **Dependencies**:
> - Section 01 (data model for serialization)
>
> **Parallel Work**: Can run in parallel with UI and rendering sections.

---

## Overview

This section implements client-side persistence using IndexedDB. All project data is stored locally in the browser, enabling offline functionality. The storage layer handles auto-save, manual save, project listing, and data migration for schema changes.

---

## Task 9.1: IndexedDB Setup

**File**: `src/services/storage/database.ts`

### Subtasks

- [x] **9.1.1** Install IndexedDB wrapper:
  ```bash
  npm install idb
  ```
  The `idb` library provides a Promise-based wrapper around IndexedDB.

- [x] **9.1.2** Define database schema:
  ```typescript
  interface StrataPlanDB extends DBSchema {
    projects: {
      key: string  // project ID
      value: StoredProject
      indexes: {
        'by-updated': Date
        'by-name': string
      }
    }
    settings: {
      key: string
      value: unknown
    }
  }

  interface StoredProject {
    id: string
    name: string
    data: SerializedFloorplan
    thumbnail?: string  // base64 data URL
    createdAt: Date
    updatedAt: Date
    version: string  // schema version
  }
  ```

- [x] **9.1.3** Create database initialization:
  ```typescript
  async function initDatabase(): Promise<IDBPDatabase<StrataPlanDB>>
  ```
  - Database name: `strataplan-db`
  - Version: 1 (increment on schema changes)
  - Create object stores and indexes

- [x] **9.1.4** Handle database versioning:
  - onupgradeneeded callback for migrations
  - Create stores if not exist
  - Run migrations for version bumps

- [x] **9.1.5** Export database instance:
  - Singleton pattern
  - Lazy initialization

### Unit Tests (`tests/unit/services/storage/database.test.ts`)

- [x] Database initializes without error
- [x] Object stores created correctly
- [x] Indexes created correctly
- [x] Re-initialization returns same instance

---

## Task 9.2: Project Serialization

**File**: `src/services/storage/serialization.ts`

### Subtasks

- [x] **9.2.1** Create serialization function:
  ```typescript
  function serializeFloorplan(floorplan: Floorplan): SerializedFloorplan
  ```
  - Converts Floorplan to JSON-safe format
  - Converts Date objects to ISO strings
  - Handles undefined optional values

- [x] **9.2.2** Create deserialization function:
  ```typescript
  function deserializeFloorplan(data: SerializedFloorplan): Floorplan
  ```
  - Converts JSON back to Floorplan
  - Parses ISO strings to Date objects
  - Validates data structure

- [x] **9.2.3** Define SerializedFloorplan type:
  - Mirror of Floorplan but JSON-safe
  - Dates as strings
  - All properties defined (no undefined)

- [x] **9.2.4** Version tagging:
  - Add `version` field to serialized data
  - Current version: "1.0.0"
  - Used for migration detection

- [x] **9.2.5** Validation on deserialize:
  - Check required fields exist
  - Validate data types
  - Return errors if invalid

### Unit Tests

- [x] Serialization produces valid JSON
- [x] Deserialization restores original structure
- [x] Round-trip maintains data integrity
- [x] Dates serialize/deserialize correctly
- [x] Invalid data throws/returns error

---

## Task 9.3: CRUD Operations

**File**: `src/services/storage/projectStorage.ts`

### Subtasks

- [x] **9.3.1** Create project:
  ```typescript
  async function saveProject(floorplan: Floorplan): Promise<void>
  ```
  - Serialize floorplan
  - Generate thumbnail (optional)
  - Store in IndexedDB
  - Update timestamps

- [x] **9.3.2** Read project:
  ```typescript
  async function loadProject(id: string): Promise<Floorplan | null>
  ```
  - Fetch from IndexedDB
  - Deserialize
  - Run migrations if needed
  - Return null if not found

- [x] **9.3.3** Update project:
  ```typescript
  async function updateProject(id: string, floorplan: Floorplan): Promise<void>
  ```
  - Update existing record
  - Update updatedAt timestamp

- [x] **9.3.4** Delete project:
  ```typescript
  async function deleteProject(id: string): Promise<void>
  ```
  - Remove from IndexedDB
  - Confirm deletion succeeded

- [x] **9.3.5** List projects:
  ```typescript
  async function listProjects(): Promise<ProjectMetadata[]>
  ```
  - Return all projects with metadata
  - Sorted by updatedAt (newest first)
  - Doesn't load full floorplan data

- [x] **9.3.6** Check project exists:
  ```typescript
  async function projectExists(id: string): Promise<boolean>
  ```

### Unit Tests

- [x] Save stores project correctly
- [x] Load retrieves saved project
- [x] Update modifies existing project
- [x] Delete removes project
- [x] List returns all projects sorted
- [x] Non-existent project returns null

---

## Task 9.4: Auto-Save System

**File**: `src/hooks/useAutoSave.ts`

### Subtasks

- [x] **9.4.1** Create auto-save hook:
  ```typescript
  function useAutoSave(floorplan: Floorplan | null, enabled: boolean): AutoSaveState

  interface AutoSaveState {
    status: 'idle' | 'saving' | 'saved' | 'error'
    lastSaved: Date | null
    error: Error | null
  }
  ```

- [x] **9.4.2** Implement debounced save:
  - Save triggers 30 seconds after last change
  - Or immediately on specific events (project close)
  - Cancel pending save if new changes occur

- [x] **9.4.3** Track dirty state:
  - Subscribe to store changes
  - Set dirty flag on any mutation
  - Clear dirty flag after successful save

- [x] **9.4.4** Update save status in UI store:
  - `uiStore.saveStatus`: 'saved' | 'saving' | 'error' | 'unsaved'
  - `uiStore.lastSaveTime`: Date

- [x] **9.4.5** Handle save errors:
  - Retry once on failure
  - Update status to 'error' if retry fails
  - Log error for debugging

- [x] **9.4.6** Prevent data loss:
  - beforeunload event handler
  - Warn if unsaved changes: "You have unsaved changes"

### Unit Tests

- [x] Auto-save triggers after delay
- [x] Rapid changes debounce correctly
- [x] Error state set on failure
- [x] Dirty flag cleared after save

---

## Task 9.5: Manual Save Operations

**File**: `src/services/storage/saveOperations.ts`

### Subtasks

- [x] **9.5.1** Implement manual save:
  ```typescript
  async function saveNow(): Promise<void>
  ```
  - Immediate save, bypasses debounce
  - Updates status during save

- [x] **9.5.2** Implement save-as:
  ```typescript
  async function saveAs(newName: string): Promise<string>
  ```
  - Creates new project with new ID
  - Keeps original project unchanged
  - Returns new project ID

- [x] **9.5.3** Implement revert:
  ```typescript
  async function revertToSaved(projectId: string): Promise<Floorplan>
  ```
  - Reloads project from storage
  - Discards unsaved changes
  - Confirmation dialog before revert

- [ ] **9.5.4** Keyboard shortcut:
  - Ctrl+S triggers manual save
  - Toast: "Project saved"

### Unit Tests

- [x] Manual save stores immediately
- [x] Save-as creates new project
- [x] Revert loads last saved version

---

## Task 9.6: Project Thumbnail Generation

**File**: `src/services/storage/thumbnails.ts`

### Subtasks

- [x] **9.6.1** Generate 2D thumbnail:
  ```typescript
  async function generateThumbnail(floorplan: Floorplan): Promise<string>
  ```
  - Render rooms to off-screen canvas
  - Scale to thumbnail size (200×150)
  - Return as data URL

- [x] **9.6.2** Configure thumbnail appearance:
  - White background
  - Room colors as fill
  - No labels or UI elements
  - Fit all rooms with padding

- [x] **9.6.3** Generate on save:
  - Update thumbnail when project saved
  - Asynchronous, doesn't block save

- [x] **9.6.4** Handle empty projects:
  - Return placeholder image
  - Or: null (show default icon in list)

### Unit Tests

- [x] Thumbnail generated as data URL
- [x] Thumbnail has correct dimensions
- [x] Empty project returns placeholder

---

## Task 9.7: Data Migration System

**File**: `src/services/storage/migrations.ts`

### Subtasks

- [ ] **9.7.1** Create migration framework:
  ```typescript
  interface Migration {
    fromVersion: string
    toVersion: string
    migrate: (data: unknown) => unknown
  }

  const MIGRATIONS: Migration[] = [
    // Add migrations as schema evolves
  ]
  ```

- [ ] **9.7.2** Implement migration runner:
  ```typescript
  function migrateData(data: unknown, fromVersion: string, toVersion: string): unknown
  ```
  - Find migration path
  - Run migrations in sequence
  - Return migrated data

- [ ] **9.7.3** Trigger migration on load:
  - Check stored version vs current
  - Run migrations if version mismatch
  - Save migrated data back

- [ ] **9.7.4** Handle migration errors:
  - Log error details
  - Offer to export raw data for recovery
  - Don't corrupt original data

- [ ] **9.7.5** Example migration (for future):
  ```typescript
  // v1.0.0 → v1.1.0: Add floorMaterial to rooms
  {
    fromVersion: '1.0.0',
    toVersion: '1.1.0',
    migrate: (data) => ({
      ...data,
      rooms: data.rooms.map(room => ({
        ...room,
        floorMaterial: room.floorMaterial ?? 'hardwood'
      }))
    })
  }
  ```

### Unit Tests

- [ ] Migration transforms data correctly
- [ ] Multiple migrations run in sequence
- [ ] Unknown version handled gracefully

---

## Task 9.8: User Settings Storage

**File**: `src/services/storage/settingsStorage.ts`

### Subtasks

- [ ] **9.8.1** Define settings schema:
  ```typescript
  interface UserSettings {
    theme: 'light' | 'dark' | 'system'
    defaultUnits: 'meters' | 'feet'
    showGrid: boolean
    gridSize: number
    snapToGrid: boolean
    autoSaveEnabled: boolean
    autoSaveInterval: number
    materialQuality: 'simple' | 'standard' | 'detailed'
    colorScheme: string
    recentProjects: string[]  // Last 5 project IDs
  }
  ```

- [ ] **9.8.2** Save settings:
  ```typescript
  async function saveSettings(settings: Partial<UserSettings>): Promise<void>
  ```
  - Merge with existing settings
  - Store in IndexedDB 'settings' store

- [ ] **9.8.3** Load settings:
  ```typescript
  async function loadSettings(): Promise<UserSettings>
  ```
  - Return stored settings
  - Apply defaults for missing values

- [ ] **9.8.4** Sync with UI store:
  - Load settings into uiStore on app start
  - Save settings when uiStore changes

- [ ] **9.8.5** Recent projects tracking:
  - Update on project open
  - Keep last 5 projects
  - Remove deleted projects from list

### Unit Tests

- [ ] Settings save and load correctly
- [ ] Defaults applied for missing settings
- [ ] Recent projects list maintains limit

---

## Task 9.9: Storage Quota Management

**File**: `src/services/storage/quota.ts`

### Subtasks

- [ ] **9.9.1** Check available storage:
  ```typescript
  async function getStorageInfo(): Promise<{ used: number; available: number }>
  ```
  - Use StorageManager API if available
  - Fallback to estimation

- [ ] **9.9.2** Monitor storage usage:
  - Calculate current usage
  - Warn if approaching quota (>80%)

- [ ] **9.9.3** Storage warning UI:
  - Toast when storage is low
  - Suggest exporting/deleting old projects

- [ ] **9.9.4** Clear old data (optional):
  - Option to delete oldest projects
  - Confirm before deletion
  - Export option before delete

### Unit Tests

- [ ] Storage info returns values
- [ ] Warning triggers at threshold

---

## Task 9.10: Storage Service Integration

**File**: `src/services/storage/index.ts`, integration with stores

### Subtasks

- [ ] **9.10.1** Create unified storage service:
  ```typescript
  const storageService = {
    projects: projectStorage,
    settings: settingsStorage,
    init: initDatabase,
    migrate: migrateData,
  }
  ```

- [ ] **9.10.2** Initialize on app start:
  - Call in App.tsx or main.tsx
  - Load settings into stores
  - Handle initialization errors

- [ ] **9.10.3** Create storage hooks:
  ```typescript
  useProject(id: string): { project: Floorplan | null, loading: boolean, error: Error | null }
  useProjectList(): { projects: ProjectMetadata[], loading: boolean }
  ```

- [ ] **9.10.4** Error handling:
  - IndexedDB not available (private browsing)
  - Quota exceeded
  - Corruption detected

### Unit Tests

- [ ] Service initializes correctly
- [ ] Hooks return loading states
- [ ] Errors propagate correctly

---

## Integration Tests

**File**: `tests/integration/storage.integration.test.ts`

### Test Cases

- [ ] **Full lifecycle**: Create project → save → reload page (simulated) → load → verify data
- [ ] **Auto-save**: Make changes → wait for auto-save → verify saved
- [ ] **Multiple projects**: Save 3 projects → list → verify all present
- [ ] **Delete cascade**: Delete project → verify removed from list
- [ ] **Settings persistence**: Change settings → reload → verify restored
- [ ] **Migration**: Load old version data → verify migrated correctly

Note: IndexedDB testing may require `fake-indexeddb` package for Jest.

---

## Acceptance Criteria

- [ ] Projects save to IndexedDB successfully
- [ ] Projects load and restore completely
- [ ] Auto-save works without data loss
- [ ] Manual save (Ctrl+S) works
- [ ] Project list shows all saved projects
- [ ] Delete removes project permanently
- [ ] Settings persist across sessions
- [ ] Data migration handles version changes
- [ ] Storage errors handled gracefully
- [ ] Unit test coverage > 85%

---

## Files Created

```
src/
└── services/
    └── storage/
        ├── index.ts
        ├── database.ts
        ├── serialization.ts
        ├── projectStorage.ts
        ├── settingsStorage.ts
        ├── thumbnails.ts
        ├── migrations.ts
        └── quota.ts
├── hooks/
│   ├── useAutoSave.ts
│   ├── useProject.ts
│   └── useProjectList.ts

tests/
├── unit/
│   └── services/
│       └── storage/
│           ├── database.test.ts
│           ├── serialization.test.ts
│           ├── projectStorage.test.ts
│           └── migrations.test.ts
└── integration/
    └── storage.integration.test.ts
```
