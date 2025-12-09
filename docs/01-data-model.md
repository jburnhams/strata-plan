# Section 01: Core Data Model & State Management

> **Priority**: CRITICAL - Complete this section first. All other sections depend on it.
>
> **Phase**: MVP (Phase 1)
>
> **Dependencies**: None (foundation)
>
> **Parallel Work**: Once Task 1.1 types are complete, Tasks 1.2-1.4 can proceed in parallel.

---

## Overview

This section establishes the TypeScript type system and Zustand state management that powers the entire application. The data model must support both table-based input (quick start) and canvas-based editing while maintaining spatial relationships between rooms.

---

## Task 1.1: Core TypeScript Types ✅

**File**: `src/types/index.ts` (re-exports), `src/types/floorplan.ts`, `src/types/room.ts`, `src/types/geometry.ts`

### Subtasks

- [x] **1.1.1** Create `RoomType` enum with values: `bedroom`, `kitchen`, `bathroom`, `living`, `dining`, `office`, `hallway`, `closet`, `garage`, `other`

- [x] **1.1.2** Create `MeasurementUnit` type: `'meters' | 'feet'`

- [x] **1.1.3** Create `WallSide` type: `'north' | 'south' | 'east' | 'west'`

- [x] **1.1.4** Create `Position2D` interface with `x: number` and `z: number` properties

- [x] **1.1.5** Create `BoundingBox` interface:
  ```
  minX, maxX, minZ, maxZ: number
  ```

- [x] **1.1.6** Create `Room` interface:
  - `id: string` (UUID)
  - `name: string` (max 100 chars)
  - `length: number` (X dimension, min 0.1)
  - `width: number` (Z dimension, min 0.1)
  - `height: number` (ceiling, default 2.7, range 1.5-4.0)
  - `type: RoomType`
  - `position: Position2D` (top-left corner in world space)
  - `rotation: 0 | 90 | 180 | 270` (degrees)
  - `color?: string` (hex override)
  - `material?: FloorMaterial`
  - `wallMaterial?: WallMaterial`

- [x] **1.1.7** Create `Wall` interface for canvas-drawn walls:
  - `id: string`
  - `from: Position2D`
  - `to: Position2D`
  - `thickness: number` (default 0.2m)
  - `material?: WallMaterial`

- [x] **1.1.8** Create `Door` interface:
  - `id: string`
  - `connectionId?: string` (link to RoomConnection)
  - `roomId: string`
  - `wallSide: WallSide`
  - `position: number` (0.0-1.0 along wall)
  - `width: number` (default 0.9m)
  - `height: number` (default 2.1m)
  - `type: 'single' | 'double' | 'sliding' | 'pocket' | 'bifold'`
  - `swing: 'inward' | 'outward'`
  - `handleSide: 'left' | 'right'`

- [x] **1.1.9** Create `Window` interface:
  - `id: string`
  - `roomId: string`
  - `wallSide: WallSide`
  - `position: number` (0.0-1.0 along wall)
  - `width: number` (default 1.2m)
  - `height: number` (default 1.2m)
  - `sillHeight: number` (default 0.9m from floor)
  - `frameType: 'single' | 'double' | 'triple'`
  - `material?: WindowMaterial`

- [x] **1.1.10** Create `RoomConnection` interface:
  - `id: string`
  - `room1Id: string`
  - `room2Id: string`
  - `room1Wall: WallSide`
  - `room2Wall: WallSide`
  - `sharedWallLength: number`
  - `doors: string[]` (door IDs)

- [x] **1.1.11** Create `Floorplan` interface:
  - `id: string`
  - `name: string` (max 100 chars)
  - `units: MeasurementUnit`
  - `rooms: Room[]`
  - `walls: Wall[]` (for canvas mode)
  - `doors: Door[]`
  - `windows: Window[]`
  - `connections: RoomConnection[]`
  - `createdAt: Date`
  - `updatedAt: Date`
  - `version: string` (schema version for migrations)

- [x] **1.1.12** Create `FloorplanMetadata` interface (for project list):
  - `id: string`
  - `name: string`
  - `roomCount: number`
  - `totalArea: number`
  - `updatedAt: Date`
  - `thumbnailDataUrl?: string`

- [x] **1.1.13** Create material types:
  - `FloorMaterial`: `'wood' | 'tile' | 'carpet' | 'concrete' | 'laminate' | 'stone'`
  - `WallMaterial`: `'drywall' | 'brick' | 'wood' | 'concrete' | 'stone'`
  - `WindowMaterial`: `'wood' | 'aluminum' | 'pvc'`

- [x] **1.1.14** Create `EditorMode` type: `'table' | 'canvas' | 'view3d'`

- [x] **1.1.15** Create barrel export in `src/types/index.ts`

### Unit Tests (`tests/unit/types/`)

- [x] Type guards: `isRoom()`, `isFloorplan()`, `isValidRoomType()`
- [x] Validation: Room dimensions within bounds
- [x] Validation: Position coordinates are numbers
- [x] UUID format validation helper

---

## Task 1.2: Geometry Utility Functions ✅

**File**: `src/services/geometry/index.ts`, `src/services/geometry/room.ts`, `src/services/geometry/bounds.ts`

### Subtasks

- [x] **1.2.1** Create `generateUUID(): string` using crypto.randomUUID with fallback

- [x] **1.2.2** Create `calculateArea(length: number, width: number): number`

- [x] **1.2.3** Create `calculateVolume(length: number, width: number, height: number): number`

- [x] **1.2.4** Create `calculatePerimeter(length: number, width: number): number`

- [x] **1.2.5** Create `getRoomCenter(room: Room): Position2D`
  - Returns center point based on position, length, width

- [x] **1.2.6** Create `getRoomBounds(room: Room): BoundingBox`
  - Accounts for position and dimensions
  - Handles rotation (0, 90, 180, 270)

- [x] **1.2.7** Create `getRoomCorners(room: Room): Position2D[]`
  - Returns 4 corners in clockwise order
  - Accounts for rotation

- [x] **1.2.8** Create `getRoomWallSegments(room: Room): WallSegment[]`
  - Returns 4 wall segments with start/end positions and wall side

- [x] **1.2.9** Create `doRoomsOverlap(room1: Room, room2: Room): boolean`
  - AABB collision detection
  - Returns true if bounding boxes overlap (not just touch)

- [x] **1.2.10** Create `getWallLength(room: Room, side: WallSide): number`
  - Returns length or width based on wall side and rotation

- [x] **1.2.11** Create `worldToLocal(point: Position2D, room: Room): Position2D`
  - Converts world coordinates to room-local coordinates

- [x] **1.2.12** Create `localToWorld(point: Position2D, room: Room): Position2D`
  - Converts room-local coordinates to world coordinates

- [x] **1.2.13** Create `snapToGrid(value: number, gridSize: number): number`
  - Rounds to nearest grid increment

- [x] **1.2.14** Create `clamp(value: number, min: number, max: number): number`

### Unit Tests (`tests/unit/services/geometry/`)

- [x] `calculateArea` returns correct area for various dimensions
- [x] `calculateVolume` handles height correctly
- [x] `getRoomCenter` calculates center for positioned rooms
- [x] `getRoomBounds` handles all rotation values
- [x] `doRoomsOverlap` detects overlapping rooms
- [x] `doRoomsOverlap` returns false for adjacent (touching) rooms
- [x] `doRoomsOverlap` returns false for separated rooms
- [x] `snapToGrid` snaps to 0.1m, 0.5m, 1m grids
- [x] `getRoomCorners` returns clockwise corners for rotated rooms

---

## Task 1.3: Zustand Floorplan Store ✅

**File**: `src/stores/floorplanStore.ts`

### Subtasks

- [x] **1.3.1** Install Zustand: `npm install zustand`

- [x] **1.3.2** Create store interface `FloorplanState`:
  ```
  currentFloorplan: Floorplan | null
  selectedRoomId: string | null
  selectedWallId: string | null
  selectedDoorId: string | null
  selectedWindowId: string | null
  editorMode: EditorMode
  isDirty: boolean
  ```

- [x] **1.3.3** Create store actions interface `FloorplanActions`:
  ```
  // Floorplan CRUD
  createFloorplan(name: string, units: MeasurementUnit): Floorplan
  loadFloorplan(floorplan: Floorplan): void
  clearFloorplan(): void

  // Room operations
  addRoom(room: Omit<Room, 'id'>): Room
  updateRoom(id: string, updates: Partial<Room>): void
  deleteRoom(id: string): void

  // Selection
  selectRoom(id: string | null): void
  selectWall(id: string | null): void
  selectDoor(id: string | null): void
  selectWindow(id: string | null): void
  clearSelection(): void

  // Editor mode
  setEditorMode(mode: EditorMode): void

  // Dirty state
  markDirty(): void
  markClean(): void
  ```

- [x] **1.3.4** Implement `createFloorplan` action:
  - Generate UUID for floorplan
  - Set createdAt and updatedAt to now
  - Initialize empty arrays for rooms, walls, doors, windows, connections
  - Set version to "1.0.0"

- [x] **1.3.5** Implement `addRoom` action:
  - Generate UUID for room
  - Apply defaults for missing optional fields
  - Auto-calculate position if not provided (left-to-right layout)
  - Add to rooms array
  - Mark dirty

- [x] **1.3.6** Implement `updateRoom` action:
  - Find room by ID
  - Merge updates with existing room
  - Update floorplan's updatedAt
  - Mark dirty

- [x] **1.3.7** Implement `deleteRoom` action:
  - Remove room from array
  - Remove associated doors and windows
  - Remove connections involving this room
  - Clear selection if deleted room was selected
  - Mark dirty

- [x] **1.3.8** Implement selection actions with mutual exclusivity:
  - Selecting a room clears wall/door/window selection
  - Only one item can be selected at a time

- [x] **1.3.9** Create `useFloorplanStore` hook with selector support

- [x] **1.3.10** Add computed getters:
  - `getTotalArea(): number`
  - `getTotalVolume(): number`
  - `getRoomCount(): number`
  - `getSelectedRoom(): Room | null`
  - `getRoomById(id: string): Room | undefined`

### Unit Tests (`tests/unit/stores/floorplanStore.test.ts`)

- [x] `createFloorplan` initializes with correct defaults
- [x] `addRoom` generates unique IDs
- [x] `addRoom` auto-positions rooms when position not provided
- [x] `updateRoom` merges partial updates correctly
- [x] `updateRoom` with invalid ID is no-op
- [x] `deleteRoom` removes room and clears selection
- [x] `deleteRoom` removes associated doors/windows
- [x] Selection is mutually exclusive
- [x] `clearSelection` resets all selection states
- [x] `getTotalArea` sums all room areas
- [x] Dirty flag set on mutations, cleared on markClean

---

## Task 1.4: Zustand UI Store ✅

**File**: `src/stores/uiStore.ts`

### Subtasks

- [x] **1.4.1** Create store interface `UIState`:
  ```
  theme: 'light' | 'dark' | 'system'
  sidebarOpen: boolean
  propertiesPanelOpen: boolean
  showGrid: boolean
  gridSize: number (0.1, 0.5, or 1.0)
  snapToGrid: boolean
  showRoomLabels: boolean
  showMeasurements: boolean
  zoomLevel: number (0.25 to 4.0)
  panOffset: Position2D
  saveStatus: 'saved' | 'saving' | 'error' | 'unsaved'
  lastSaveTime: Date | null
  ```

- [x] **1.4.2** Create UI actions:
  ```
  setTheme(theme): void
  toggleSidebar(): void
  togglePropertiesPanel(): void
  toggleGrid(): void
  setGridSize(size: number): void
  toggleSnapToGrid(): void
  toggleRoomLabels(): void
  toggleMeasurements(): void
  setZoom(level: number): void
  zoomIn(): void
  zoomOut(): void
  resetZoom(): void
  setPan(offset: Position2D): void
  resetPan(): void
  setSaveStatus(status): void
  ```

- [x] **1.4.3** Implement zoom with bounds checking (0.25 to 4.0)

- [x] **1.4.4** Implement `zoomIn`/`zoomOut` with standard increments (×1.25)

- [x] **1.4.5** Create `useUIStore` hook

- [x] **1.4.6** Add persistence middleware for user preferences:
  - Persist theme, gridSize, snapToGrid, showGrid to localStorage
  - Load on app startup

### Unit Tests (`tests/unit/stores/uiStore.test.ts`)

- [x] Theme changes correctly
- [x] Toggle functions flip boolean values
- [x] Zoom stays within bounds (0.25-4.0)
- [x] `zoomIn`/`zoomOut` use correct increment
- [x] `resetZoom` returns to 1.0
- [x] Persistence loads saved preferences

---

## Task 1.5: Default Values & Constants ✅

**File**: `src/constants/defaults.ts`, `src/constants/colors.ts`, `src/constants/limits.ts`

### Subtasks

- [x] **1.5.1** Create room defaults:
  ```
  DEFAULT_CEILING_HEIGHT = 2.7
  DEFAULT_WALL_THICKNESS = 0.2
  DEFAULT_DOOR_WIDTH = 0.9
  DEFAULT_DOOR_HEIGHT = 2.1
  DEFAULT_WINDOW_WIDTH = 1.2
  DEFAULT_WINDOW_HEIGHT = 1.2
  DEFAULT_WINDOW_SILL = 0.9
  DEFAULT_ROOM_GAP = 1.0 (for auto-layout)
  ```

- [x] **1.5.2** Create validation limits:
  ```
  MIN_ROOM_DIMENSION = 0.1
  MAX_ROOM_DIMENSION = 100
  MIN_CEILING_HEIGHT = 1.5
  MAX_CEILING_HEIGHT = 4.0
  MIN_WALL_THICKNESS = 0.05
  MAX_WALL_THICKNESS = 0.5
  MAX_ROOM_NAME_LENGTH = 100
  MAX_PROJECT_NAME_LENGTH = 100
  ```

- [x] **1.5.3** Create room type colors map:
  ```
  ROOM_TYPE_COLORS = {
    bedroom: '#93c5fd',    // Light blue
    kitchen: '#fed7aa',    // Light orange
    bathroom: '#a5f3fc',   // Light cyan
    living: '#fef3c7',     // Light yellow
    dining: '#ddd6fe',     // Light purple
    office: '#bbf7d0',     // Light green
    hallway: '#e5e7eb',    // Light gray
    closet: '#f5d0fe',     // Light pink
    garage: '#d1d5db',     // Gray
    other: '#f3f4f6',      // Very light gray
  }
  ```

- [x] **1.5.4** Create color-blind friendly palette variant

- [x] **1.5.5** Create grid size options: `[0.1, 0.5, 1.0]`

- [x] **1.5.6** Create zoom level options: `[0.25, 0.5, 0.75, 1.0, 1.5, 2.0, 3.0, 4.0]`

### Unit Tests

- [x] All constants are exported and have expected values
- [x] Color values are valid hex strings
- [x] Room type colors cover all RoomType values

---

## Task 1.6: Validation Utilities ✅

**File**: `src/utils/validation.ts`

### Subtasks

- [x] **1.6.1** Create `validateRoomDimension(value: number, fieldName: string): ValidationResult`
  - Returns `{ valid: boolean, error?: string, warning?: string }`
  - Error if < 0.1 or > 100
  - Warning if < 1 or > 50

- [x] **1.6.2** Create `validateCeilingHeight(value: number): ValidationResult`
  - Error if < 1.5 or > 4.0
  - Warning if < 2.2 or > 3.5

- [x] **1.6.3** Create `validateRoomName(name: string): ValidationResult`
  - Error if empty
  - Warning if > 50 chars (allowed up to 100)

- [x] **1.6.4** Create `validateProjectName(name: string): ValidationResult`
  - Error if empty
  - Warning if > 50 chars

- [x] **1.6.5** Create `validateRoom(room: Room): ValidationResult[]`
  - Runs all room validations
  - Returns array of results

- [x] **1.6.6** Create `validateFloorplan(floorplan: Floorplan): ValidationResult[]`
  - Validates all rooms
  - Checks for overlapping rooms
  - Returns aggregated results

### Unit Tests (`tests/unit/utils/validation.test.ts`)

- [x] Dimension validation returns error for values < 0.1
- [x] Dimension validation returns warning for values < 1
- [x] Ceiling height validation handles edge cases
- [x] Room name validation rejects empty strings
- [x] `validateRoom` aggregates all field validations
- [x] `validateFloorplan` detects overlapping rooms

---

## Task 1.7: Room Factory Functions ✅

**File**: `src/services/room/factory.ts`

### Subtasks

- [x] **1.7.1** Create `createRoom(params: CreateRoomParams): Room`
  - `CreateRoomParams`: name, length, width, type, optional height/position/color
  - Applies defaults for missing fields
  - Generates UUID

- [x] **1.7.2** Create `createDefaultRoom(type: RoomType): Room`
  - Preset dimensions based on type:
    - bedroom: 4×4m
    - kitchen: 4×3m
    - bathroom: 2.5×2m
    - living: 5×4m
    - etc.
  - Default name based on type

- [x] **1.7.3** Create `cloneRoom(room: Room, offset?: Position2D): Room`
  - Deep clone with new UUID
  - Optional position offset
  - Appends " (copy)" to name

- [x] **1.7.4** Create `createDoor(params: CreateDoorParams): Door`
  - Applies defaults for missing fields
  - Generates UUID

- [x] **1.7.5** Create `createWindow(params: CreateWindowParams): Window`
  - Applies defaults for missing fields
  - Generates UUID

### Unit Tests (`tests/unit/services/room/factory.test.ts`)

- [x] `createRoom` generates unique IDs each call
- [x] `createRoom` applies defaults correctly
- [x] `createDefaultRoom` returns appropriate dimensions per type
- [x] `cloneRoom` creates independent copy with new ID
- [x] `cloneRoom` appends "(copy)" to name

---

## Integration Tests ✅

**File**: `tests/integration/data-model.integration.test.ts`

### Test Cases

- [x] **Full floorplan lifecycle**: Create floorplan → add rooms → update room → delete room → verify state
- [x] **Auto-layout**: Add 5 rooms without positions → verify they're laid out left-to-right with gaps
- [x] **Selection flow**: Select room → modify → select different room → verify first room's changes persisted
- [x] **Store persistence**: Modify state → serialize → deserialize → verify state restored
- [x] **Validation integration**: Create room with invalid dimensions → verify validation errors returned

---

## Acceptance Criteria ✅

- [x] All TypeScript types compile without errors
- [x] Zustand stores initialize with correct defaults
- [x] Room CRUD operations work correctly
- [x] Geometry calculations are accurate (verified by tests)
- [x] Validation catches invalid inputs with helpful messages
- [x] Unit test coverage > 90% for this section
- [x] No circular dependencies between modules

---

## Files Created

```
src/
├── types/
│   ├── index.ts
│   ├── floorplan.ts
│   ├── room.ts
│   ├── geometry.ts
│   └── materials.ts
├── stores/
│   ├── floorplanStore.ts
│   └── uiStore.ts
├── services/
│   ├── geometry/
│   │   ├── index.ts
│   │   ├── room.ts
│   │   └── bounds.ts
│   └── room/
│       └── factory.ts
├── utils/
│   └── validation.ts
└── constants/
    ├── defaults.ts
    ├── colors.ts
    └── limits.ts

tests/
├── unit/
│   ├── types/
│   ├── stores/
│   │   ├── floorplanStore.test.ts
│   │   └── uiStore.test.ts
│   ├── services/
│   │   └── geometry/
│   └── utils/
│       └── validation.test.ts
└── integration/
    └── data-model.integration.test.ts
```
