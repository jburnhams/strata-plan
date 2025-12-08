# Feature List: Detailed User Experience Journeys

## 1. PROJECT CREATION & MANAGEMENT

### 1.1 New Project Start
**User Journey:** First-time user opens app

- [ ] **Landing page with quick-start button**
  - Large "Create New Floorplan" button (primary CTA)
  - Recent projects carousel (if logged in)
  - "Try Demo" button links to pre-made example floorplan
  - "Import" button to load existing JSON/glTF files

- [ ] **New Project Dialog**
  - Input: Project name (auto-populated as "My Floorplan" or "Project 1")
  - Input: Scale unit selector (meters / feet / custom)
  - Input: Grid size (0.1m, 0.5m, 1m)
  - Input: Canvas dimensions (width × depth in chosen unit)
  - Checkbox: "Start with 2D template" (blank, rectangle, L-shape, multi-room)
  - Button: "Create" → Opens blank canvas

---

### 1.2 Project Dashboard / List View
**User Journey:** User wants to see all their projects

- [ ] **Project List Page**
  - Card view showing:
    - Project thumbnail (2D wireframe screenshot)
    - Project name
    - Last modified date ("2 days ago")
    - Room count ("5 rooms")
    - File size ("2.3 MB")
  - Grid/List view toggle
  - Search box (filter by name)
  - Sort options (newest, oldest, alphabetical, size)
  - Delete/duplicate/rename buttons (right-click context menu)
  - Bulk actions (select multiple → delete all)

- [ ] **Project Metadata Panel**
  - Edit project name (double-click card)
  - View created/modified timestamps
  - File size indicator
  - Delete project (with confirmation)
  - Duplicate project (creates copy with "_copy" suffix)
  - Export project (dropdown: JSON, glTF, PDF, CityJSON)

---

## 2. 2D FLOORPLAN EDITING

### 2.1 Canvas & Drawing Interface
**User Journey:** User draws walls on blank canvas

- [ ] **Canvas Viewport**
  - White/light gray background
  - Grid overlay (toggleable, customizable density)
  - Snap-to-grid enabled by default (can toggle with keyboard shortcut)
  - Coordinate display (top-left: current mouse position in units)
  - Zoom level indicator (bottom-right: "200%")
  - Panning indicator (hand cursor when middle-mouse dragging)

- [ ] **Toolbar (Top)**
  - **Draw Wall tool** (hotkey: W)
    - Click point A → click point B → wall created
    - Visual feedback: line appears as you drag
    - Wall snaps to grid or existing walls
    - Can continue drawing multiple walls without re-selecting tool
    - Press ESC to exit tool
  
  - **Select tool** (hotkey: S)
    - Click wall → wall highlights (blue outline)
    - Drag wall segment → move it
    - Double-click wall → edit properties
    - Multi-select: Hold Shift + click multiple walls
  
  - **Delete tool** (hotkey: DEL)
    - Click wall → delete (with visual feedback)
    - Or: Select wall + press DEL key
  
  - **Door/Window tool** (hotkey: D/W)
    - Select tool
    - Click on wall → door/window appears
    - Snaps to wall, can drag along wall to reposition
    - Shows frame preview
  
  - **Measurement tool** (hotkey: M)
    - Click two points → distance displayed inline
    - Measurement persists on canvas (toggle off via button)
  
  - **Undo/Redo** buttons (hotkeys: Ctrl+Z / Ctrl+Y)
    - Unlimited undo history
    - Visual indicator: "Undo (5 steps)" tooltip
  
  - **Zoom Controls**
    - Zoom In (+) button
    - Zoom Out (-) button
    - Zoom to Fit (zoom to show all walls)
    - Hotkeys: +/- or Scroll wheel
  
  - **View Options** (dropdown)
    - Grid on/off
    - Coordinates on/off
    - Room IDs on/off
    - Wall thickness visualization on/off

---

### 2.2 Wall Properties Panel (Left Sidebar)
**User Journey:** User selects a wall and wants to edit its properties

- [ ] **Wall Selection State**
  - Header: "Wall Properties" (if wall selected) or "No selection"
  - Display selected wall:
    - Wall ID (e.g., "Wall-1")
    - From coordinates (X, Y)
    - To coordinates (X, Y)
    - Length (calculated, read-only)
    - Angle (calculated, read-only)

- [ ] **Editable Wall Properties**
  - **Thickness slider/input**
    - Range: 0.05m to 0.5m
    - Default: 0.2m
    - Visual representation: wall line width increases as slider moves
  
  - **Material picker**
    - Dropdown: Concrete, Brick, Wood, Drywall, etc.
    - Display icon + name
  
  - **Color picker**
    - Color swatch (click to open palette)
    - Shows current color
  
  - **Sound rating dropdown** (optional)
    - Affects future acoustic properties
  
  - **Delete button**
    - Confirmation dialog: "Delete wall and reconnect rooms?"

- [ ] **Wall List (Scrollable)**
  - List of all walls in project
  - Each row: "Wall-1 (5.2m)" with small preview
  - Click row → wall highlights on canvas
  - Drag handle (≡) to reorder (visual only)

---

### 2.3 Drawing Interactions & Feedback
**User Journey:** User draws complex room layout with snapping and alignment

- [ ] **Snap-to-Grid Feedback**
  - Wall endpoint snaps to nearest grid intersection
  - Visual snap indicator: small circle appears at snap point
  - Tooltip: shows coordinates of snap point

- [ ] **Wall-to-Wall Snapping**
  - When drawing new wall near existing wall end, snaps to it
  - Visual feedback: existing wall endpoint highlights briefly
  - Helps close rooms without gaps

- [ ] **Angle Display While Drawing**
  - While dragging new wall, show angle relative to horizontal
  - Display: "45°" near cursor
  - Shows in red if <5° from cardinal direction (helps alignment)

- [ ] **Room Outline Highlighting**
  - When walls form enclosed area, outline pulses gently
  - Tooltip: "Enclosed area detected. Click inside to create room."

- [ ] **Duplicate Prevention**
  - If user tries to draw wall that overlaps existing, shows error: "This wall already exists"

---

### 2.4 Copy/Paste & Duplication
**User Journey:** User wants to copy wall layout to save time

- [ ] **Select Multiple Walls**
  - Shift+Click to add to selection
  - Shift+Click again to deselect
  - Or: Drag selection box around walls
  - Selected walls highlight in blue
  - Status bar shows: "5 walls selected"

- [ ] **Copy (Hotkey: Ctrl+C)**
  - Copies selected walls to clipboard
  - Toast notification: "5 walls copied"

- [ ] **Paste (Hotkey: Ctrl+V)**
  - Walls appear as outline (semi-transparent)
  - User can drag outline to new position
  - Press ENTER to confirm placement
  - Or press ESC to cancel
  - Pasted walls offset by grid increment to avoid overlap

- [ ] **Duplicate (Hotkey: Ctrl+D)**
  - Creates copy immediately offset by 1 grid unit
  - Original selection remains selected
  - Helpful for creating symmetric layouts

---

### 2.5 Guides & Alignment
**User Journey:** User wants to align walls to create professional layout

- [ ] **Smart Guides**
  - Horizontal/vertical guides appear as wall is dragged near parallel wall
  - Guide line shown in blue (temporary)
  - Wall snaps to guide when close enough
  - Distance between walls shown as measurement

- [ ] **Distribution Guides**
  - When moving wall, show distances to nearby walls
  - Helpful for spacing rooms evenly

---

## 3. ROOM CREATION & MANAGEMENT

### 3.1 Room Detection & Creation
**User Journey:** User has drawn walls, now wants to define rooms

- [ ] **Automatic Room Detection**
  - After drawing enclosed area, icon appears: "Create room from this area"
  - User clicks inside enclosed area → room created
  - Room assigned ID (Room-1, Room-2, etc.)
  - Room appears in sidebar with random color

- [ ] **Manual Room Definition**
  - Alternative: User can draw room by hand (advanced)
  - Click "Define room polygon" → click points → close polygon
  - Useful for non-rectangular spaces or when auto-detection fails

- [ ] **Room Visual Representation (2D)**
  - Room filled with semi-transparent color
  - Room ID displayed at center (e.g., "Room-1")
  - Room boundary highlighted when selected
  - Hover over room → shows room name tooltip

---

### 3.2 Room Properties Panel (Left Sidebar)
**User Journey:** User selects a room and wants to customize it

- [ ] **Room Selection State**
  - Header: "Room Properties" (if room selected)
  - Display selected room:
    - Room ID (e.g., "Room-3")
    - Calculated area (e.g., "12.5 m²")
    - Wall count (e.g., "4 walls")

- [ ] **Editable Room Properties**
  - **Name field**
    - Input: "Kitchen" (editable, max 30 chars)
    - Pressing ENTER confirms, shows in 2D
  
  - **Type dropdown**
    - Options: Bedroom, Kitchen, Bathroom, Living, Dining, Office, Hallway, Closet, Garage, Other
    - Selecting type auto-colors room (e.g., kitchens → orange)
    - Shows icon + name
  
  - **Color picker**
    - Color swatch (click to open palette)
    - Overrides type-based color
    - Palette shows recently used colors
  
  - **Ceiling Height slider**
    - Range: 2.0m to 3.5m
    - Default: 2.7m
    - Step: 0.1m
    - Numeric input also available
  
  - **Material picker**
    - Dropdown: Wood, Tile, Carpet, Concrete, etc.
    - Applied to floor surface
  
  - **Wall Thickness input (for entire room)**
    - Sets thickness for all walls of this room
    - Overrides individual wall thickness
  
  - **Acoustic Rating dropdown** (optional)
    - STC 30, STC 45, STC 60, etc.
    - Informational (used later for analysis)

- [ ] **Delete Button**
  - "Delete Room" button
  - Confirmation: "Delete room and keep walls?"
  - If yes: Room deleted, walls remain
  - If no: Room and walls both deleted

- [ ] **Duplicate Button**
  - "Duplicate Room"
  - Creates identical room with "_copy" suffix
  - Allows user to create symmetric layouts

---

### 3.3 Room List & Organization
**User Journey:** User wants overview of all rooms and quick access

- [ ] **Room List (Left Sidebar)**
  - List of all rooms in current project
  - Each row shows:
    - Room color swatch
    - Room name (editable inline via double-click)
    - Room area (e.g., "12.5 m²")
    - Room type icon (bed, pot, toilet, sofa)
  
  - Interactions:
    - Click room → highlight in 2D (blue outline)
    - Double-click room → edit properties in panel
    - Drag handle (≡) to reorder list
    - Right-click → context menu (rename, delete, duplicate, lock)

- [ ] **Room Filtering/Sorting**
  - Sort by: Name, Area, Type
  - Filter by: Type (show only bedrooms, kitchens, etc.)

- [ ] **Room Search**
  - Search box above list
  - Filter rooms by name as user types

---

### 3.4 Room Adjacency & Connectivity
**User Journey:** User wants to understand which rooms connect

- [ ] **Visual Connectivity**
  - When room selected, adjacent rooms show subtle highlight
  - Connection lines appear between adjacent rooms (toggleable)
  - Shows which walls are shared

- [ ] **Adjacency List**
  - In room properties panel: "Adjacent Rooms"
  - List of connected rooms (with door count)
  - E.g., "Kitchen (1 door) → Living Room (2 doors)"

- [ ] **Connection Matrix (Advanced View)**
  - Toggle button: "Show Connections Matrix"
  - Table showing room-to-room connections
  - Cell shows door/opening count between rooms

---

## 4. DOORS & WINDOWS

### 4.1 Door/Window Placement
**User Journey:** User clicks on wall and adds doors and windows

- [ ] **Door Tool (Hotkey: D)**
  - Select door tool from toolbar
  - Cursor changes to door icon
  - Click on wall → door appears at click point
  - Door aligned perpendicular to wall
  - Door shown as rectangle on wall line

- [ ] **Window Tool (Hotkey: W)**
  - Select window tool from toolbar
  - Click on wall → window appears
  - Window shown as smaller rectangle on wall

- [ ] **Initial Placement**
  - Door/window appears at center of wall by default
  - User can immediately drag it along wall to reposition
  - Snaps to grid while moving
  - Shows distance from wall corner (e.g., "1.2m from corner")

- [ ] **Moving Door/Window**
  - Click door/window → selection handles appear
  - Drag horizontally → moves along wall
  - Stays constrained to wall (can't move off)
  - Shows real-time measurement from corner

---

### 4.2 Door/Window Properties Panel
**User Journey:** User selects door/window and customizes it

- [ ] **Door/Window Selection State**
  - Header: "Door Properties" or "Window Properties"
  - Display selected opening:
    - ID (e.g., "Door-1")
    - Type (Door or Window)
    - Wall it's on (e.g., "Wall-5")
    - Position along wall (percentage or distance)

- [ ] **Door Properties**
  - **Width slider/input**
    - Range: 0.5m to 1.2m
    - Default: 0.9m (standard door)
    - Updates visual in real-time
  
  - **Height slider/input**
    - Range: 1.8m to 2.5m
    - Default: 2.1m
  
  - **Door Type dropdown**
    - Single swing
    - Double swing (French doors)
    - Sliding
    - Pocket door
    - Bifold
    - Selection affects visual preview
  
  - **Swing Direction**
    - Shows 3D preview of door swing
    - Toggle buttons: Inward / Outward
    - Or: Click swing preview to toggle
  
  - **Material dropdown**
    - Wood, Glass, Metal, etc.
    - Shows preview
  
  - **Handle Side dropdown**
    - Left or Right (affects door swing visualization)
  
  - **Door Threshold toggle**
    - Raised threshold (yes/no)
    - For universal access planning

- [ ] **Window Properties**
  - **Width slider/input**
    - Range: 0.6m to 2.5m
    - Default: 1.2m
  
  - **Height slider/input**
    - Range: 0.8m to 2.0m
    - Default: 1.2m
  
  - **Frame Type dropdown**
    - Single-pane
    - Double-pane
    - Triple-pane
    - Affects visual representation
  
  - **Material dropdown**
    - Wood, Aluminum, PVC, etc.
  
  - **Sill Height slider**
    - Range: 0.5m to 1.5m
    - Default: 0.9m (standard window height from floor)
  
  - **Opacity slider** (for rendering)
    - Shows 3D glass tint (0% = solid, 100% = clear)

- [ ] **Delete Button**
  - Removes door/window from wall

---

### 4.3 Door/Window List & Batch Operations
**User Journey:** User wants to modify all doors or windows at once

- [ ] **Opening List (in Properties Panel)**
  - Expandable section: "Doors (4)" / "Windows (3)"
  - Lists all openings in current room
  - Each row: "Door-1 (0.9m × 2.1m)"
  - Click to select, highlights in 2D

- [ ] **Batch Edit Doors**
  - Multi-select doors (Shift+Click in list)
  - Properties panel changes to show common properties only
  - Sliders show "mixed values" if selection has different sizes
  - Adjust: All selected doors update simultaneously

- [ ] **Batch Edit Windows**
  - Same as doors

---

## 5. 3D PREVIEW & VISUALIZATION

### 5.1 Real-Time 3D Preview
**User Journey:** User clicks "View 3D" and sees 3D model updating live

- [ ] **3D Viewer Toggle Button**
  - "View 3D" button in top toolbar
  - Click → modal opens with 3D viewer
  - Or: Split-view option (2D left, 3D right)

- [ ] **3D Canvas**
  - Shows isometric view of floorplan
  - All rooms extruded to ceiling height
  - Walls rendered with thickness
  - Doors/windows show as cutouts
  - Floor colored per room material selection
  - Ceiling visible when looking down

- [ ] **Real-Time Sync**
  - Any change in 2D immediately updates 3D
  - Add wall → 3D updates instantly
  - Change room color → 3D updates instantly
  - Move door → 3D updates instantly
  - No manual "render" button needed (auto-debounced)

- [ ] **3D Performance Indicator**
  - Small badge: "60 FPS" or "45 FPS" (warn if <30)
  - If FPS drops, show notification with optimization options

---

### 5.2 3D Camera Controls
**User Journey:** User wants to explore 3D model from different angles

- [ ] **Orbit Camera (Default)**
  - Rotate: Middle-mouse drag or two-finger rotate
  - Pan: Right-mouse drag or Shift+Middle-mouse
  - Zoom: Mouse wheel or Shift+Mouse drag vertical
  - Double-click → Reset view to default isometric
  - Keyboard shortcuts:
    - Arrow keys: Pan
    - +/- : Zoom
    - R: Reset view

- [ ] **Preset Views**
  - Dropdown menu or icon buttons:
    - Isometric (default)
    - Top-down (aerial)
    - Front view
    - Side view
    - Perspective (walking view)
  - Each preset smoothly animates to new view

- [ ] **Walking View / First Person**
  - Toggle button: "Walk View"
  - Mouse drag: Look around
  - Arrow keys: Move forward/back/left/right
  - WASD: Alternative movement keys
  - Space: Jump
  - Exit with ESC or toggle button

- [ ] **Camera Bookmarks**
  - User can save current camera view as bookmark
  - Button: "Save View" → naming dialog
  - Bookmarks appear in dropdown
  - Click bookmark → smoothly animate to saved view
  - Edit/delete bookmarks

---

### 5.3 3D Rendering Options
**User Journey:** User adjusts lighting, materials, and rendering quality

- [ ] **Lighting Controls**
  - **Brightness slider**
    - Range: 0-200%
    - Default: 100%
    - Updates ambient light intensity
  
  - **Sunlight Direction**
    - Dial showing sun angle
    - Affects directional light
    - Shadows update in real-time
  
  - **Shadow Quality dropdown**
    - Off (fastest)
    - Low
    - Medium
    - High (slowest)

- [ ] **Material Rendering**
  - **Material Quality dropdown**
    - Simple (solid colors only)
    - Standard (colors + basic textures)
    - Detailed (textures + reflections)
  
  - **Texture Visibility toggle**
    - On/Off for floor and wall textures

- [ ] **Rendering Quality**
  - **Resolution dropdown**
    - Performance (1024px)
    - Standard (1440px)
    - High (2560px)
    - Helps mobile/low-end devices

- [ ] **Transparency/Opacity**
  - **Walls Opacity slider**
    - 0% = transparent (see through to interior)
    - 100% = solid
    - Helpful for viewing interior arrangement
  
  - **Ceiling Opacity slider**
    - Same as walls

---

### 5.4 3D Annotations & Measurements
**User Journey:** User wants to measure distances in 3D

- [ ] **3D Measurement Tool**
  - Toggle button: "Measure"
  - Click two points in 3D → distance displayed
  - Measurement remains on screen (can show multiple)
  - Delete measurements (right-click)

- [ ] **Room Volume Display**
  - Hover over room in 3D → shows volume info box
  - "Living Room: 42.5 m² × 2.7m = 114.75 m³"

- [ ] **Room Label Visibility**
  - Toggle: Show room names in 3D
  - Labels appear at room center, floating above floor
  - Can turn on/off via checkbox in settings

---

## 6. MATERIALS & STYLING

### 6.1 Material Library
**User Journey:** User wants to apply realistic materials to rooms

- [ ] **Material Picker (Per Room)**
  - Click room in 2D or 3D
  - "Material" dropdown in properties panel
  - Options:
    - **Flooring:** Wood, Tile, Carpet, Concrete, Laminate, Stone
    - **Wall:** Drywall, Brick, Wood, Paint (custom color), Stone
    - **Ceiling:** Drywall, Wood, Acoustic, Tile, Paint (custom color)

- [ ] **Material Preview**
  - Small thumbnail showing material texture
  - Updates in 3D immediately when selected

- [ ] **Texture Resolution**
  - Materials available in different resolutions (affects visual quality)
  - Auto-selects based on render quality setting

- [ ] **Custom Color Picker**
  - For "Paint" material option
  - Opens color palette or hex input
  - Shows color swatch
  - Updates 3D in real-time

---

### 6.2 Color Schemes
**User Journey:** User wants to coordinate colors across rooms

- [ ] **Color Assignment by Type**
  - Bedrooms → Blue
  - Kitchen → Orange
  - Bathroom → Teal
  - Living Room → Beige
  - Etc.
  - User can override per room

- [ ] **Color Palette Manager**
  - Show: Recently used colors (5-10 swatches)
  - Allow: Save custom palette
  - Allow: Load pre-made palettes (Modern, Vintage, Neutral, etc.)

- [ ] **Color Blindness Mode**
  - Toggle: Color blind friendly palette
  - Adjusts colors for Deuteranopia, Protanopia, Tritanopia

---

### 6.3 Wall Thickness Visualization
**User Journey:** User wants to see wall thickness in 2D and 3D

- [ ] **Wall Thickness in 2D**
  - Toggle: Show wall thickness
  - Walls drawn with visual thickness (not just lines)
  - Thickness represented as light gray outline
  - Helps visualize space

- [ ] **Wall Thickness in 3D**
  - Walls render with actual thickness
  - Can walk through walls in first-person view if thickness is high
  - Affects room usable area calculation

---

## 7. MEASUREMENTS & CALCULATIONS

### 7.1 Area & Volume Calculations
**User Journey:** User wants to know floorplan dimensions

- [ ] **Project Summary Panel**
  - Expandable section showing:
    - **Total area:** Sum of all room areas (m²)
    - **Total volume:** Sum of all room volumes (m³)
    - **Room count:** Number of rooms
    - **Wall count:** Number of walls
    - **Opening count:** Number of doors/windows

- [ ] **Per-Room Display**
  - Each room in list shows:
    - Area (m²)
    - Perimeter (m)
    - Wall length (total)
    - Ceiling height (m)
    - Volume (m³)

- [ ] **Wall Details**
  - Wall list shows length for each wall
  - Useful for ordering building materials

---

### 7.2 Smart Measurements
**User Journey:** User wants quick measurements while drawing

- [ ] **Inline Distance Display**
  - While drawing wall, show length real-time
  - Display updates as cursor moves
  - Final length shown when wall placed

- [ ] **Snap Point Distance**
  - When snapping to existing wall, show distance to snap point

- [ ] **Area Validation**
  - If room area < 1m² → warning: "Room too small"
  - If room area > 500m² → warning: "Room unusually large"

---

## 8. EXPORT & FILE MANAGEMENT

### 8.1 Export Formats
**User Journey:** User wants to save/share their floorplan in different formats

- [ ] **Export Menu**
  - Top toolbar: "Export" dropdown button
  - Options:
    - **JSON** (custom format)
    - **glTF** (3D model)
    - **GLTF+Textures** (glTF with embedded textures)
    - **PDF** (2D floorplan printable)
    - **SVG** (2D vector)
    - **CityJSON** (OGC standard)
    - **IFC** (Building Information Model)
    - **3D Model + Textures** (ZIP archive)

- [ ] **Export Dialog**
  - For each format:
    - Name input (auto-populated as "ProjectName_timestamp")
    - Quality/resolution selector (where applicable)
    - Settings specific to format
    - "Download" button
    - "Copy Link" button (if cloud storage)

- [ ] **Export Status**
  - Progress bar for large exports
  - Toast notification when complete: "Exported as PDF"
  - Toast includes link to download

---

### 8.2 File Management
**User Journey:** User wants to organize and manage their projects

- [ ] **Save (Auto-Save)**
  - Project auto-saves every 30 seconds
  - Visual indicator: small cloud icon (saving/saved/error)
  - If unsaved changes: Red dot on tab title
  - Manual save: Hotkey Ctrl+S (or shows "Already saved")

- [ ] **Save As**
  - "Save As" option in File menu
  - Dialog: New project name
  - Creates new project, original preserved

- [ ] **Revert to Last Saved**
  - Confirmation dialog with timestamp
  - "Are you sure? Changes since 2:45 PM will be lost."

- [ ] **Version History** (Advanced)
  - View past versions (if logged in to cloud)
  - Snapshots every hour
  - Click version → preview it
  - Restore to version with confirmation

---

### 8.3 Import / Open
**User Journey:** User wants to load an existing floorplan

- [ ] **Import Dialog**
  - "File → Open" or "Import" button
  - Drag-drop file zone: "Drop JSON, glTF, or PDF here"
  - Or: Click to browse computer

- [ ] **Supported Import Formats**
  - **JSON** (custom format) → loads with full properties
  - **glTF** (3D model) → converts to 2D floorplan (auto-detection)
  - **PDF** (2D floorplan) → trace-based conversion (experimental)
  - **IFC** (BIM model) → extracts room data

- [ ] **Import Validation**
  - Check file integrity
  - If invalid: Error message with details
  - If valid: Import preview shows layout
  - User confirms: "Import?" button
  - Import progress bar
  - File loads into editor

---

## 9. SHARING & COLLABORATION

### 9.1 Share Links
**User Journey:** User wants to share 3D model with friend/client

- [ ] **Share Button**
  - Top toolbar: "Share" button
  - Opens share dialog

- [ ] **Share Dialog**
  - **Copy Link** button
    - Generates shareable URL (e.g., app.com/share/abc123)
    - Toast confirms: "Link copied to clipboard"
  
  - **Share Permissions dropdown**
    - View only (3D viewer, can't edit)
    - View + comments (can annotate)
    - Edit (full access)
  
  - **Link Expiry**
    - Dropdown: Never, 7 days, 30 days, custom
  
  - **Password Protection** (optional)
    - Checkbox: "Require password"
    - Input field for password

- [ ] **QR Code**
  - Shows QR code for link
  - "Download QR" button for printing

- [ ] **Social Share**
  - Buttons to share on:
    - Twitter (pre-written text with link)
    - Facebook
    - LinkedIn
    - Email (opens email client with pre-filled body)

---

### 9.2 Shared View (Read-Only 3D)
**User Journey:** Friend receives share link and views floorplan

- [ ] **Public 3D Viewer**
  - No UI clutter, just 3D model
  - Camera controls (orbit, zoom)
  - Walking view available
  - Room info on hover (name, area, etc.)
  - "Full Screen" button
  - "Download Image" button (screenshot)

- [ ] **Comment Annotations** (if edit mode enabled)
  - Comment button: Opens text box
  - Click 3D point → comment appears there
  - Shows comment bubble with user name + text
  - Comment list on sidebar
  - Viewer can add own comments

- [ ] **Measurement in Shared View** (if enabled)
  - Measurement tool available to viewers
  - Helps clients estimate dimensions

---

## 10. USER INTERFACE LAYOUT

### 10.1 Main Editor Layout
**Layout Structure**

```
┌─────────────────────────────────────────────────────┐
│  Top Toolbar: File | Edit | View | Export | Help   │
├──────┬──────────────────────────────┬──────────────┤
│      │                              │              │
│ LEFT │        MAIN CANVAS           │   RIGHT      │
│PANEL │      (2D Floorplan)          │   PANEL      │
│      │                              │              │
│ Wall │                              │ Properties   │
│List  │                              │ Panel        │
│ Room │                              │              │
│List  │         Grid + Snap          │ (Wall or     │
│Door/ │         Coordinates          │  Room or     │
│Wind  │                              │  Opening    │
│List  │                              │  selected)   │
│      │                              │              │
│      │     Zoom:  100%              │              │
│      │                              │              │
│      │    Pan/Orbit Controls        │              │
└──────┴──────────────────────────────┴──────────────┘
│  Bottom Status Bar: Project name | Save status | FPS │
└─────────────────────────────────────────────────────┘
```

---

### 10.2 Left Sidebar (Navigation & Lists)
**Sections (Collapsible)**

- [ ] **Project Info**
  - Project name (editable)
  - Collapse/expand button

- [ ] **Walls Section**
  - List of all walls
  - Count: "Walls (12)"
  - Search box
  - Add Wall button (equivalent to toolbar tool)
  - Each wall shows length
  - Click to select in canvas

- [ ] **Rooms Section**
  - List of all rooms
  - Count: "Rooms (5)"
  - Color swatch + name + area
  - Sort/filter options
  - Click to select in canvas
  - Right-click context menu

- [ ] **Doors Section**
  - Expandable: "Doors (4)"
  - Lists all doors
  - Click to select
  - Right-click options

- [ ] **Windows Section**
  - Expandable: "Windows (8)"
  - Lists all windows
  - Click to select

- [ ] **Layers (Advanced)**
  - Eye icon to toggle visibility
  - Walls, Rooms, Doors, Windows as separate layers
  - Lock/unlock layers

---

### 10.3 Right Sidebar (Properties & Settings)
**Sections (Dynamic based on selection)**

- [ ] **No Selection**
  - "Nothing selected"
  - Project summary (area, rooms, walls count)

- [ ] **Wall Selected**
  - Wall properties (thickness, material, color)
  - Delete button

- [ ] **Room Selected**
  - Room properties (name, type, ceiling, material, color)
  - Adjacent rooms list
  - Delete/duplicate buttons

- [ ] **Door/Window Selected**
  - Door/window properties (size, type, swing direction, material)
  - Delete button

- [ ] **Multiple Selected**
  - Shows common properties only
  - Sliders show "mixed" values
  - Batch edit controls

---

### 10.4 Top Toolbar
**Sections Left to Right**

- [ ] **File Menu**
  - New Project
  - Open / Recent Projects
  - Save / Save As
  - Revert to Saved
  - Import
  - Export
  - Project Settings
  - Exit

- [ ] **Edit Menu**
  - Undo / Redo
  - Cut / Copy / Paste
  - Duplicate
  - Delete
  - Select All
  - Deselect All
  - Preferences

- [ ] **View Menu**
  - Zoom In / Zoom Out / Zoom to Fit
  - Toggle Grid
  - Toggle Coordinates
  - Toggle Room IDs
  - 2D / 3D / Split View
  - Full Screen
  - Measurement units

- [ ] **Tools (Icon Buttons)**
  - Draw Wall (W)
  - Select (S)
  - Delete (DEL)
  - Door (D)
  - Window (W)
  - Measure (M)

- [ ] **View Buttons**
  - View 3D (large button)
  - Toggle Real-time Preview
  - Toggle Grid

- [ ] **Help & More**
  - Help / Tutorials
  - Keyboard Shortcuts
  - Settings
  - Account (if logged in)
  - Feedback / Report Bug
  - About

---

### 10.5 Bottom Status Bar
**Right to Left**

- [ ] **FPS Counter**
  - "60 FPS" (green if good, yellow if medium, red if poor)

- [ ] **Scale Indicator**
  - "1m = 50px" or "Scale: 1:100"

- [ ] **Coordinates**
  - "Mouse: (5.2m, 3.8m)"
  - Updates in real-time as cursor moves

- [ ] **Selection Info**
  - Number of selected objects
  - "5 walls selected"

- [ ] **Save Status**
  - Cloud icon: Saving / Saved / Error
  - "Saved 2 minutes ago"

---

## 11. KEYBOARD SHORTCUTS & HOTKEYS

| Action | Hotkey | Action | Hotkey |
|--------|--------|--------|--------|
| **Undo** | Ctrl+Z | **Cut** | Ctrl+X |
| **Redo** | Ctrl+Y | **Copy** | Ctrl+C |
| **Save** | Ctrl+S | **Paste** | Ctrl+V |
| **New Project** | Ctrl+N | **Duplicate** | Ctrl+D |
| **Open** | Ctrl+O | **Delete** | DEL |
| **Export** | Ctrl+Shift+E | **Select All** | Ctrl+A |
| **Draw Wall** | W | **Deselect** | ESC |
| **Select** | S | **Zoom In** | + |
| **Door Tool** | D | **Zoom Out** | - |
| **Window Tool** | W | **Zoom Fit** | 0 |
| **Measure** | M | **Grid Toggle** | G |
| **View 3D** | V | **Full Screen** | F |

---

## 12. MOBILE / RESPONSIVE CONSIDERATIONS

### 12.1 Responsive Layout
**User Journey:** User accesses app on tablet or phone

- [ ] **Tablet (768px - 1024px)**
  - Left sidebar hidden by default
  - Hamburger menu button (≡) to toggle sidebar
  - Right panel visible but narrower
  - Canvas takes most space

- [ ] **Phone (< 768px)**
  - Single-column layout
  - Stacked interface
  - Canvas takes full width
  - Toggle buttons for sidebar / right panel
  - Toolbar buttons adapt: Only show most-used tools
  - Secondary tools hidden in "More" (⋯) menu

- [ ] **Touch Gestures**
  - Two-finger pinch → Zoom canvas
  - Two-finger drag → Pan
  - Long-press → Context menu
  - Swipe left/right → Toggle sidebars

---

### 12.2 Mobile Editing
**User Journey:** User edits floorplan on phone

- [ ] **Simplified Toolbar (Mobile)**
  - Draw Wall
  - Select
  - Delete
  - More (⋯) for additional tools

- [ ] **One-Handed Use**
  - Toolbar at bottom (thumb-friendly)
  - Properties panel slides up from bottom (when needed)
  - Large tap targets (min 44px)

---

## 13. ACCESSIBILITY FEATURES

### 13.1 Keyboard Navigation
- [ ] Tab through all UI elements
- [ ] Enter to activate buttons
- [ ] Space to toggle checkboxes
- [ ] Arrow keys to adjust sliders
- [ ] All features accessible without mouse

### 13.2 Screen Reader Support
- [ ] ARIA labels on all interactive elements
- [ ] Semantic HTML structure
- [ ] Form labels properly associated
- [ ] Error messages announced

### 13.3 Visual Accessibility
- [ ] High contrast mode toggle
- [ ] Large text option (increase font size)
- [ ] Color blind friendly palette
- [ ] Focus indicators visible (blue outline on focus)

---

## 14. HELP & ONBOARDING

### 14.1 Tutorials & Help
**User Journey:** New user doesn't know how to start

- [ ] **Interactive Tutorial**
  - "Quick Start" overlay on first visit
  - Step 1: "Draw your first wall"
    - Highlights canvas
    - Shows W key hint
    - Blocks other UI
    - Advances when wall drawn
  
  - Step 2: "Create a room"
    - Highlights room detection area
    - Explains clicking to create room
  
  - Step 3: "View 3D"
    - Shows 3D button
    - Explains what 3D view is
  
  - Final: "You're ready!" with import/share options

- [ ] **In-App Help**
  - Hover over tool → tooltip with hotkey
  - "?" icon on panels → explanations
  - "Learn more" links to docs

- [ ] **Help Panel**
  - Searchable help articles
  - Common questions (FAQ)
  - Video tutorials (embedded)
  - Link to community forum

- [ ] **Context-Sensitive Help**
  - When user does something unusual, hint appears
  - E.g., "Did you know you can press Ctrl+Z to undo?"
  - Can dismiss permanently per hint

---

### 14.2 Onboarding Templates
**User Journey:** User wants to start with pre-made layout

- [ ] **Template Gallery**
  - Gallery of common floorplans:
    - Studio apartment
    - 1 bedroom apartment
    - 2 bedroom house
    - Office layout
    - Restaurant
    - etc.
  
  - Each template shows:
    - Thumbnail image
    - Room count
    - Total area
    - "Use Template" button

- [ ] **Template Import**
  - Clicking "Use Template" → loads floorplan
  - Walls, rooms, dimensions pre-drawn
  - User can modify as needed
  - Saves time for common layouts

---

## 15. ERROR HANDLING & VALIDATION

### 15.1 Input Validation
- [ ] Wall length must be > 0.1m (too small rejected)
- [ ] Room area must be > 0.5m² (warning if too small)
- [ ] Ceiling height 1.5m - 4.0m (with warnings outside)
- [ ] Door width 0.5m - 1.5m (standard sizes)
- [ ] Window height 0.8m - 2.5m (standard sizes)

### 15.2 Error Messages
- [ ] Non-technical, helpful language
- [ ] Suggest solutions
- [ ] Example: "Room too small. Try extending walls to increase area. Min 0.5m²"

### 15.3 Warning Notifications
- [ ] "Unusual ceiling height (4.5m) - Are you sure?"
- [ ] "Very large room (200m²) - May impact performance"
- [ ] "Unsaved changes - Save before closing?"

---

## Summary: All Features Listed

✅ **Project Management:** Create, open, list, delete, duplicate, rename projects
✅ **2D Drawing:** Wall drawing with grid snap, undo/redo, deletion, properties
✅ **Room Creation:** Auto-detection, manual definition, properties, color coding
✅ **Doors & Windows:** Placement, properties (size, type, swing), visual preview
✅ **3D Visualization:** Real-time preview, camera controls (orbit, walk-through), lighting
✅ **Materials:** Material library, color picker, textures, per-room application
✅ **Measurements:** Area, volume, perimeter, wall length calculations
✅ **Export:** JSON, glTF, PDF, SVG, CityJSON, IFC, ZIP archive
✅ **Import:** Load JSON, glTF, PDF, IFC files
✅ **Sharing:** Shareable links, QR codes, social media, comment annotations
✅ **UI/UX:** Responsive layout, keyboard shortcuts, accessibility, touch gestures
✅ **Help:** Interactive tutorials, in-app help, templates, FAQ
✅ **Performance:** Real-time rendering, FPS monitoring, optimization options
✅ **Data Persistence:** Auto-save, save/restore, version history (cloud)
