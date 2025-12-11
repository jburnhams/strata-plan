# Section 06: Room Adjacency & Connections

> **Priority**: Medium - Enables intelligent room relationships and door placement.
>
> **Phase**: MVP (Phase 1 - basic), Phase 2 (advanced)
>
> **Dependencies**:
> - Section 01 (data model, geometry utils)
>
> **Parallel Work**: Can run in parallel with 2D/3D rendering. Required before Section 07 (Doors & Windows).

---

## Overview

The adjacency system automatically detects which rooms share walls, calculates shared wall lengths, and maintains a connection graph. This enables intelligent door placement, path planning, and spatial analysis. Rooms touching within tolerance are considered adjacent.

---

## Task 6.1: Adjacency Detection Algorithm

**File**: `src/services/adjacency/detection.ts`

### Subtasks

- [x] **6.1.1** Create `detectAdjacency(room1: Room, room2: Room): AdjacencyInfo | null`
  - Returns adjacency info if rooms are adjacent
  - Returns null if rooms don't touch

- [x] **6.1.2** Define adjacency criteria:
  - Two rooms are adjacent if they share a wall edge
  - Tolerance: 0.01m (1cm) for floating point comparison
  - Overlap required: minimum 0.1m shared wall length

- [x] **6.1.3** Implement edge comparison:
  - Get all 4 edges of each room
  - Check if any edges overlap (same line, overlapping segments)
  - Calculate overlap length

- [x] **6.1.4** Determine which walls touch:
  - room1.north touches room2.south (and vice versa)
  - room1.east touches room2.west (and vice versa)
  - Return wall sides for both rooms

- [x] **6.1.5** Calculate shared wall segment:
  ```typescript
  interface SharedWall {
    room1Wall: WallSide
    room2Wall: WallSide
    length: number
    startPosition: number  // 0.0-1.0 along room1's wall
    endPosition: number    // 0.0-1.0 along room1's wall
  }
  ```

- [x] **6.1.6** Handle rotated rooms:
  - Account for room rotation when determining wall sides
  - Transform room coordinates before comparison

### Unit Tests (`tests/unit/services/adjacency/detection.test.ts`)

- [x] Adjacent rooms detected correctly (horizontal)
- [x] Adjacent rooms detected correctly (vertical)
- [x] Non-adjacent rooms return null
- [x] Partial overlap calculated correctly
- [x] Tolerance handles floating point errors
- [x] Rotated rooms detected correctly

---

## Task 6.2: Adjacency Graph

**File**: `src/services/adjacency/graph.ts`

### Subtasks

- [x] **6.2.1** Create `AdjacencyGraph` class:
  ```typescript
  class AdjacencyGraph {
    private connections: Map<string, RoomConnection[]>

    addConnection(connection: RoomConnection): void
    removeConnection(connectionId: string): void
    getConnectionsForRoom(roomId: string): RoomConnection[]
    getConnection(room1Id: string, room2Id: string): RoomConnection | null
    getAllConnections(): RoomConnection[]
    getAdjacentRoomIds(roomId: string): string[]
  }
  ```

- [x] **6.2.2** Implement graph data structure:
  - Bidirectional edges (A→B implies B→A)
  - Store connection data on edges

- [x] **6.2.3** Create `buildGraph(rooms: Room[]): AdjacencyGraph`
  - Iterate all room pairs
  - Detect adjacencies
  - Build graph from results

- [x] **6.2.4** Optimize with spatial indexing:
  - Only check nearby rooms for adjacency
  - Use bounding box quick-reject

- [x] **6.2.5** Create `rebuildConnections(floorplan: Floorplan): void`
  - Clears existing connections
  - Rebuilds from current room positions
  - Updates store
  - *Note: Implemented as `calculateAllConnections(rooms: Room[]): RoomConnection[]` helper function.*

### Unit Tests

- [x] Graph stores connections correctly
- [x] Bidirectional lookup works
- [x] getAdjacentRoomIds returns correct rooms
- [x] buildGraph creates correct connections
- [x] Rebuild clears and recreates

---

## Task 6.3: Connection Store Integration

**File**: `src/stores/floorplanStore.ts` (additions)

### Subtasks

- [x] **6.3.1** Add connection state to store:
  ```typescript
  connections: RoomConnection[]
  ```

- [x] **6.3.2** Add connection actions:
  ```typescript
  recalculateConnections(): void
  getAdjacentRooms(roomId: string): Room[]
  getConnection(room1Id: string, room2Id: string): RoomConnection | null
  ```

- [x] **6.3.3** Trigger recalculation:
  - When room added
  - When room deleted
  - When room position changes
  - When room dimensions change
  - Debounced (300ms)

- [x] **6.3.4** Create selector hooks:
  ```typescript
  useAdjacentRooms(roomId: string): Room[]
  useRoomConnections(roomId: string): RoomConnection[]
  ```

### Unit Tests

- [x] Connections recalculate on room add
- [x] Connections update on room move
- [x] Selectors return correct data

---

## Task 6.4: Connection Visualization (2D)

**File**: `src/components/editor/ConnectionLines.tsx`

### Subtasks

- [x] **6.4.1** Create connection line component:
  - Draws dashed line between room centers
  - Line color: light gray
  - Only shown when "Show Connections" enabled

- [ ] **6.4.2** Show shared wall indicator:
  - Highlight shared wall segment
  - Different color (e.g., blue)

- [ ] **6.4.3** Show door positions on connections:
  - Small circle or door icon
  - Positioned along shared wall

- [x] **6.4.4** Create hover info:
  - Hover over connection line
  - Show tooltip: "Kitchen ↔ Living Room (3.2m shared wall)"

- [x] **6.4.5** Toggle visibility:
  - Checkbox in View menu
  - Default: off (reduces visual clutter)

### Unit Tests

- [x] Connection lines render between adjacent rooms
- [x] Lines not shown for non-adjacent rooms
- [x] Toggle hides/shows lines
- [ ] Door icons appear on connections with doors

---

## Task 6.5: Adjacent Rooms Panel

**File**: `src/components/properties/AdjacentRoomsSection.tsx`

### Subtasks

- [x] **6.5.1** Create adjacent rooms list in properties panel:
  - Section header: "Adjacent Rooms"
  - List connected rooms when a room is selected

- [x] **6.5.2** Display connection info:
  - Room name (clickable to select)
  - Shared wall length
  - Number of doors
  - Wall sides: "North wall → South wall"

- [ ] **6.5.3** Add door button:
  - "+ Add Door" button per connection
  - Opens door creation flow

- [x] **6.5.4** Handle no adjacencies:
  - Message: "No adjacent rooms"
  - Hint: "Move rooms closer to create connections"

- [x] **6.5.5** Click to navigate:
  - Click room name → select that room
  - Scrolls 2D view to show both rooms

### Unit Tests

- [x] Adjacent rooms listed correctly
- [x] Shared wall length displayed
- [x] Click navigates to adjacent room
- [ ] Add Door button triggers action

---

## Task 6.6: Path Finding (Advanced)

**File**: `src/services/adjacency/pathfinding.ts`

### Subtasks

- [x] **6.6.1** Implement `findPath(startRoomId: string, endRoomId: string): string[]`
  - Uses BFS on adjacency graph
  - Returns array of room IDs forming path
  - Returns empty array if no path exists

- [ ] **6.6.2** Implement path visualization:
  - Highlight rooms in path
  - Show arrows indicating direction

- [x] **6.6.3** Calculate path distance:
  - Sum of distances between room centers
  - Or: sum of door-to-door distances

- [ ] **6.6.4** Use cases:
  - "How do I get from Bedroom to Kitchen?"
  - Visualization for wayfinding
  - Future: evacuation route planning

### Unit Tests

- [x] Direct path found for adjacent rooms
- [x] Multi-hop path found correctly
- [x] No path returns empty array
- [x] Shortest path returned when multiple exist

---

## Task 6.7: Connection Validation

**File**: `src/services/adjacency/validation.ts`

### Subtasks

- [ ] **6.7.1** Detect orphan rooms:
  - Rooms with no connections
  - Warning: "Kitchen has no adjacent rooms"

- [ ] **6.7.2** Detect unreachable rooms:
  - Rooms not connected to main group
  - Warning: "Garage is not connected to rest of house"

- [ ] **6.7.3** Validate door placement:
  - Doors must be on shared walls
  - Door width must fit on shared wall length
  - Error if door larger than shared wall

- [ ] **6.7.4** Check for invalid overlaps:
  - Rooms should not overlap (different from adjacent)
  - Error: "Kitchen and Living Room overlap"

- [ ] **6.7.5** Report validation results:
  ```typescript
  interface ConnectionValidation {
    orphanRooms: string[]
    unreachableRooms: string[]
    invalidDoors: { doorId: string; reason: string }[]
    overlappingRooms: [string, string][]
  }
  ```

### Unit Tests

- [ ] Orphan rooms detected
- [ ] Unreachable rooms detected
- [ ] Overlapping rooms flagged
- [ ] Invalid door placement caught

---

## Task 6.8: Manual Connection Override (Advanced)

**File**: `src/services/adjacency/manualConnections.ts`

### Subtasks

- [ ] **6.8.1** Allow manual connection creation:
  - User can force-connect non-adjacent rooms
  - Use case: rooms on different floors (future)
  - Use case: rooms connected by hallway

- [x] **6.8.2** Create "Link Rooms" UI:
  - Select two rooms
  - Click "Link Rooms" button
  - Creates virtual connection

- [x] **6.8.3** Allow connection deletion:
  - Remove auto-detected connection
  - Use case: rooms touch but shouldn't be connected

- [x] **6.8.4** Mark manual connections:
  - Visual indicator for manual vs auto connections
  - Different line style in 2D view

### Unit Tests

- [ ] Manual connection creates link
- [ ] Manual connection persists after recalculation
- [ ] Connection deletion removes link

---

## Integration Tests

**File**: `tests/integration/adjacency.integration.test.tsx`

### Test Cases

- [x] **Auto-detection**: Create adjacent rooms → verify connection detected
- [x] **Move apart**: Move room away → verify connection removed
- [x] **Multi-room**: Create 5 connected rooms → verify graph correct
- [x] **Manual Connections**: Create, persist, and cleanup manual connections
- [ ] **Path finding**: Create chain of rooms → verify path found
- [ ] **Validation**: Create overlapping rooms → verify warning shown
- [ ] **Selection sync**: Select connection → verify both rooms highlighted

---

## Acceptance Criteria

- [x] Adjacent rooms automatically detected
- [x] Connection graph updates when rooms change
- [ ] Adjacent rooms panel shows correct info
- [ ] Connection lines display in 2D view (when enabled)
- [ ] Path finding works for connected rooms
- [ ] Validation catches orphan and overlapping rooms
- [ ] Unit test coverage > 85%

---

## Files Created

```
src/
├── services/
│   └── adjacency/
│       ├── detection.ts
│       ├── graph.ts
│       ├── pathfinding.ts
│       ├── validation.ts
│       └── manualConnections.ts
└── components/
    ├── editor/
    │   └── ConnectionLines.tsx
    └── properties/
        └── AdjacentRoomsSection.tsx

tests/
├── unit/
│   └── services/
│       └── adjacency/
│           ├── detection.test.ts
│           ├── graph.test.ts
│           └── pathfinding.test.ts
└── integration/
    └── adjacency.integration.test.tsx
```
