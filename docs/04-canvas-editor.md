# Section 04: 2D Canvas Editor

> **Priority**: Medium-High - Enables advanced editing beyond table input.
>
> **Phase**: Phase 2 (after MVP table input is complete)
>
> **Dependencies**:
> - Section 01 (data model, geometry utils)
> - Section 02 (UI shell, toolbar integration)
> - Section 06 (adjacency detection for room connections)
>
> **Parallel Work**: 3D Viewer (Section 05) can proceed independently.

---

## Overview

The 2D Canvas Editor provides a visual drawing interface for users who want manual control over room placement and wall drawing. Uses SVG for the layout display and Canvas API for interaction overlays. Supports both room-rectangle mode (position existing rooms) and wall-drawing mode (draw walls to define rooms).

---

## Task 4.1: Canvas Viewport Setup

**File**: `src/components/editor/Canvas2D.tsx`, `src/components/editor/CanvasViewport.tsx`

### Subtasks

- [x] **4.1.1** Create SVG-based canvas component:
  - Full viewport size (fills main content area)
  - Coordinate system: origin at top-left
  - Positive X right, positive Z down
  - Scale factor from uiStore.zoomLevel

- [x] **4.1.2** Implement viewport transformation:
  ```typescript
  interface ViewportState {
    zoom: number       // 0.25 - 4.0
    panX: number       // pixels offset
    panZ: number       // pixels offset
    pixelsPerMeter: number  // base scale (e.g., 50)
  }
  ```

- [x] **4.1.3** Create `worldToScreen(point: Position2D): { x: number, y: number }`
  - Converts world coordinates (meters) to screen pixels

- [x] **4.1.4** Create `screenToWorld(x: number, y: number): Position2D`
  - Converts screen pixels to world coordinates (meters)

- [x] **4.1.5** Implement pan gesture:
  - Middle mouse drag to pan
  - Right mouse drag to pan (alternative)
  - Two-finger drag on touch devices
  - Update panOffset in uiStore

- [x] **4.1.6** Implement zoom gesture:
  - Mouse wheel to zoom in/out
  - Pinch to zoom on touch devices
  - Zoom centered on cursor position
  - Clamp to zoom limits (0.25 - 4.0)

- [x] **4.1.7** Implement zoom controls:
  - "Zoom to Fit" button: fits all rooms in view with padding (Pending room implementation)
  - Zoom slider in status bar (Pending status bar update)
  - Keyboard: +/- for zoom (Handled by Shortcuts)

### Unit Tests (`tests/unit/components/editor/CanvasViewport.test.tsx`)

- [x] worldToScreen converts coordinates correctly at zoom 1.0
- [x] worldToScreen accounts for zoom level
- [x] worldToScreen accounts for pan offset
- [x] screenToWorld is inverse of worldToScreen
- [x] Zoom clamps to bounds

---

## Task 4.2: Grid Rendering

**File**: `src/components/editor/Grid.tsx`

### Subtasks

- [x] **4.2.1** Create grid overlay component:
  - SVG pattern for grid lines
  - Major lines every 1m (darker)
  - Minor lines every 0.1m (lighter, only at high zoom)
  - Grid follows viewport pan/zoom

- [x] **4.2.2** Implement adaptive grid density:
  - At zoom < 0.5: show only 1m lines
  - At zoom 0.5-1.0: show 0.5m and 1m lines
  - At zoom > 1.0: show 0.1m, 0.5m, and 1m lines

- [x] **4.2.3** Create coordinate display:
  - Axis labels at edges (0, 1, 2, 3... meters)
  - Update as viewport pans/zooms
  - Optional: origin marker at (0,0)

- [x] **4.2.4** Add grid toggle (from uiStore.showGrid)

- [x] **4.2.5** Create "snap to grid" indicator:
  - Show snap points as small dots when snap enabled
  - Highlight nearest snap point to cursor

### Unit Tests

- [x] Grid renders at correct density for zoom level
- [x] Grid respects showGrid toggle
- [x] Coordinate labels update with pan
- [x] Snap indicator shows at correct position

---

## Task 4.3: Room Rendering

**File**: `src/components/editor/RoomShape.tsx`, `src/components/editor/RoomLayer.tsx`

### Subtasks

- [x] **4.3.1** Create `RoomShape` SVG component:
  ```typescript
  interface RoomShapeProps {
    room: Room
    isSelected: boolean
    isHovered: boolean
    onClick: () => void
    onDoubleClick: () => void
  }
  ```

- [x] **4.3.2** Render room as rectangle:
  - Fill with room type color (from constants)
  - Stroke for walls (darker color)
  - Stroke width based on wall thickness

- [x] **4.3.3** Implement selection state:
  - Selected: thicker border, selection handles at corners
  - Hover: subtle highlight

- [x] **4.3.4** Render room label:
  - Room name centered in room
  - Area below name (smaller text)
  - Auto-scale text size based on room size
  - Hide labels if room too small

- [x] **4.3.5** Create `RoomLayer` container:
  - Maps over all rooms
  - Handles z-ordering (selected room on top)

- [x] **4.3.6** Implement rotation rendering:
  - Apply SVG transform for rotated rooms
  - Handles 0, 90, 180, 270 degree rotations

### Unit Tests

- [x] Room renders at correct position and size
- [x] Selected room has selection handles
- [x] Room color matches type
- [x] Label text scales appropriately
- [x] Rotation transform applied correctly
- [x] Selected rooms render on top (z-ordering)

---

## Task 4.4: Room Selection and Interaction

**File**: `src/hooks/useRoomInteraction.ts`, `src/components/editor/SelectionOverlay.tsx`

### Subtasks

- [x] **4.4.1** Implement click-to-select:
  - Click room → select (update store)
  - Click empty area → deselect
  - Shift+click → add to selection (multi-select)
  - Ctrl+click → toggle selection

- [x] **4.4.2** Implement box selection:
  - Drag in empty area → draw selection box
  - Rooms intersecting box become selected
  - Shift+drag → add to existing selection

- [x] **4.4.3** Create selection handles:
  - 4 corner handles for resize
  - 4 edge handles for single-axis resize
  - 1 rotation handle (circle above top edge)

- [x] **4.4.4** Implement keyboard selection:
  - Arrow keys: move selection (when room selected)
  - Delete: delete selected rooms
  - Escape: deselect all

- [x] **4.4.5** Implement hover states:
  - Track mouse position
  - Determine which room is under cursor
  - Apply hover highlight

- [x] **4.4.6** Double-click behavior:
  - Double-click room → open properties panel
  - Focus on name input in properties

### Unit Tests

- [x] Click selects room
- [x] Click outside deselects
- [x] Shift+click adds to selection
- [x] Box selection selects multiple rooms
- [x] Escape deselects all

---

## Task 4.5: Room Dragging and Positioning

**File**: `src/hooks/useRoomDrag.ts`

### Subtasks

- [x] **4.5.1** Implement drag-to-move:
  - Mouse down on selected room starts drag
  - Mouse move updates position
  - Mouse up commits new position
  - Cursor: "move" during drag

- [x] **4.5.2** Apply grid snapping:
  - Snap position to grid if snapToGrid enabled
  - Snap to grid size from uiStore
  - Show snap feedback (line to snap point)

- [x] **4.5.3** Implement collision detection:
  - Check for overlaps while dragging
  - Show warning indicator if overlapping
  - Allow placement but show warning toast

- [x] **4.5.4** Implement smart guides:
  - Show alignment guides to other rooms
  - Horizontal guide when top/bottom/center aligns
  - Vertical guide when left/right/center aligns
  - Snap to guides

- [x] **4.5.5** Multi-room drag:
  - Dragging one room in multi-selection moves all
  - Maintain relative positions

- [x] **4.5.6** Implement undo for move:
  - Store previous position before drag
  - On undo: restore previous position

### Unit Tests

- [x] Drag updates room position
- [x] Grid snapping works at different grid sizes
- [ ] Smart guides appear when aligned
- [x] Multi-select drag maintains relative positions
- [x] Collision warning appears for overlapping rooms

---

## Task 4.6: Room Resizing

**File**: `src/hooks/useRoomResize.ts`

### Subtasks

- [x] **4.6.1** Implement corner resize:
  - Drag corner handle to resize both dimensions
  - Opposite corner stays fixed
  - Cursor: "nwse-resize" etc.

- [x] **4.6.2** Implement edge resize:
  - Drag edge handle to resize single dimension
  - Cursor: "ew-resize" or "ns-resize"

- [x] **4.6.3** Apply dimension constraints:
  - Minimum dimension: 0.1m
  - Maximum dimension: 100m
  - Snap to grid if enabled

- [x] **4.6.4** Proportional resize:
  - Hold Shift during resize to maintain aspect ratio

- [x] **4.6.5** Resize from center:
  - Hold Alt during resize to resize from center
  - Both sides move equally

- [x] **4.6.6** Live feedback:
  - Show dimension labels during resize
  - Show area calculation updating

- [x] **4.6.7** Validate on completion:
  - Show warning if dimension is unusual
  - Show error if dimension is invalid (but still allow)

### Unit Tests

- [x] Corner resize changes both dimensions
- [x] Edge resize changes single dimension
- [x] Minimum dimension enforced
- [x] Shift constrains aspect ratio
- [x] Dimension labels update during resize

---

## Task 4.7: Room Rotation

**File**: `src/hooks/useRoomRotation.ts`

### Subtasks

- [x] **4.7.1** Create rotation handle:
  - Circle above top edge of room
  - Line connecting to room

- [x] **4.7.2** Implement drag-to-rotate:
  - Drag rotation handle to rotate
  - Snap to 90-degree increments
  - Rotate around room center

- [x] **4.7.3** Implement rotation snapping:
  - Without modifier: snap to 0, 90, 180, 270
  - With modifier (Ctrl): free rotation (future feature)

- [x] **4.7.4** Keyboard rotation:
  - R key: rotate 90° clockwise
  - Shift+R: rotate 90° counter-clockwise

- [x] **4.7.5** Update dimensions after rotation:
  - Swap length/width for 90/270 degree rotations
  - Ensure room footprint stays consistent

### Unit Tests

- [x] Rotation handle appears on selected room
- [x] Drag rotates to nearest 90° increment
- [x] R key rotates 90° clockwise
- [x] Dimensions swap correctly on 90° rotation

---

## Task 4.8: Wall Drawing Mode (Advanced)

**File**: `src/components/editor/WallTool.tsx`, `src/hooks/useWallDrawing.ts`

### Subtasks

- [x] **4.8.1** Create wall drawing tool:
  - Toolbar button to activate
  - Cursor changes to crosshair
  - Click to start wall, click to end wall

- [x] **4.8.2** Implement wall preview:
  - Show wall line from start point to cursor
  - Show wall length as label
  - Show angle relative to horizontal

- [x] **4.8.3** Implement wall snapping:
  - [x] Snap to grid points
  - [x] Snap to existing wall endpoints
  - [x] Snap to perpendicular angles (0°, 90°)
  - [ ] Snap to 45° angles (optional)

- [x] **4.8.4** Implement continuous wall drawing:
  - After placing wall, start next wall from endpoint
  - Press Escape or double-click to finish
  - Connect back to start to close shape

- [ ] **4.8.5** Create wall from room boundary:
  - Option to convert room rectangle to walls
  - Creates 4 walls matching room dimensions

- [x] **4.8.6** Implement wall deletion:
  - Select wall → Delete key
  - Or click delete tool then click wall

### Unit Tests

- [x] Wall tool activates on button click
- [x] Wall preview shows correct length
- [x] Grid snapping works for wall endpoints
- [x] Wall-to-wall snapping works
- [x] Escape cancels current wall

---

## Task 4.9: Room Creation from Walls

**File**: `src/services/roomDetection.ts`

### Subtasks

- [x] **4.9.1** Implement enclosed area detection:
  - Find closed polygons formed by walls
  - Use graph algorithm (find cycles)

- [ ] **4.9.2** Create "Click to create room" UI:
  - Detect click inside enclosed area
  - Highlight detected area on hover
  - Click creates room with that boundary

- [x] **4.9.3** Implement polygon-to-room conversion:
  - Calculate bounding box for dimensions
  - Set room position from bounding box
  - Store polygon vertices for non-rectangular rooms

- [ ] **4.9.4** Handle non-rectangular rooms:
  - Store vertices array in room
  - Render polygon instead of rectangle
  - Calculate area using shoelace formula

### Unit Tests

- [x] Enclosed area detection finds simple rectangles
- [x] Enclosed area detection finds L-shapes
- [ ] Click inside area creates room
- [x] Polygon area calculated correctly

---

## Task 4.10: Measurements and Dimensions

**File**: `src/components/editor/MeasurementOverlay.tsx`

### Subtasks

- [x] **4.10.1** Create measurement display:
  - Show dimensions on selected room edges
  - Format: "5.0 m" with unit from project settings

- [ ] **4.10.2** Implement measurement tool:
  - Click two points to measure distance
  - Display distance with line between points
  - Measurements persist until cleared

- [ ] **4.10.3** Create distance-between-rooms display:
  - When two rooms selected, show gap distance
  - Horizontal and vertical gaps

- [ ] **4.10.4** Implement angle measurement:
  - Optional: show wall angles
  - Show rotation angle during rotation

- [ ] **4.10.5** Toggle measurements visibility:
  - Checkbox in View menu
  - Keyboard shortcut: M

### Unit Tests

- [ ] Dimension labels show correct values
- [ ] Measurement tool calculates correct distance
- [ ] Measurements toggle on/off

---

## Task 4.11: Toolbar and Tool State

**File**: `src/components/editor/EditorToolbar.tsx`, `src/stores/toolStore.ts`

### Subtasks

- [x] **4.11.1** Create tool state store:
  ```typescript
  interface ToolState {
    activeTool: 'select' | 'pan' | 'wall' | 'measure' | 'door' | 'window'
    setTool: (tool: ActiveTool) => void
  }
  ```

- [x] **4.11.2** Create toolbar component:
  - Select tool (S) - default
  - Pan tool (H) - hand
  - Wall tool (W) - for drawing walls
  - Measure tool (M)
  - Door tool (D)
  - Window tool (N)

- [x] **4.11.3** Implement tool keyboard shortcuts

- [x] **4.11.4** Create toolbar tooltips:
  - Tool name + keyboard shortcut
  - Brief description

- [x] **4.11.5** Active tool indicator:
  - Highlighted button for active tool
  - Cursor changes based on tool

### Unit Tests

- [x] Tool buttons activate correct tool
- [x] Keyboard shortcuts work
- [x] Active tool is highlighted

---

## Integration Tests

**File**: `tests/integration/canvas-editor.integration.test.tsx`

### Test Cases (using jsdom + @napi-rs/canvas)

- [ ] **Room positioning**: Add room via table → verify appears in canvas at correct position
- [ ] **Drag and drop**: Select room → drag to new position → verify position updated in store
- [ ] **Resize workflow**: Select room → drag corner handle → verify dimensions updated
- [ ] **Multi-room selection**: Shift+click multiple rooms → drag → verify all move together
- [ ] **Zoom and pan**: Zoom to 200% → pan right → verify coordinates transform correctly
- [ ] **Wall drawing**: Draw 4 walls forming rectangle → click inside → verify room created

---

## Acceptance Criteria

- [ ] Rooms display in 2D canvas with correct positions and sizes
- [ ] Click to select, Shift+click for multi-select works
- [ ] Drag to move rooms works with grid snapping
- [ ] Resize handles work for all directions
- [ ] Rotation snaps to 90° increments
- [ ] Wall drawing tool creates walls
- [ ] Enclosed areas can become rooms
- [ ] Pan and zoom work smoothly
- [ ] Grid displays at appropriate density
- [ ] Unit test coverage > 85%

---

## Files Created

```
src/
├── components/
│   └── editor/
│       ├── Canvas2D.tsx
│       ├── CanvasViewport.tsx
│       ├── Grid.tsx
│       ├── RoomShape.tsx
│       ├── RoomLayer.tsx
│       ├── SelectionOverlay.tsx
│       ├── WallTool.tsx
│       ├── MeasurementOverlay.tsx
│       └── EditorToolbar.tsx
├── hooks/
│   ├── useRoomInteraction.ts
│   ├── useRoomDrag.ts
│   ├── useRoomResize.ts
│   ├── useRoomRotation.ts
│   └── useWallDrawing.ts
├── services/
│   └── roomDetection.ts
└── stores/
    └── toolStore.ts

tests/
├── unit/
│   └── components/
│       └── editor/
│           ├── CanvasViewport.test.tsx
│           ├── RoomShape.test.tsx
│           └── Grid.test.tsx
│   └── hooks/
│       ├── useRoomResize.test.ts
│       └── useRoomResize_advanced.test.ts
│   └── services/
│       └── roomDetection.test.ts
└── integration/
    └── canvas-editor.integration.test.tsx
```
