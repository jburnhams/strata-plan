# Floorplan App: Complete Feature Specification

## Executive Summary

A browser-based, offline-first floorplan tool designed for homeowners who "have a house and a tape measure and want a floorplan by just typing numbers." The app starts as a dead-simple room-dimensions table and progressively reveals more complex drawing, 3D visualization, editing, and sharing tools as users need them.

**Core Promise:** Create a professional 3D floorplan in under 5 minutes by entering room measurements into a table.

**Architecture:** React + TypeScript, Three.js 3D, IndexedDB persistence, client-side export/import. No backend required. Deploys as a static site to Vercel.

---

## Design Philosophy

1. **Numbers-First MVP:** Users reach their first 3D floorplan via numeric input only. No drawing tools, no learning curve.
2. **Progressive Complexity:** Features unlock as users need them—drawing mode, doors/windows, materials, sharing—not forced upfront.
3. **100% Client-Side:** All logic, storage, and rendering happen in the browser. Data never leaves the user's device. No backend, no servers, no sync overhead initially.
4. **Spatial Modeling:** Rooms are not isolated boxes; they form a connected graph. The system automatically detects adjacencies, shared walls, and door placements.
5. **Accessible and Mobile:** Works on desktop, tablet, and phone. Full keyboard navigation, ARIA labels, color-blind palettes.

---

## Phase 1: MVP (Weeks 1–8)

### 1.1 Landing Page

**Purpose:** Welcome users and guide them to create their first floorplan.

**Visual Design:**
- Clean, minimal layout.
- Brand/title and one-line value proposition: "Enter room dimensions, get a 3D floor plan."
- Primary CTA button: "Create New Floorplan" (large, obvious, primary color).
- Secondary actions: "Try Demo" (pre-made 3-room example), "Import File" (JSON/glTF).
- Optional light/dark mode toggle (top-right).

**Features:**
- [ ] Clear messaging: no jargon, no drawing terminology.
- [ ] Demo link pre-loads a sample 3-room house floorplan.
- [ ] Import link accepts JSON or glTF files from prior exports.
- [ ] Responsive layout: stacked on mobile, horizontal on desktop.
- [ ] Quick keyboard shortcut hints (e.g., "Ctrl+N to create new").

---

### 1.2 New Floorplan Dialog

**Purpose:** Initialize a new project with minimal friction.

**Dialog Fields:**
- **Project Name** (text input)
  - Auto-filled with "My House" or "Project 1".
  - Max 100 characters.
  - Editable later in project settings.

- **Measurement Units** (radio buttons)
  - Options: Meters, Feet, or Custom ratio.
  - Default: Meters.
  - Sets the unit suffix for all numeric inputs.

**Buttons:**
- [ ] "Create Floorplan" → Opens main editor with a blank table and one empty row.
- [ ] "Cancel" → Returns to landing page.

**Validation:**
- Project name is required (non-empty).
- Error toast if creation fails (e.g., IndexedDB issue).

---

### 1.3 Main Editor: Room Input Table

**Purpose:** Primary interface where users enter room dimensions. Remains the default view throughout MVP.

**Table Structure:**
Each row represents one room with the following columns:

| Column | Type | Details |
|--------|------|---------|
| **Room Name** | Text input | Editable, ~30 char max. E.g., "Kitchen", "Master Bedroom". |
| **Length** | Number input | In project units (m or ft). Min 0.1, typically 2–10m. |
| **Width** | Number input | In project units. Min 0.1, typically 2–10m. |
| **Height** | Number input | Ceiling height in project units. Default 2.7m, range 1.5–4.0m. |
| **Type** | Dropdown | Bedroom, Kitchen, Bathroom, Living, Other. Selects default color. |
| **Area** | Display (read-only) | Length × Width, updated in real-time. E.g., "20.0 m²". |
| **Delete** | Button (×) | Removes the row after confirmation. |

**Add Room:**
- "+ Add Room" button at the bottom of the table.
- Clicking creates a new blank row.
- Auto-focuses the Name field.
- Typical user flow: enter name → tab through fields → enter next room.

**Totals Display (Below Table):**
- **Total Area:** Sum of all room areas. E.g., "Total Area: 120.5 m²".
- **Total Volume:** Sum of all room volumes (area × height). E.g., "Total Volume: 325.35 m³".
- **Room Count:** Number of rooms entered. E.g., "5 rooms".

**Validation (Real-Time):**
- [ ] Length > 0.1m: green checkmark. < 0.1m: red error icon + tooltip "Room too small".
- [ ] Width > 0.1m: green checkmark. < 0.1m: red error icon + tooltip "Room too small".
- [ ] Height in range 1.5–4.0m: green. Outside range: yellow warning + tooltip "Unusual ceiling height. Are you sure?"
- [ ] Room name non-empty: required.
- [ ] Field-level error icons appear in real-time; form is still submittable but with warnings.

**Keyboard Navigation:**
- [ ] **Tab:** Move to next cell in row. At end of row, move to first cell of next row.
- [ ] **Shift+Tab:** Move to previous cell.
- [ ] **Enter:** Commit current row and move to next row (or create new row if at end).
- [ ] **Escape:** Cancel edit mode for current cell.
- [ ] **Ctrl+Enter:** Add new room row.
- [ ] **Delete/Backspace:** In cell, delete character. If entire row selected, delete row with confirmation.

**Color Coding (Row Backgrounds):**
- Type-based colors for visual organization:
  - Bedroom → Light blue (#93c5fd)
  - Kitchen → Light orange (#fed7aa)
  - Bathroom → Light cyan (#a5f3fc)
  - Living → Light yellow (#fef3c7)
  - Other → Light gray (#e5e7eb)

---

### 1.4 Room Properties Panel (Minimal)

**Purpose:** Allow simple customization of individual rooms after they are created.

**Activation:**
- Click on a room row in the table or in the 2D layout → properties panel appears on the right sidebar.

**Properties:**
- [ ] **Room Name** (editable text field)
- [ ] **Room Type** (dropdown: Bedroom, Kitchen, Bathroom, Living, Other)
  - Selecting type auto-updates default color.
- [ ] **Ceiling Height** (slider or number input)
  - Range: 1.5m to 4.0m.
  - Step: 0.1m.
  - Real-time sync to table and 3D preview.
- [ ] **Color Picker** (optional, click to override default type color)
  - Shows color swatch and hex input.
  - Updates room color immediately in table and 3D.
- [ ] **Delete Room Button**
  - Confirmation dialog: "Delete this room and its connections?"
  - Yes → removes room from table, updates adjacencies, updates 3D.

---

### 1.5 2D Layout Visualization

**Purpose:** Show room spatial layout and connections in a simple, clear 2D view. Helps users understand how their rooms relate to each other.

**Visual Elements (SVG-based):**
- [ ] **Room Rectangles:** Each room drawn as a rectangle, positioned by its (x, z) coordinates, scaled by a factor (e.g., 20 pixels per meter).
- [ ] **Room Labels:** Room name and area (m²) displayed inside each rectangle, centered.
- [ ] **Room Colors:** Use the same type-based colors as the table rows.
- [ ] **Connection Lines:** Dashed lines connecting centers of adjacent rooms (light gray, subtle).
- [ ] **Door Markers:** Small circles (orange) positioned along shared walls where doors are placed.
- [ ] **Grid/Snap Indicators:** Optional light grid overlay for reference.

**Interaction:**
- [ ] **Click a room:** Highlights it with a thicker border, shows its properties in the right panel, lists adjacent rooms below.
- [ ] **Adjacent Room List (Below Viewer):**
  - Shows all rooms touching this room.
  - Format: "Living Room (1 door), Hallway (1 door), Master Bedroom (0 doors)".
  - Click to jump to that room.

**Auto-Layout Behavior (MVP):**
- Rooms are automatically positioned left-to-right with 1m gaps between them.
- User cannot manually drag/reposition in MVP (added in Phase 2).
- Layout recalculates whenever room dimensions change.

---

### 1.6 3D Preview Viewer

**Purpose:** Instantly show a 3D model of the floorplan. Gives users immediate visual feedback on their design.

**Access:**
- [ ] "View 3D" button in top toolbar or properties panel.
- [ ] Opens a modal or full-screen view.

**3D Rendering:**
- [ ] **Ground Plane:** Light gray infinite plane (z=0) representing the floor.
- [ ] **Room Boxes:** Each room as a BoxGeometry with dimensions (length × height × width), positioned by room coordinates.
- [ ] **Room Colors:** Match the type-based colors from the table.
- [ ] **No Materials/Textures (MVP):** Simple phong shading, solid colors. Textures added in Phase 4.
- [ ] **No Doors/Windows (MVP):** Just room volumes. Openings added in Phase 3.

**Camera and Controls:**
- [ ] **Default View:** Isometric (45° angle, slightly elevated).
- [ ] **Orbit Camera:** 
  - Drag with middle-mouse or two-finger to rotate around scene.
  - Scroll wheel or pinch to zoom in/out.
  - Right-click drag or Shift+middle-mouse to pan.
- [ ] **Preset Views (Buttons):**
  - Isometric (default)
  - Top-down (bird's eye, 90° overhead)
  - Front (looking north)
  - Side (looking east)
- [ ] **Reset View:** Double-click or "Reset" button to return to default isometric.
- [ ] **Keyboard:**
  - Arrow keys to pan.
  - +/- to zoom.
  - R to reset view.

**Lighting and Rendering:**
- [ ] **Brightness Slider:** Adjust global ambient light (0–200%, default 100%).
- [ ] **Auto-Updates:** Any change in the room table (add, delete, resize, change type) updates the 3D in real-time, debounced.

**Download / Export:**
- [ ] **"Download glTF" Button:** Exports the 3D model as a .gltf file for viewing in other tools.
- [ ] **"Back" Button:** Returns to table editor.

**Performance:**
- [ ] Typical render: 50–200ms.
- [ ] Target frame rate: 60 FPS on mainstream laptops.
- [ ] FPS indicator (optional): "60 FPS" in corner; warn if <30 FPS.

---

### 1.7 Save, Export, and IndexedDB Storage

**Purpose:** Persist projects locally and export in multiple formats for sharing or external use.

#### Auto-Save and Manual Save

- [ ] **Auto-Save:** Every ~30 seconds, project is silently saved to IndexedDB.
- [ ] **Visual Indicator:** Small cloud icon in top-right (or status bar):
  - ☁ Saving (gray, spinning)
  - ✓ Saved (green)
  - ✕ Error (red)
- [ ] **Manual Save:** Ctrl+S hotkey triggers immediate save.
  - Toast notification: "Project saved".
- [ ] **Unsaved Changes:** If user closes/navigates away with unsaved work:
  - Browser confirmation dialog: "You have unsaved changes. Leave anyway?"

#### Export Formats

**Export Dialog:**
- [ ] "Export" dropdown button in top toolbar.
- [ ] Opens dialog with format options, filename input, and "Download" button.

**Formats:**
- [ ] **JSON (Custom Format)**
  - File: `ProjectName_YYYY-MM-DD.json`
  - Content: Serialized Floorplan object (rooms, connections, metadata).
  - Use: Re-import into app later, or share with others.
  - Size: ~1–10 KB for typical projects.

- [ ] **glTF (3D Model)**
  - File: `ProjectName_YYYY-MM-DD.gltf`
  - Content: Three.js GLTFExporter output (geometry, materials, scene graph).
  - Use: View in Babylon.js, Sketchfab, Blender, or other 3D tools.
  - Size: ~10–50 KB for typical projects.

- [ ] **PDF (2D Floorplan Report)**
  - File: `ProjectName_YYYY-MM-DD.pdf`
  - Content: 
    - Project title and summary (name, total area, total volume, units).
    - Room table with columns (name, length, width, height, area).
    - 2D layout diagram (if space allows).
  - Use: Print or share in non-digital form.
  - Generated via jsPDF library.

**Download Behavior:**
- [ ] File downloads to user's default Downloads folder via browser download API.
- [ ] Toast notification: "Exported as PDF" with filename and size.

#### Import / Open

- [ ] **Import Button:** "File → Open" or dedicated "Import" link on landing page.
- [ ] **File Picker Dialog:** 
  - Drag-drop zone: "Drop JSON, glTF, or PDF here".
  - Or click to browse file system.
- [ ] **Supported Formats:**
  - JSON (custom format) → full re-import with all properties.
  - glTF (experimental) → attempts to parse geometry and create rooms (simplified for MVP).
  - PDF (future) → trace-based extraction (not MVP).
- [ ] **Validation:**
  - Check file integrity and format.
  - If invalid: Error toast "Invalid file format".
  - If valid: Import preview or direct load.
- [ ] **Confirmation:**
  - If importing over existing project: "Replace current project?" dialog.
- [ ] **Success:** Project loads into editor, updates all views.

---

### 1.8 Project Management and List View

**Purpose:** Browse, organize, and manage past projects.

**Project List Page:**
- [ ] Access via "File → Recent Projects" or home icon.
- [ ] Shows all projects stored in IndexedDB.

**Project Cards:**
Each card displays:
- [ ] **Thumbnail:** 2D or 3D preview of the floorplan.
- [ ] **Project Name** (editable inline via double-click).
- [ ] **Room Count:** E.g., "5 rooms".
- [ ] **Total Area:** E.g., "120.5 m²".
- [ ] **Last Modified:** E.g., "2 days ago".
- [ ] **Actions (Right-Click Context Menu):**
  - Open → Load project into editor.
  - Rename → Inline text edit.
  - Duplicate → Creates copy with "(copy)" suffix, saves to IndexedDB.
  - Export → Quick export to JSON/glTF/PDF.
  - Delete → Confirmation dialog, removes from IndexedDB.

**Search and Sort:**
- [ ] **Search Box:** Filter projects by name as user types.
- [ ] **Sort Options:** Newest, Oldest, Name (A–Z), Area (small–large).

---

### 1.9 Top Toolbar and Menus

**Top Toolbar Layout:**
```
[File ▼] [Edit ▼] [View ▼] [Tools] | [View 3D] [Export ▼] [?]
```

**File Menu:**
- [ ] New Project (Ctrl+N)
- [ ] Open Project (Ctrl+O)
- [ ] Recent Projects (submenu)
- [ ] Save (Ctrl+S)
- [ ] Save As
- [ ] Revert to Last Saved
- [ ] Import
- [ ] Export (Ctrl+Shift+E)
- [ ] Project Settings
- [ ] Exit

**Edit Menu:**
- [ ] Undo (Ctrl+Z)
- [ ] Redo (Ctrl+Y)
- [ ] Cut (Ctrl+X)
- [ ] Copy (Ctrl+C)
- [ ] Paste (Ctrl+V)
- [ ] Duplicate (Ctrl+D)
- [ ] Delete (Del)
- [ ] Select All (Ctrl+A)
- [ ] Deselect (Escape)
- [ ] Preferences

**View Menu:**
- [ ] 2D Editor (Ctrl+2) – Focus on table.
- [ ] 3D Preview (Ctrl+3) – Open 3D viewer.
- [ ] 2D + 3D Split View
- [ ] Dark Mode / Light Mode
- [ ] Reset Zoom
- [ ] Full Screen (F)
- [ ] Measurement Units (Submenu: Meters, Feet, Custom)

**Tools (Icon Buttons or Dropdown):**
- [ ] View 3D (prominent button)
- [ ] Export (dropdown)
- [ ] Help / Support (?)

---

### 1.10 Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| **New Project** | Ctrl+N |
| **Open Project** | Ctrl+O |
| **Save** | Ctrl+S |
| **Undo** | Ctrl+Z |
| **Redo** | Ctrl+Y |
| **Cut** | Ctrl+X |
| **Copy** | Ctrl+C |
| **Paste** | Ctrl+V |
| **Duplicate** | Ctrl+D |
| **Delete** | Del |
| **Select All** | Ctrl+A |
| **Deselect** | Esc |
| **Add Room** | Ctrl+Insert |
| **View 3D** | Ctrl+3 |
| **Export** | Ctrl+Shift+E |
| **2D View** | Ctrl+2 |
| **Full Screen** | F |
| **Help** | ? or Ctrl+H |
| **Table Tab Navigation** | Tab / Shift+Tab |
| **Zoom In** | + |
| **Zoom Out** | - |
| **Reset View** | R (in 3D) |

---

### 1.11 Validation and Error Handling

**Input Validation (Real-Time):**
- [ ] Room name: Non-empty, max 100 chars.
- [ ] Length: > 0.1m. Warning if < 1m or > 50m.
- [ ] Width: > 0.1m. Warning if < 1m or > 50m.
- [ ] Height: 1.5–4.0m. Warning if outside range.
- [ ] Type: Must be one of the predefined values.
- [ ] Duplicate room names: Allowed but warn user.

**Error Messages (Non-Technical, Friendly):**
- [ ] "Kitchen room is too small. Try increasing length or width. Minimum 0.5 m²."
- [ ] "Ceiling height 5m is unusual. Are you sure? (Typical: 2.4–3m)"
- [ ] "File too large (>50MB). Try exporting in a different format."
- [ ] "Can't save right now. Check your browser storage quota."
- [ ] "Room name is required."

**Toast Notifications:**
- [ ] Success: "Project saved", "Exported as PDF".
- [ ] Error: "Failed to save. Try again.", "Import failed: Invalid file format".
- [ ] Info: "3 rooms added", "Project duplicated as 'My House (copy)'".

---

### 1.12 Accessibility Features

- [ ] **Keyboard Navigation:** All functions accessible via Tab, Enter, Escape, and arrow keys. No mouse required.
- [ ] **Screen Reader Support:**
  - ARIA labels on buttons and inputs.
  - Semantic HTML structure (headers, lists, landmarks).
  - Form field associations via `<label>`.
  - Error announcements via ARIA live regions.
- [ ] **High Contrast Mode:** Toggle in preferences; text and backgrounds meet WCAG AA standards (4.5:1 ratio).
- [ ] **Color-Blind Palette:** Option to switch to color-blind-friendly colors (Deuteranopia, Protanopia, Tritanopia).
- [ ] **Focus Indicators:** Blue outline on focused elements, visible and clear.
- [ ] **Text Sizing:** Respects browser zoom and font-size overrides. Min 12px for readability.

---

### 1.13 Mobile and Responsive Design

**Breakpoints:**
- **Desktop (> 1200px):** Full horizontal layout (table on left, properties on right, 3D viewer full screen).
- **Tablet (768–1200px):** Table narrower, properties panel slides in from right. Horizontal scroll on table if needed.
- **Phone (< 768px):** Vertical stacked layout.
  - Table switches to card view: one room per card, stacked vertically.
  - Properties panel appears below or in a modal.
  - Each room card shows all fields with large tap targets (min 44px).
  - Swipe to navigate between room cards.

**Touch Gestures:**
- [ ] **Two-Finger Pinch:** Zoom in/out on 3D viewer.
- [ ] **Two-Finger Drag:** Pan in 3D viewer.
- [ ] **Long-Press:** Context menu on room card or table row.
- [ ] **Swipe Left/Right:** Navigate between room cards (phone).

---

### 1.14 Help, Tutorials, and Onboarding

- [ ] **Quick Start Overlay (First Visit):**
  - "Welcome! Let's create your first floorplan."
  - Step 1: "Enter a room name. Try 'Kitchen'."
  - Step 2: "Type length (5.0) and width (4.0)."
  - Step 3: "Click 'View 3D' to see your room in 3D!"
  - "Next" button progresses; can skip.

- [ ] **Tooltips:**
  - Hover over fields to see hints: "Length in meters" or "Select room type to auto-color".
  - Keyboard shortcut hints in tooltips (e.g., "Save (Ctrl+S)").

- [ ] **FAQ Section (in Help menu):**
  - "What units does the app use?" → Meters, feet, or custom.
  - "Can I change ceiling height?" → Yes, per room.
  - "Can I add doors/windows?" → Coming soon (Phase 3).
  - "How do I export?" → Click Export, choose format.
  - "Can I share my floorplan?" → Coming soon (Phase 5).

- [ ] **Help Panel / Support:**
  - Link to online docs or GitHub wiki.
  - Email or feedback form for issues.
  - Keyboard shortcuts reference (printable PDF).

---

## Spatial Data Model and Room Connectivity

### 2.1 Core TypeScript Data Model

**Room Class:**
```typescript
class Room {
  id: string;                           // UUID
  name: string;                         // "Kitchen", "Bedroom 1", etc.
  length: number;                       // X dimension (meters or feet)
  width: number;                        // Z dimension
  height: number;                       // Y (ceiling) dimension, default 2.7m
  type: 'bedroom' | 'kitchen' | 'bathroom' | 'living' | 'other';
  color?: string;                       // Hex override (optional)
  position: { x: number; z: number };   // 2D position in plan (top-left corner)
  rotation: number;                     // Rotation in degrees (0, 90, 180, 270)
  
  // Helper methods
  getArea(): number;                    // Returns length × width
  getVolume(): number;                  // Returns area × height
  getCenter(): { x: number; z: number }; // Center point for connections
  getBounds(): BBox;                    // Axis-aligned bounding box
  getWalls(): Wall[];                   // Returns 4 walls (north/south/east/west)
  getDefaultColor(): string;            // Type-based color
}
```

**Floorplan Class:**
```typescript
class Floorplan {
  id: string;                           // UUID
  name: string;                         // Project name
  units: 'meters' | 'feet';
  rooms: Room[];                        // List of all rooms
  connections: RoomConnection[];        // Adjacencies and doors
  createdAt: Date;
  updatedAt: Date;
  
  // Helper methods
  addRoom(room: Room): void;
  removeRoom(roomId: string): void;
  updateRoom(roomId: string, updates: Partial<Room>): void;
  getTotalArea(): number;
  getTotalVolume(): number;
  getAdjacentRooms(roomId: string): Room[];
  getConnection(room1Id: string, room2Id: string): RoomConnection | null;
  addDoor(room1Id, room2Id, position, width, type, swing): Door;
  removeDoor(room1Id, room2Id, doorId): void;
  toJSON(): FloorplanData;
  static fromJSON(data: FloorplanData): Floorplan;
}
```

**Connection Types:**
```typescript
interface RoomConnection {
  id: string;
  room1Id: string;
  room2Id: string;
  room1Wall: 'north' | 'south' | 'east' | 'west';
  room2Wall: 'north' | 'south' | 'east' | 'west';
  sharedWallLength: number;             // In meters or feet
  doors: Door[];
}

interface Door {
  id: string;
  connectionId: string;
  position: number;                     // 0.0–1.0 along wall
  width: number;
  type: 'single' | 'double' | 'sliding' | 'pocket';
  swing: 'inward' | 'outward';
}
```

---

### 2.2 Adjacency Detection

**Algorithm:**
1. For each pair of rooms, compare their bounding boxes.
2. If two boxes share an edge (within 1cm tolerance) with overlap > 10cm, they are adjacent.
3. Determine which walls meet (e.g., room1 north = room2 south).
4. Calculate shared wall length.
5. Create `RoomConnection` object.

**Methods:**
```typescript
class AdjacencyGraph {
  static detectAdjacencies(rooms: Room[]): RoomConnection[];
  static findConnection(room1: Room, room2: Room): RoomConnection | null;
  static getAdjacentRooms(room: Room, connections: RoomConnection[]): string[];
  static addDoor(connection: RoomConnection, ...): Door;
  static removeDoor(connection: RoomConnection, doorId: string): void;
  static getDoorWorldPosition(room: Room, connection: RoomConnection, door: Door): { x, z };
}
```

---

### 2.3 Auto-Layout and Room Positioning

**MVP Behavior:**
- Rooms are automatically positioned left-to-right in a single row with 1m gaps.
- Position is recalculated whenever room dimensions or count changes.
- User enters only dimensions; system infers positions and adjacencies.

**Formula:**
```
room1.position = { x: 0, z: 0 }
room2.position = { x: room1.length + 1, z: 0 }
room3.position = { x: room1.length + 1 + room2.length + 1, z: 0 }
...
```

---

## Phase 2: Optional Draw Mode (Weeks 9–12)

**Purpose:** For power users who want manual wall drawing, not just room tables.

**Features (Not MVP):**
- [ ] Toggle: "Table Mode" (numbers-first, default) vs. "Draw Mode" (canvas-based).
- [ ] Draw Mode canvas with:
  - Blank 2D canvas.
  - Draw Wall tool (click point A → point B → wall created).
  - Select tool to move/edit walls.
  - Auto-detect enclosed areas as rooms.
  - Click inside area → "Create room?" dialog.
- [ ] Bidirectional conversion:
  - Table → Draw: Render room rectangles as walls.
  - Draw → Table: Extract rooms and populate table.

**Rationale:** MVP users are happy with table input. Drawing is optional for later adoption.

---

## Phase 3: Doors, Windows, and Openings (Weeks 13–16)

**Purpose:** Specify building openings on shared walls.

**Features (Not MVP):**
- [ ] Per-room sections in table:
  - Door count (dropdown: 0–4, or "custom").
  - Door width (input, default 0.9m).
  - Door type (single swing, double, sliding, pocket).
  - Window count (dropdown: 0–4).
  - Window width (input, default 1.2m).
  - Window type (single-pane, double-pane, triple-pane).
- [ ] 3D rendering:
  - Doors shown as cutouts or meshes on walls.
  - Windows as cutouts with semi-transparent glass.
  - Proper positioning along shared walls.
- [ ] 2D layout:
  - Doors and windows drawn with standard plan symbols.

---

## Phase 4: Materials and Styling (Weeks 17–20)

**Purpose:** Add visual richness and realistic rendering.

**Features (Not MVP):**
- [ ] Material picker per room:
  - Floor: Wood, Tile, Carpet, Concrete, Laminate, Stone.
  - Wall: Drywall, Brick, Wood, Paint (custom color), Stone.
  - Ceiling: Drywall, Wood, Acoustic, Tile, Paint (custom color).
- [ ] Color schemes:
  - Auto-color by room type (bedrooms blue, kitchens orange, etc.).
  - User override via color picker.
  - Pre-made palettes: Modern, Vintage, Neutral.
  - Color-blind-friendly palette option.
- [ ] 3D rendering quality:
  - Material Quality dropdown: Simple (colors only), Standard (colors + textures), Detailed (textures + reflections).
  - Lighting controls: Brightness, sunlight direction, shadow quality.
  - Texture resolution: Auto-scaled based on render quality.

---

## Phase 5: Sharing and Collaboration (Weeks 21+)

**Purpose:** Share floorplans with clients, designers, or collaborators.

**Features (Not MVP, requires optional backend in later iterations):**
- [ ] Share button → generates shareable link.
  - Permissions: View-only, View + Comments, Edit.
  - Link expiry: Never, 7 days, 30 days, custom.
  - Optional password protection.
  - QR code for mobile scanning.
  - Social share buttons (Twitter, Facebook, LinkedIn, Email).
- [ ] Shared view (read-only 3D):
  - Clean UI, no editing tools.
  - 3D viewer with camera controls.
  - Room info on hover (name, area, dimensions).
  - Walking view option.
  - Screenshot / download as image.
- [ ] Comment annotations (if edit mode enabled):
  - Click 3D point → add text comment.
  - Comment bubble appears on model.
  - List of comments in sidebar.

**Note:** Sharing initially relies on file export (JSON/glTF). Cloud sync added later if demand justifies backend.

---

## Technology Stack and Architecture

### 3.1 Frontend

| Layer | Technology | Purpose |
|-------|-----------|---------|
| UI Framework | React 18 + TypeScript | Component-based UI, state management |
| UI Components | Shadcn/ui + Tailwind CSS | Pre-built accessible components, styling |
| 3D Rendering | Three.js | WebGL-based 3D visualization |
| State Management | React Context API or Zustand | Global state for floorplan, UI |
| Build Tool | Vite | Fast dev server, rapid HMR |
| Testing | Vitest + React Testing Library | Unit and component tests |

### 3.2 Storage and Persistence

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Local Storage | IndexedDB (browser API) | Persistent storage of floorplans |
| Settings | localStorage (browser API) | User preferences, UI state |
| Export/Import | File API + Blob | Client-side export to JSON/glTF/PDF |

### 3.3 Export and Data

| Format | Library | Purpose |
|--------|---------|---------|
| JSON | Native JSON | Custom floorplan format for re-import |
| glTF | GLTFExporter (Three.js) | 3D model for external viewers |
| PDF | jsPDF | Printable 2D report |

### 3.4 Deployment

| Aspect | Solution | Rationale |
|--------|----------|-----------|
| Hosting | Vercel or Netlify | Static hosting, free tier, instant deploys |
| DNS | Custom domain or Vercel subdomain | User-friendly URL |
| CDN | Included in Vercel/Netlify | Fast global content delivery |
| Backend | None (MVP) | All logic client-side, no server maintenance |

---

## Data Persistence and Offline Support

### 4.1 IndexedDB Schema

**Database Name:** `FloorplanApp`

**Object Store:** `projects`
```typescript
{
  keyPath: 'id',
  indexes: [
    { name: 'name', keyPath: 'name' },
    { name: 'updatedAt', keyPath: 'updatedAt' },
  ]
}
```

**Record Structure:**
```typescript
{
  id: "uuid-1234",
  name: "My House",
  units: "meters",
  rooms: [...],
  connections: [...],
  createdAt: 1702000000000,  // timestamp
  updatedAt: 1702100000000
}
```

### 4.2 Offline-First Experience

- [ ] All UI logic, 3D rendering, and calculations run client-side.
- [ ] Projects auto-save every ~30 seconds to IndexedDB.
- [ ] Works seamlessly offline after initial load.
- [ ] No network calls required for core functionality (MVP).
- [ ] Data syncing across devices handled via export/import (not cloud sync yet).
- [ ] Storage quota: ~50MB per site (varies by browser).

### 4.3 Export/Import for Sharing and Backup

- [ ] Users export projects as JSON for backup or sharing.
- [ ] Other users import JSON files to reload projects.
- [ ] glTF export for 3D model sharing.
- [ ] PDF export for print or email sharing.

---

## Performance Targets and Optimization

| Operation | Target | Notes |
|-----------|--------|-------|
| Create new project | <50ms | Instant UI feedback |
| Add room to table | <10ms | Negligible latency |
| Update room dimensions | <20ms | Real-time 3D updates |
| Save to IndexedDB | 10–50ms | Background, non-blocking |
| Generate 3D scene | 50–200ms | Depends on room count |
| Export to glTF | 100–300ms | Background task |
| Load project | 20–100ms | From IndexedDB |
| 3D render frame rate | 60 FPS | Smooth animation |

**Optimization Strategies:**
- [ ] Debounce room updates (wait 300ms before recalculating adjacencies).
- [ ] Use Web Workers for heavy calculations (if needed for large projects).
- [ ] IndexedDB reads/writes are async and non-blocking.
- [ ] 3D rendering is GPU-accelerated via WebGL.
- [ ] Lazy-load 3D viewer only when user clicks "View 3D".

---

## Mobile Considerations

### 5.1 Responsive Breakpoints

- **Phone (< 768px):** Single-column, card-based layouts, touch-friendly targets (44px min).
- **Tablet (768–1024px):** Hybrid layout, horizontal scrolling for table, sidebar properties.
- **Desktop (> 1024px):** Full multi-column layout, optimal use of space.

### 5.2 Touch Interactions

- [ ] Pinch to zoom in/out (3D viewer).
- [ ] Two-finger drag to pan/orbit.
- [ ] Long-press for context menus.
- [ ] Swipe to navigate between rooms (card view on phone).
- [ ] Tap to select/highlight rooms.

### 5.3 Mobile Optimizations

- [ ] Simplified toolbar: only essential tools on phone.
- [ ] "More" menu for secondary tools.
- [ ] Larger text and buttons for readability.
- [ ] Reduced 3D scene complexity on low-end devices.
- [ ] Option to reduce shadow quality and texture resolution.

---

## Accessibility (WCAG 2.1 AA Compliance)

### 6.1 Keyboard Navigation

- [ ] Tab through all interactive elements.
- [ ] Enter to activate buttons.
- [ ] Escape to close modals/dialogs.
- [ ] Arrow keys to adjust sliders.
- [ ] All features usable via keyboard alone.

### 6.2 Screen Reader Support

- [ ] Semantic HTML (`<header>`, `<main>`, `<nav>`, `<section>`, `<form>`, etc.).
- [ ] ARIA labels on buttons and icons.
- [ ] Form inputs associated with `<label>` or `aria-label`.
- [ ] Error messages announced via ARIA live regions.
- [ ] Landmark roles for navigation.

### 6.3 Visual Accessibility

- [ ] Minimum text contrast: 4.5:1 (normal text), 3:1 (large text).
- [ ] Focus indicators visible (blue outline, 2px minimum).
- [ ] Color not the only method to convey information (icons + labels).
- [ ] Color-blind palette option (Deuteranopia, Protanopia, Tritanopia).
- [ ] Zoom support: respects browser zoom up to 200%.

### 6.4 Motion and Animation

- [ ] Reduce motion support: respect `prefers-reduced-motion` CSS media query.
- [ ] No auto-playing animations.
- [ ] Animations are smooth (60 FPS) and non-jarring.

---

## Future Extensibility

### 7.1 Phase 2–5 Roadmap

- **Phase 2:** Optional draw mode for wall-based editing.
- **Phase 3:** Doors, windows, and openings with 3D/2D visualization.
- **Phase 4:** Materials, textures, and advanced rendering.
- **Phase 5:** Sharing, collaboration, and optional cloud sync.

### 7.2 Potential Future Features (Not MVP)

- Multi-floor support.
- Furniture placement and 3D library.
- Measurements and dimensional annotations.
- Export to formats: CAD (DWG), IFC, CityJSON.
- AR/VR viewing on mobile.
- Collaborative editing (requires backend).
- Advanced analytics (cost estimation, material lists).
- Integration with smart home or property listing platforms.

---

## Success Metrics

**MVP Success Criteria:**
- [ ] User can create a 3D floorplan in <5 minutes by typing room dimensions.
- [ ] No drawing tools required; learning curve is negligible.
- [ ] Export works for JSON, glTF, and PDF formats.
- [ ] Adjacencies are correctly detected and visualized.
- [ ] 3D rendering is smooth (60 FPS on typical hardware).
- [ ] Projects persist in IndexedDB and reload correctly.
- [ ] Mobile experience is usable on phones and tablets.
- [ ] No backend required; all logic is client-side.

**Engagement Metrics (Post-MVP):**
- [ ] Average project creation time.
- [ ] Export usage frequency.
- [ ] Return user rate (via browser storage detection).
- [ ] Feature adoption (if/when new phases are released).

---

## Summary

This floorplan app is a **progressive, user-centric tool** that starts simple (tape measure + table → 3D model) and grows in complexity as users demand it. By focusing the MVP on a single, high-value use case (rapid 3D floorplan generation from measurements), the product delivers immediate value without overwhelming novice users. The TypeScript + IndexedDB architecture keeps development fast and deployment costs near zero, while the modular design allows for controlled feature expansion in later phases.

The result is a product that competes with premium tools (Planner 5D, Homestyler) in core functionality but wins on **simplicity, speed, privacy, and offline support**—all delivered in a lightweight, browser-based experience.
