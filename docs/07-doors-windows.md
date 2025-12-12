# Section 07: Doors & Windows

> **Priority**: Medium - Enhances floorplan realism and completeness.
>
> **Phase**: Phase 3 (after MVP)
>
> **Dependencies**:
> - Section 01 (data model)
> - Section 04 (2D canvas for placement)
> - Section 05 (3D viewer for rendering)
> - Section 06 (adjacency for door placement on shared walls)
>
> **Parallel Work**: Can begin after Section 06 is complete.

---

## Overview

This section implements doors and windows as openings in walls. Doors connect adjacent rooms, while windows are placed on exterior walls. Both have configurable properties (size, type, swing direction) and render in 2D and 3D views.

---

## Task 7.1: Door Data Model Extensions

**File**: `src/types/door.ts` (extend existing types)

### Subtasks

- [x] **7.1.1** Finalize `Door` interface:
  ```typescript
  interface Door {
    id: string
    roomId: string            // Room this door belongs to
    connectionId?: string     // Link to RoomConnection (for interior doors)
    wallSide: WallSide        // Which wall of the room
    position: number          // 0.0-1.0 along wall (from left/top)
    width: number             // Default 0.9m
    height: number            // Default 2.1m
    type: DoorType
    swing: 'inward' | 'outward'
    handleSide: 'left' | 'right'
    isExterior: boolean       // Exterior doors (no connection)
  }

  type DoorType = 'single' | 'double' | 'sliding' | 'pocket' | 'bifold'
  ```

- [x] **7.1.2** Add door defaults:
  ```typescript
  const DOOR_DEFAULTS = {
    width: 0.9,
    height: 2.1,
    type: 'single' as DoorType,
    swing: 'inward' as const,
    handleSide: 'left' as const,
  }
  ```

- [x] **7.1.3** Add door validation:
  - Width: 0.5m - 1.5m for single, 1.0m - 2.5m for double
  - Height: 1.8m - 2.5m
  - Position must keep door within wall bounds

### Unit Tests

- [x] Door type validation
- [x] Position bounds checking
- [x] Default values applied correctly

---

## Task 7.2: Window Data Model Extensions

**File**: `src/types/window.ts`

### Subtasks

- [x] **7.2.1** Finalize `Window` interface:
  ```typescript
  interface Window {
    id: string
    roomId: string
    wallSide: WallSide
    position: number          // 0.0-1.0 along wall
    width: number             // Default 1.2m
    height: number            // Default 1.2m
    sillHeight: number        // Height from floor, default 0.9m
    frameType: WindowFrameType
    material: WindowMaterial
    openingType: WindowOpeningType
  }

  type WindowFrameType = 'single' | 'double' | 'triple'
  type WindowMaterial = 'wood' | 'aluminum' | 'pvc' | 'steel'
  type WindowOpeningType = 'fixed' | 'casement' | 'sliding' | 'awning' | 'hopper'
  ```

- [x] **7.2.2** Add window defaults:
  ```typescript
  const WINDOW_DEFAULTS = {
    width: 1.2,
    height: 1.2,
    sillHeight: 0.9,
    frameType: 'double' as WindowFrameType,
    material: 'pvc' as WindowMaterial,
    openingType: 'casement' as WindowOpeningType,
  }
  ```

- [x] **7.2.3** Add window validation:
  - Width: 0.3m - 3.0m
  - Height: 0.3m - 2.5m
  - Sill height: 0m - 1.5m
  - Top of window (sill + height) must be below ceiling

### Unit Tests

- [x] Window validation catches invalid dimensions
- [x] Sill height + height checked against ceiling

---

## Task 7.3: Store Extensions for Doors/Windows

**File**: `src/stores/floorplanStore.ts` (additions)

### Subtasks

- [x] **7.3.1** Add doors and windows to floorplan state:
  ```typescript
  doors: Door[]
  windows: Window[]
  selectedDoorId: string | null
  selectedWindowId: string | null
  ```

- [x] **7.3.2** Add door actions:
  ```typescript
  addDoor(params: CreateDoorParams): Door
  updateDoor(id: string, updates: Partial<Door>): void
  deleteDoor(id: string): void
  selectDoor(id: string | null): void
  getDoorsByRoom(roomId: string): Door[]
  getDoorsByConnection(connectionId: string): Door[]
  ```

- [x] **7.3.3** Add window actions:
  ```typescript
  addWindow(params: CreateWindowParams): Window
  updateWindow(id: string, updates: Partial<Window>): void
  deleteWindow(id: string): void
  selectWindow(id: string | null): void
  getWindowsByRoom(roomId: string): Window[]
  ```

- [x] **7.3.4** Handle cascading deletes:
  - Deleting room deletes its doors and windows
  - Deleting connection removes associated doors

### Unit Tests

- [x] Add door creates door in store
- [x] Delete room cascades to doors/windows
- [x] Selection updates correctly

---

## Task 7.4: Door Placement Tool (2D)

**File**: `src/components/editor/DoorTool.tsx`, `src/hooks/useDoorPlacement.ts`

### Subtasks

- [ ] **7.4.1** Create door placement tool:
  - Activate via toolbar button (hotkey: D)
  - Cursor changes to door icon
  - Click on wall to place door

- [ ] **7.4.2** Implement wall detection:
  - Raycast/hit test to find wall under cursor
  - Only allow placement on room walls
  - Show wall highlight when hoverable

- [ ] **7.4.3** Calculate position along wall:
  - Convert click position to 0.0-1.0 along wall
  - Snap to reasonable intervals (0.1 = 10% of wall)

- [ ] **7.4.4** Show door preview:
  - Ghost door at cursor position
  - Shows door width
  - Red if invalid placement, green if valid

- [ ] **7.4.5** Validate placement:
  - Door fits within wall (with margins)
  - No overlap with existing doors/windows
  - Wall belongs to valid room

- [ ] **7.4.6** Create door on click:
  - If on shared wall, create interior door (link to connection)
  - If on exterior wall, create exterior door
  - Select new door after placement

### Unit Tests

- [ ] Door tool activates
- [ ] Wall detection works
- [ ] Invalid placement shows error indicator
- [ ] Door created on click

---

## Task 7.5: Window Placement Tool (2D)

**File**: `src/components/editor/WindowTool.tsx`, `src/hooks/useWindowPlacement.ts`

### Subtasks

- [ ] **7.5.1** Create window placement tool:
  - Activate via toolbar button (hotkey: N)
  - Similar to door tool

- [ ] **7.5.2** Implement placement logic:
  - Click on wall to place window
  - Calculate position along wall
  - Default sill height applied

- [ ] **7.5.3** Show window preview:
  - Ghost window at cursor position
  - Shows width and height

- [ ] **7.5.4** Validate placement:
  - Window fits within wall
  - No overlap with doors or other windows
  - Sill height + height < ceiling height

- [ ] **7.5.5** Create window on click:
  - Add to store
  - Select new window

### Unit Tests

- [ ] Window tool activates
- [ ] Valid placement creates window
- [ ] Overlap detection prevents placement

---

## Task 7.6: Door/Window Properties Panel

**File**: `src/components/properties/DoorPropertiesPanel.tsx`, `src/components/properties/WindowPropertiesPanel.tsx`

### Subtasks

- [ ] **7.6.1** Create `DoorPropertiesPanel`:
  - Width input with validation
  - Height input with validation
  - Type dropdown (single, double, sliding, etc.)
  - Swing direction toggle (inward/outward)
  - Handle side toggle (left/right)
  - Preview showing door swing direction
  - Delete button

- [ ] **7.6.2** Create door swing preview:
  - Small SVG showing door swing arc
  - Updates as settings change

- [ ] **7.6.3** Create `WindowPropertiesPanel`:
  - Width input
  - Height input
  - Sill height input
  - Frame type dropdown
  - Material dropdown
  - Opening type dropdown
  - Delete button

- [ ] **7.6.4** Position adjuster:
  - Slider to adjust position along wall
  - Or: drag handle in 2D view

- [ ] **7.6.5** Room/Wall info display:
  - Show which room and wall the opening is on
  - For doors: show connected room

### Unit Tests

- [ ] Door properties update store
- [ ] Swing preview updates correctly
- [ ] Window properties update store

---

## Task 7.7: Door/Window 2D Rendering

**File**: `src/components/editor/DoorShape.tsx`, `src/components/editor/WindowShape.tsx`

### Subtasks

- [ ] **7.7.1** Create `DoorShape` SVG component:
  - Render as gap in wall line
  - Show door swing arc (quarter circle)
  - Show door panel (line)
  - Different rendering for each door type

- [ ] **7.7.2** Door type visualizations:
  - Single: one swing arc
  - Double: two swing arcs
  - Sliding: arrows showing slide direction
  - Pocket: dashed line showing pocket
  - Bifold: accordion pattern

- [ ] **7.7.3** Create `WindowShape` SVG component:
  - Render as gap in wall with frame
  - Double line for frame
  - Cross lines for multiple panes

- [ ] **7.7.4** Selection and hover states:
  - Selected door/window has highlight
  - Hover shows tooltip with type and dimensions

- [ ] **7.7.5** Standard architectural symbols:
  - Use conventional floor plan symbols
  - Reference: architectural drawing standards

### Unit Tests

- [ ] Door renders at correct position on wall
- [ ] Swing arc direction matches settings
- [ ] Window renders with frame

---

## Task 7.8: Door/Window 3D Rendering

**File**: `src/components/viewer/DoorMesh.tsx`, `src/components/viewer/WindowMesh.tsx`

### Subtasks

- [ ] **7.8.1** Modify wall geometry for openings:
  - Create wall with rectangular hole at door/window position
  - Use Shape with holes → ExtrudeGeometry
  - Or: CSG subtraction

- [ ] **7.8.2** Create `DoorMesh` component:
  - Door frame (simple box geometry)
  - Door panel (rotated based on swing)
  - Optional: door handle detail

- [ ] **7.8.3** Door animations (optional):
  - Animate door opening/closing
  - Triggered by hover or click

- [ ] **7.8.4** Create `WindowMesh` component:
  - Window frame geometry
  - Glass pane (transparent material)
  - Mullions for multi-pane windows

- [ ] **7.8.5** Glass material:
  - Semi-transparent
  - Slight reflection
  - Tint color option

- [ ] **7.8.6** Position openings correctly:
  - Calculate 3D position from room and wall
  - Account for wall thickness

### Unit Tests

- [ ] Door creates hole in wall geometry
- [ ] Door frame renders at correct position
- [ ] Window glass has transparency
- [ ] Multiple openings on same wall work

---

## Task 7.9: Door/Window Dragging (2D)

**File**: `src/hooks/useDoorDrag.ts`, `src/hooks/useWindowDrag.ts`

### Subtasks

- [ ] **7.9.1** Implement door dragging:
  - Drag selected door along its wall
  - Constrained to wall bounds
  - Snap to grid positions

- [ ] **7.9.2** Prevent invalid positions:
  - Can't overlap other openings
  - Minimum margin from wall ends

- [ ] **7.9.3** Show position feedback:
  - Display distance from wall corner
  - Show percentage position

- [ ] **7.9.4** Implement window dragging:
  - Same as door dragging
  - Constrained to wall

- [ ] **7.9.5** Cross-wall movement:
  - Optional: drag door to different wall
  - Shows valid drop zones

### Unit Tests

- [ ] Door position updates during drag
- [ ] Overlap prevention works
- [ ] Grid snapping works

---

## Task 7.10: Door/Window List UI

**File**: `src/components/sidebar/DoorsList.tsx`, `src/components/sidebar/WindowsList.tsx`

### Subtasks

- [ ] **7.10.1** Create doors section in sidebar:
  - Header: "Doors (N)"
  - List of doors
  - Each item: door icon, type, room name
  - Click to select

- [ ] **7.10.2** Create windows section in sidebar:
  - Header: "Windows (N)"
  - List of windows
  - Each item: window icon, dimensions, room name
  - Click to select

- [ ] **7.10.3** Group by room:
  - Option to group doors/windows by room
  - Collapsible room groups

- [ ] **7.10.4** Quick actions:
  - Right-click context menu
  - Delete
  - Duplicate

### Unit Tests

- [ ] Doors list shows correct count
- [ ] Click selects door
- [ ] Delete removes door

---

## Integration Tests

**File**: `tests/integration/doors-windows.integration.test.tsx`

### Test Cases

- [ ] **Door placement flow**: Activate tool → click wall → door created at position
- [ ] **Door properties**: Select door → change type → verify 2D and 3D update
- [ ] **Window placement**: Place window on wall → verify renders in both views
- [ ] **Drag door**: Drag door along wall → verify position updates
- [ ] **Connection linking**: Place door on shared wall → verify links to connection
- [ ] **Delete cascade**: Delete room → verify its doors removed

---

## Acceptance Criteria

- [ ] Doors can be placed on any wall
- [ ] Interior doors link to room connections
- [ ] Door properties (type, swing, etc.) are editable
- [ ] Windows can be placed with configurable sill height
- [ ] Openings render correctly in 2D (architectural symbols)
- [ ] Openings create holes in 3D walls
- [ ] Doors and windows can be dragged along walls
- [ ] Overlapping openings prevented
- [ ] Unit test coverage > 85%

---

## Files Created

```
src/
├── types/
│   ├── door.ts
│   └── window.ts
├── components/
│   ├── editor/
│   │   ├── DoorTool.tsx
│   │   ├── WindowTool.tsx
│   │   ├── DoorShape.tsx
│   │   └── WindowShape.tsx
│   ├── viewer/
│   │   ├── DoorMesh.tsx
│   │   └── WindowMesh.tsx
│   ├── properties/
│   │   ├── DoorPropertiesPanel.tsx
│   │   └── WindowPropertiesPanel.tsx
│   └── sidebar/
│       ├── DoorsList.tsx
│       └── WindowsList.tsx
├── hooks/
│   ├── useDoorPlacement.ts
│   ├── useWindowPlacement.ts
│   ├── useDoorDrag.ts
│   └── useWindowDrag.ts
└── constants/
    └── doorWindowDefaults.ts

tests/
├── unit/
│   └── components/
│       ├── editor/
│       │   └── DoorTool.test.tsx
│       └── viewer/
│           └── DoorMesh.test.tsx
└── integration/
    └── doors-windows.integration.test.tsx
```
