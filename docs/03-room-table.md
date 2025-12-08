# Section 03: Room Input Table (Quick Start)

> **Priority**: High - Core MVP feature enabling "numbers-first" floorplan creation.
>
> **Phase**: MVP (Phase 1)
>
> **Dependencies**:
> - Section 01 (data model, stores)
> - Section 02 (UI shell, properties panel integration)
>
> **Parallel Work**: Can run in parallel with Sections 04, 05 once dependencies met.

---

## Overview

The Room Input Table is the primary MVP interface for users who "have a tape measure and want a floorplan." Users enter room dimensions in a spreadsheet-like table, and the system automatically generates a 2D layout and 3D preview. No drawing skills required.

---

## Task 3.1: Table Component Foundation

**File**: `src/components/table/RoomTable.tsx`

### Subtasks

- [ ] **3.1.1** Create table container component with sticky header

- [ ] **3.1.2** Define table columns:
  | Column | Width | Type | Details |
  |--------|-------|------|---------|
  | Room Name | 150px | Text input | Max 100 chars, required |
  | Length | 80px | Number input | Unit suffix (m/ft), min 0.1 |
  | Width | 80px | Number input | Unit suffix (m/ft), min 0.1 |
  | Height | 80px | Number input | Default 2.7m, range 1.5-4.0 |
  | Type | 120px | Dropdown | RoomType options |
  | Area | 80px | Display | Read-only, calculated |
  | Actions | 48px | Buttons | Delete button |

- [ ] **3.1.3** Implement row color coding by room type:
  - Apply background color from `ROOM_TYPE_COLORS`
  - Subtle tint (10-15% opacity)
  - Selected row has stronger highlight

- [ ] **3.1.4** Create table footer:
  - "+ Add Room" button (full width, dashed border)
  - Totals row showing: Total Area, Total Volume, Room Count

- [ ] **3.1.5** Implement empty state:
  - Message: "No rooms yet. Add your first room to get started."
  - Large "+ Add Room" button

### Unit Tests (`tests/unit/components/table/RoomTable.test.tsx`)

- [ ] Table renders empty state when no rooms
- [ ] Table renders correct number of rows for rooms
- [ ] Row colors match room types
- [ ] Totals calculate correctly
- [ ] Add Room button renders in footer

---

## Task 3.2: Editable Table Cells

**File**: `src/components/table/TableCell.tsx`, `src/components/table/cells/*.tsx`

### Subtasks

- [ ] **3.2.1** Create `TextCell` component:
  - Displays text, editable on click
  - Auto-select all on focus
  - Commit on blur or Enter
  - Cancel on Escape
  - Max length validation

- [ ] **3.2.2** Create `NumberCell` component:
  - Number input with increment/decrement buttons
  - Unit suffix display (m or ft)
  - Min/max validation
  - Step increment (0.1 for dimensions)
  - Shows validation error/warning inline

- [ ] **3.2.3** Create `SelectCell` component:
  - Dropdown for room type
  - Shows color swatch + label
  - Opens on click or Enter
  - Keyboard navigable (arrow keys)

- [ ] **3.2.4** Create `DisplayCell` component:
  - Read-only calculated value
  - Shows unit suffix
  - Formatted number (1 decimal place)

- [ ] **3.2.5** Create `ActionCell` component:
  - Delete button with confirm tooltip
  - Icon-only in collapsed view

- [ ] **3.2.6** Implement cell validation states:
  - Valid: no indicator
  - Warning: yellow border, info icon with tooltip
  - Error: red border, error icon with tooltip

### Unit Tests

- [ ] TextCell commits value on Enter
- [ ] TextCell cancels on Escape
- [ ] NumberCell respects min/max bounds
- [ ] NumberCell shows validation error
- [ ] SelectCell opens dropdown on click
- [ ] SelectCell navigable with arrow keys

---

## Task 3.3: Table Row Component

**File**: `src/components/table/RoomTableRow.tsx`

### Subtasks

- [ ] **3.3.1** Create row component receiving room data:
  ```typescript
  interface RoomTableRowProps {
    room: Room
    isSelected: boolean
    onSelect: () => void
    onUpdate: (updates: Partial<Room>) => void
    onDelete: () => void
    units: MeasurementUnit
  }
  ```

- [ ] **3.3.2** Implement row selection:
  - Click row background (not cell) to select
  - Selected row has highlight border
  - Updates `floorplanStore.selectedRoomId`

- [ ] **3.3.3** Implement cell change handlers:
  - Debounce updates (300ms) for number inputs
  - Immediate update for dropdowns
  - Validate before dispatching to store

- [ ] **3.3.4** Calculate and display area:
  - `length × width`
  - Format: "20.0 m²" or "215.3 ft²"
  - Update in real-time as dimensions change

- [ ] **3.3.5** Implement delete with confirmation:
  - Show confirm dialog: "Delete [Room Name]?"
  - On confirm: call `floorplanStore.deleteRoom(id)`
  - Toast: "Room deleted"

- [ ] **3.3.6** Add row hover state:
  - Slight background change
  - Show actions that are normally hidden

### Unit Tests

- [ ] Row renders all cells with correct values
- [ ] Click selects row
- [ ] Number change triggers debounced update
- [ ] Delete shows confirmation
- [ ] Delete removes row from store

---

## Task 3.4: Keyboard Navigation

**File**: `src/hooks/useTableNavigation.ts`

### Subtasks

- [ ] **3.4.1** Implement Tab navigation:
  - Tab moves to next cell in row
  - At end of row, Tab moves to first cell of next row
  - At last cell of last row, Tab goes to "Add Room" button

- [ ] **3.4.2** Implement Shift+Tab navigation:
  - Reverse of Tab navigation

- [ ] **3.4.3** Implement Enter behavior:
  - In text/number cell: commit and move to next row same column
  - At last row: create new row and focus name cell

- [ ] **3.4.4** Implement Escape behavior:
  - Cancel current edit
  - Restore previous value
  - Blur cell

- [ ] **3.4.5** Implement Arrow key navigation:
  - Up/Down: move between rows (same column)
  - Left/Right: move between cells (within row)
  - Only when cell not in edit mode

- [ ] **3.4.6** Implement Ctrl+Enter:
  - Add new room
  - Focus new row's name cell

- [ ] **3.4.7** Implement Delete key:
  - When row selected (not editing cell): delete row with confirmation

- [ ] **3.4.8** Create focus management:
  - Track currently focused cell
  - Restore focus after operations

### Unit Tests

- [ ] Tab moves through cells correctly
- [ ] Enter on last row creates new row
- [ ] Escape cancels edit
- [ ] Arrow keys navigate between rows/cells
- [ ] Ctrl+Enter adds new room

---

## Task 3.5: Add Room Functionality

**File**: `src/components/table/AddRoomButton.tsx`, `src/hooks/useAddRoom.ts`

### Subtasks

- [ ] **3.5.1** Create "Add Room" button component:
  - Full-width button in table footer
  - Dashed border style
  - Icon: "+" plus sign
  - Hover state with background

- [ ] **3.5.2** Create `useAddRoom` hook:
  ```typescript
  interface UseAddRoomReturn {
    addRoom: (type?: RoomType) => Room
    addRoomWithDefaults: () => Room
  }
  ```

- [ ] **3.5.3** Implement add room logic:
  - Generate default name: "Room 1", "Room 2", etc.
  - Default type: 'other'
  - Default dimensions: 4m × 4m × 2.7m
  - Auto-position: after last room + gap

- [ ] **3.5.4** Focus new row's name field after creation

- [ ] **3.5.5** Toast notification: "Room added"

- [ ] **3.5.6** Implement quick-add buttons for room types:
  - Row of small buttons above "Add Room"
  - Icons for: Bedroom, Kitchen, Bathroom, Living
  - Click creates room with that type and default dimensions

### Unit Tests

- [ ] Add room creates room in store
- [ ] Default name increments correctly
- [ ] Auto-position calculates correctly
- [ ] Focus moves to new row
- [ ] Quick-add creates correct room type

---

## Task 3.6: Auto-Layout System

**File**: `src/services/layout/autoLayout.ts`

### Subtasks

- [ ] **3.6.1** Create `calculateAutoLayout(rooms: Room[]): Map<string, Position2D>`
  - Positions rooms left-to-right
  - Gap between rooms: 1m (configurable)
  - Returns map of roomId → position

- [ ] **3.6.2** Implement layout algorithm:
  ```
  position[0] = { x: 0, z: 0 }
  for i = 1 to n:
    position[i].x = position[i-1].x + room[i-1].length + GAP
    position[i].z = 0
  ```

- [ ] **3.6.3** Create `applyAutoLayout(floorplan: Floorplan): void`
  - Calculates positions
  - Updates room positions in store

- [ ] **3.6.4** Trigger auto-layout:
  - When room added via table
  - When room deleted
  - When room dimensions change (debounced)

- [ ] **3.6.5** Add "Re-layout" button:
  - In toolbar or table header
  - Resets all positions to auto-calculated
  - Confirm dialog: "This will reset room positions"

### Unit Tests

- [ ] Single room positioned at origin
- [ ] Multiple rooms spaced correctly
- [ ] Changing room dimensions triggers re-layout
- [ ] Deleting room compacts remaining rooms

---

## Task 3.7: Totals Display

**File**: `src/components/table/TableTotals.tsx`

### Subtasks

- [ ] **3.7.1** Create totals row component:
  - Sticky at bottom of table (below Add Room)
  - Different background color

- [ ] **3.7.2** Display Total Area:
  - Sum of all room areas
  - Format: "Total Area: 120.5 m²"
  - Updates in real-time

- [ ] **3.7.3** Display Total Volume:
  - Sum of all room volumes
  - Format: "Total Volume: 325.4 m³"
  - Updates in real-time

- [ ] **3.7.4** Display Room Count:
  - Format: "5 rooms"
  - Singular/plural handling

- [ ] **3.7.5** Optional: Display total wall length (perimeter sum)

### Unit Tests

- [ ] Total area sums correctly
- [ ] Total volume sums correctly
- [ ] Room count displays correctly
- [ ] Singular "room" for count of 1
- [ ] Updates when room added/removed/changed

---

## Task 3.8: Table Sorting and Filtering

**File**: `src/components/table/TableControls.tsx`, `src/hooks/useTableSort.ts`

### Subtasks

- [ ] **3.8.1** Create sort controls in table header:
  - Click column header to sort by that column
  - Click again to reverse sort
  - Sort indicator arrow (▲/▼)

- [ ] **3.8.2** Implement sortable columns:
  - Name (alphabetical)
  - Length (numeric)
  - Width (numeric)
  - Height (numeric)
  - Type (alphabetical)
  - Area (numeric)

- [ ] **3.8.3** Create `useTableSort` hook:
  ```typescript
  interface UseTableSortReturn {
    sortColumn: string | null
    sortDirection: 'asc' | 'desc'
    sortedRooms: Room[]
    setSortColumn: (column: string) => void
    toggleSort: (column: string) => void
  }
  ```

- [ ] **3.8.4** Persist sort preference in UI store

- [ ] **3.8.5** Create filter controls:
  - Search box filters by name
  - Type filter dropdown (show only bedrooms, etc.)

### Unit Tests

- [ ] Sort by name works alphabetically
- [ ] Sort by area works numerically
- [ ] Sort direction toggles
- [ ] Filter by name filters correctly
- [ ] Filter by type shows only matching rooms

---

## Task 3.9: Validation and Feedback

**File**: `src/components/table/ValidationIndicator.tsx`

### Subtasks

- [ ] **3.9.1** Create validation indicator component:
  - Icon + tooltip for errors/warnings
  - Red circle with "!" for errors
  - Yellow triangle for warnings

- [ ] **3.9.2** Implement dimension validation:
  - Error: value < 0.1m → "Room dimension too small. Minimum 0.1m"
  - Warning: value < 1m → "Dimension seems small. Are you sure?"
  - Warning: value > 50m → "Dimension seems large. Are you sure?"

- [ ] **3.9.3** Implement height validation:
  - Error: < 1.5m → "Ceiling too low. Minimum 1.5m"
  - Error: > 4.0m → "Ceiling too high. Maximum 4.0m"
  - Warning: < 2.2m → "Low ceiling height"
  - Warning: > 3.5m → "Unusually high ceiling"

- [ ] **3.9.4** Implement name validation:
  - Error: empty → "Room name is required"
  - Warning: duplicate → "Another room has this name"

- [ ] **3.9.5** Show row-level validation summary:
  - Row border color indicates worst validation state
  - Tooltip summarizes all issues

- [ ] **3.9.6** Show table-level validation summary:
  - Badge in header: "2 warnings, 1 error"
  - Click to scroll to first issue

### Unit Tests

- [ ] Validation error shows red indicator
- [ ] Validation warning shows yellow indicator
- [ ] Empty name triggers error
- [ ] Small dimension triggers warning
- [ ] Invalid dimension triggers error

---

## Task 3.10: Table Integration with 2D View

**File**: (coordination between components)

### Subtasks

- [ ] **3.10.1** Sync selection between table and 2D view:
  - Select room in table → highlights in 2D
  - Select room in 2D → highlights row in table
  - Scroll table to show selected row

- [ ] **3.10.2** Implement scroll-to-room:
  - Double-click room in 2D → scroll table to that row
  - Optional: smooth scroll animation

- [ ] **3.10.3** Update 2D view when table changes:
  - Room added → appears in 2D
  - Dimensions changed → 2D resizes
  - Room deleted → removed from 2D

- [ ] **3.10.4** Hover sync:
  - Hover row in table → highlight room in 2D
  - Hover room in 2D → highlight row in table

### Unit Tests

- [ ] Selection syncs from table to 2D
- [ ] Selection syncs from 2D to table
- [ ] Adding room appears in 2D
- [ ] Dimension change updates 2D size

---

## Integration Tests

**File**: `tests/integration/room-table.integration.test.tsx`

### Test Cases (using jsdom + @napi-rs/canvas)

- [ ] **Full CRUD workflow**: Add room → edit name → change dimensions → delete → verify state
- [ ] **Keyboard navigation flow**: Create room → Tab through cells → Enter to next row → Escape to cancel
- [ ] **Validation workflow**: Enter invalid dimension → verify error shown → fix → verify cleared
- [ ] **Auto-layout**: Add 5 rooms → verify positioned left-to-right with correct gaps
- [ ] **Totals accuracy**: Add rooms with known dimensions → verify totals match expected
- [ ] **Selection sync**: Select room in table → verify store updated → verify 2D highlight

---

## Acceptance Criteria

- [ ] User can add rooms by clicking "+ Add Room"
- [ ] User can edit room name, dimensions, type inline
- [ ] Tab/Enter navigation works fluidly
- [ ] Validation errors display with helpful messages
- [ ] Totals update in real-time
- [ ] Auto-layout positions rooms correctly
- [ ] Selection syncs with 2D view
- [ ] Keyboard-only operation is fully supported
- [ ] Unit test coverage > 90%

---

## Files Created

```
src/
├── components/
│   └── table/
│       ├── RoomTable.tsx
│       ├── RoomTableRow.tsx
│       ├── TableCell.tsx
│       ├── TableTotals.tsx
│       ├── TableControls.tsx
│       ├── AddRoomButton.tsx
│       ├── ValidationIndicator.tsx
│       └── cells/
│           ├── TextCell.tsx
│           ├── NumberCell.tsx
│           ├── SelectCell.tsx
│           ├── DisplayCell.tsx
│           └── ActionCell.tsx
├── hooks/
│   ├── useTableNavigation.ts
│   ├── useTableSort.ts
│   └── useAddRoom.ts
└── services/
    └── layout/
        └── autoLayout.ts

tests/
├── unit/
│   └── components/
│       └── table/
│           ├── RoomTable.test.tsx
│           ├── RoomTableRow.test.tsx
│           ├── TableCell.test.tsx
│           └── cells/
└── integration/
    └── room-table.integration.test.tsx
```
