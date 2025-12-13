# Section 05: 3D Viewer & Rendering

> **Priority**: High - Core visual feedback for the floorplan.
>
> **Phase**: MVP (Phase 1)
>
> **Dependencies**:
> - Section 01 (data model, geometry utils)
> - Section 02 (UI shell for viewer modal/panel)
>
> **Parallel Work**: Can run in parallel with Sections 03, 04. No dependencies on table or canvas editor.

---

## Overview

The 3D Viewer renders the floorplan as an interactive 3D model using Three.js. Users can orbit, pan, zoom, and explore their design. The viewer updates in real-time as room dimensions change. This section handles geometry generation, materials, lighting, camera controls, and export.

---

## Task 5.1: Three.js Setup and Integration

**File**: `src/components/viewer/Viewer3D.tsx`, `src/hooks/useThreeScene.ts`

### Subtasks

- [x] **5.1.1** Install Three.js dependencies:
  ```bash
  npm install three @types/three
  npm install @react-three/fiber @react-three/drei
  ```

- [x] **5.1.2** Create `Viewer3D` container component:
  - Full viewport size
  - WebGL canvas
  - Loading state indicator
  - Error boundary for WebGL failures

- [x] **5.1.3** Create `useThreeScene` hook:
  ```typescript
  interface UseThreeSceneReturn {
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    renderer: THREE.WebGLRenderer
    controls: OrbitControls
  }
  ```

- [x] **5.1.4** Initialize Three.js scene:
  - Scene with background color (light gray or sky gradient)
  - Perspective camera with sensible defaults
  - WebGL renderer with antialiasing
  - Handle canvas resize on window resize

- [x] **5.1.5** Set up render loop:
  - requestAnimationFrame loop
  - Render only when needed (dirty flag or continuous)
  - FPS counter for debugging

- [x] **5.1.6** Handle WebGL context loss:
  - Show error message if WebGL unavailable
  - Attempt recovery on context restore

### Unit Tests (`tests/unit/components/viewer/Viewer3D.test.tsx`)

- [x] Scene initializes without error
- [x] Canvas renders to DOM
- [x] Resize handler updates dimensions
- [x] WebGL error handled gracefully

---

## Task 5.2: Camera and Controls

**File**: `src/components/viewer/CameraControls.tsx`, `src/hooks/useCameraControls.ts`

### Subtasks

- [x] **5.2.1** Set up OrbitControls:
  - Import from `three/examples/jsm/controls/OrbitControls`
  - Or use `@react-three/drei` OrbitControls

- [x] **5.2.2** Configure orbit behavior:
  - Target: center of floorplan
  - Enable rotate (left mouse drag)
  - Enable pan (right mouse drag or Shift+left drag)
  - Enable zoom (scroll wheel)
  - Damping for smooth movement

- [x] **5.2.3** Set zoom limits:
  - Min distance: 2m (don't clip through floor)
  - Max distance: 100m (don't lose the model)

- [x] **5.2.4** Set vertical rotation limits:
  - Min polar angle: 0.1 (nearly top-down allowed)
  - Max polar angle: Math.PI/2 - 0.1 (don't go below floor)

- [x] **5.2.5** Implement preset camera views:
  - **Isometric**: 45° angle, looking at center
  - **Top-down**: directly above, looking down
  - **Front**: looking from south to north
  - **Side**: looking from west to east
  - Smooth animation between presets (2 second duration)

- [x] **5.2.6** Create camera view buttons:
  - Button group in viewer toolbar
  - Icons for each preset
  - Current view highlighted

- [x] **5.2.7** Implement "Fit to View":
  - Calculate bounding box of all rooms
  - Position camera to see entire model
  - Add padding around edges

- [x] **5.2.8** Keyboard camera controls:
  - Arrow keys: rotate view
  - +/-: zoom
  - R: reset to default view
  - 1-4: preset views

### Unit Tests

- [x] OrbitControls initialize correctly
- [x] Zoom limits are enforced
- [x] Preset views set correct camera position
- [x] Fit to view encompasses all rooms

---

## Task 5.3: Ground Plane and Environment

**File**: `src/components/viewer/Environment.tsx`

### Subtasks

- [x] **5.3.1** Create ground plane:
  - Large PlaneGeometry (200m × 200m)
  - Subtle grid texture or color
  - Position at Y=0
  - Receives shadows

- [x] **5.3.2** Create optional grid helper:
  - Three.js GridHelper
  - 1m grid lines
  - Toggle visibility

- [x] **5.3.3** Add axis helper (optional, for debugging):
  - X = red, Y = green, Z = blue
  - Toggle visibility
  - Position at origin

- [x] **5.3.4** Create sky/background:
  - Option 1: Solid color background
  - Option 2: Gradient from sky blue to white
  - Option 3: Simple environment map

- [x] **5.3.5** Implement ground shadow:
  - Contact shadows under rooms
  - Soft edges

### Unit Tests

- [x] Ground plane renders at correct position
- [x] Grid helper toggles correctly
- [x] Background color applied

---

## Task 5.4: Room Geometry Generation

**File**: `src/services/geometry3d/roomGeometry.ts`

### Subtasks

- [x] **5.4.1** Create `generateRoomGeometry(room: Room): THREE.BufferGeometry`
  - Generate box geometry from room dimensions
  - Position based on room.position (X, Z) and Y=0
  - Account for room rotation

- [x] **5.4.2** Generate room mesh structure:
  - Floor: PlaneGeometry at Y=0
  - Ceiling: PlaneGeometry at Y=height
  - 4 Walls: PlaneGeometry for each side
  - Orient normals outward

- [x] **5.4.3** Handle wall openings (for doors/windows):
  - Create walls with holes using Shape and ExtrudeGeometry
  - Or use CSG (Constructive Solid Geometry) library
  - Position holes based on door/window data

- [x] **5.4.4** Optimize geometry:
  - Merge static geometries where possible
  - Use BufferGeometry for performance
  - Set appropriate bounding spheres
  - *Note*: Merged walls into single mesh. Individual wall selection via `userData.side` is no longer supported, but room-level selection works.

- [x] **5.4.5** Create `generateFloorplanGeometry(floorplan: Floorplan): THREE.Group`
  - Generate all room geometries
  - Position each room correctly
  - Return as Group for easy manipulation

### Unit Tests

- [x] Room geometry has correct dimensions
- [x] Room positioned at correct coordinates
- [x] Wall count is 4 for simple room
- [x] Rotation applied correctly
- [x] Door opening creates hole in wall

---

## Task 5.5: Materials and Colors

**File**: `src/services/geometry3d/materials.ts`

### Subtasks

- [x] **5.5.1** Create material factory:
  ```typescript
  function createRoomMaterial(room: Room): {
    floor: THREE.Material
    walls: THREE.Material
    ceiling: THREE.Material
  }
  ```

- [x] **5.5.2** Implement floor materials:
  - Use room color as base
  - MeshStandardMaterial for lighting interaction
  - Slight roughness for realistic look

- [x] **5.5.3** Implement wall materials:
  - Lighter shade of room color
  - Or white/cream for neutral walls
  - Double-sided rendering for interior views

- [x] **5.5.4** Implement ceiling materials:
  - White or very light color
  - Flat shading

- [x] **5.5.5** Create material quality levels:
  - **Simple**: MeshBasicMaterial (no lighting, fastest)
  - **Standard**: MeshStandardMaterial (balanced)
  - **Detailed**: MeshPhysicalMaterial with textures (future)

- [x] **5.5.6** Handle transparency:
  - Optional: Make walls semi-transparent
  - Slider to control wall opacity (0-100%)
  - Helps see interior layout

### Unit Tests

- [x] Material created with correct color
- [x] Quality levels produce different material types
- [x] Transparency affects opacity value

---

## Task 5.6: Lighting System

**File**: `src/components/viewer/Lighting.tsx`

### Subtasks

- [x] **5.6.1** Set up ambient light:
  - AmbientLight with soft intensity
  - Provides base illumination everywhere
  - Color: white or slight warm tint

- [x] **5.6.2** Set up directional light (sun):
  - DirectionalLight from above-front angle
  - Casts shadows
  - Position based on "sun direction" setting

- [x] **5.6.3** Configure shadow mapping:
  - Enable shadows on renderer
  - Shadow map size: 2048×2048 (adjustable)
  - Shadow camera covers entire floorplan

- [x] **5.6.4** Create brightness control:
  - Slider 0-200% (default 100%)
  - Adjusts ambient light intensity
  - Updates in real-time

- [x] **5.6.5** Create sun direction control:
  - Circular dial showing compass direction
  - Draggable to change light angle
  - Or: Time-of-day slider

- [x] **5.6.6** Implement shadow quality settings:
  - Off: No shadows (fastest)
  - Low: 512px shadow map
  - Medium: 1024px shadow map
  - High: 2048px shadow map

### Unit Tests

- [x] Ambient light added to scene
- [x] Directional light casts shadows
- [x] Brightness slider changes intensity
- [x] Shadow quality changes map size

---

## Task 5.7: Room Mesh Component

**File**: `src/components/viewer/RoomMesh.tsx`

### Subtasks

- [x] **5.7.1** Create `RoomMesh` React component:
  ```typescript
  interface RoomMeshProps {
    room: Room
    isSelected: boolean
    showLabels: boolean
    wallOpacity: number
  }
  ```

- [x] **5.7.2** Generate and render room geometry:
  - Use geometry from Task 5.4
  - Apply materials from Task 5.5

- [x] **5.7.3** Implement selection highlight:
  - Selected room has glowing outline
  - Or: brighter material / different color

- [x] **5.7.4** Handle hover state:
  - Raycasting to detect hover
  - Show room info on hover (tooltip or overlay)

- [x] **5.7.5** Implement room labels in 3D:
  - Text sprite above room
  - Shows room name
  - Optional: show area
  - Billboard (always faces camera)

- [x] **5.7.6** Click to select:
  - Raycast on click to find room
  - Update selection in store

### Unit Tests

- [x] RoomMesh renders correct geometry
- [x] Selection highlight applied
- [x] Click triggers selection callback
- [x] Labels render when enabled

---

## Task 5.8: Scene Manager

**File**: `src/components/viewer/SceneManager.tsx`, `src/hooks/useSceneSync.ts`

### Subtasks

- [x] **5.8.1** Create `useSceneSync` hook:
  - Subscribes to floorplan store changes
  - Updates 3D scene when rooms change
  - Debounced updates (100ms) for performance

- [x] **5.8.2** Handle room additions:
  - Create new RoomMesh for added room
  - Add to scene

- [x] **5.8.3** Handle room updates:
  - Update geometry when dimensions change
  - Update material when color/type changes
  - Update position when moved

- [x] **5.8.4** Handle room deletions:
  - Remove RoomMesh from scene
  - Dispose geometry and materials (prevent memory leak)

- [x] **5.8.5** Implement batched updates:
  - Collect multiple changes
  - Apply in single render frame
  - Prevents flickering
  - *Note*: Implemented via `React.memo` on `RoomMesh` and existing debounce.

- [x] **5.8.6** Create "Regenerate Scene" function:
  - Clears and rebuilds entire scene
  - Use when data structure changes significantly

### Unit Tests

- [x] Room addition creates new mesh
- [x] Room update modifies existing mesh
- [x] Room deletion removes mesh and disposes resources
- [x] Debounce prevents rapid re-renders

---

## Task 5.9: Viewer Controls UI

**File**: `src/components/viewer/ViewerControls.tsx`

### Subtasks

- [x] **5.9.1** Create viewer toolbar:
  - Position: top of viewer panel
  - Contains camera presets, controls, settings

- [x] **5.9.2** Camera preset buttons:
  - Isometric, Top-down, Front, Side
  - Icon buttons with tooltips

- [x] **5.9.3** Zoom controls:
  - Zoom in (+) / Zoom out (-) buttons
  - Zoom to fit button

- [x] **5.9.4** Settings dropdown:
  - Brightness slider
  - Shadow quality selector
  - Wall opacity slider
  - Show grid toggle
  - Show labels toggle

- [x] **5.9.5** Download button:
  - Export as glTF
  - Export as screenshot (PNG)

- [x] **5.9.6** Fullscreen toggle:
  - Button to enter/exit fullscreen
  - Use Fullscreen API

- [x] **5.9.7** Help overlay:
  - "?" button shows controls help
  - Lists mouse/keyboard controls

### Unit Tests

- [x] Preset buttons trigger camera changes
- [x] Brightness slider updates lighting
- [x] Download buttons work
- [x] Fullscreen toggles correctly

---

## Task 5.10: First-Person Walking View (Advanced)

**File**: `src/components/viewer/FirstPersonControls.tsx`, `src/hooks/useFirstPerson.ts`

### Subtasks

- [x] **5.10.1** Create first-person camera mode:
  - Camera at eye height (1.6m)
  - Position inside a room

- [x] **5.10.2** Implement mouse look:
  - Lock pointer on activation
  - Mouse X → rotate camera horizontally
  - Mouse Y → rotate camera vertically (limited)

- [x] **5.10.3** Implement WASD movement:
  - W: forward
  - S: backward
  - A: strafe left
  - D: strafe right
  - Smooth acceleration/deceleration

- [x] **5.10.4** Implement collision detection:
  - Prevent walking through walls
  - Raycast in movement direction
  - Stop at wall surface

- [x] **5.10.5** Create mode toggle:
  - Button to enter first-person mode
  - Escape to exit
  - Smooth transition animation

- [x] **5.10.6** Add movement speed control:
  - Normal speed: 2m/s
  - Shift to run: 4m/s

### Unit Tests

- [x] First-person mode activates
- [x] WASD moves camera
- [x] Escape exits first-person mode
- [x] Collision prevents wall clipping

---

## Task 5.11: Performance Optimization

**File**: `src/services/geometry3d/optimization.ts`

### Subtasks

- [x] **5.11.1** Implement level of detail (LOD):
  - Simplified geometry at distance
  - Full detail when close

- [x] **5.11.2** Implement frustum culling:
  - Three.js handles automatically
  - Bounding spheres are computed in geometry generation

- [ ] **5.11.3** Geometry instancing for repeated elements:
  - Use InstancedMesh for doors/windows if many
  - *Skipped*: Not many repeated elements yet in MVP.

- [x] **5.11.4** Implement render-on-demand:
  - Only render when camera moves or scene changes
  - Use dirty flag pattern

- [x] **5.11.5** Create performance monitor:
  - FPS counter
  - Draw call count
  - Triangle count
  - Memory usage

- [x] **5.11.6** Implement quality presets:
  - Low: no shadows, basic materials (no LOD, always low)
  - Medium: soft shadows, standard materials (LOD enabled)
  - High: full shadows, detailed materials

- [x] **5.11.7** Add performance warning:
  - If FPS drops below 30 for 3 consecutive seconds, show notification
  - Suggest reducing quality

### Unit Tests

- [x] LOD switches at correct distances
- [x] Render-on-demand prevents unnecessary renders
- [x] Quality presets apply correct settings

---

## Integration Tests

**File**: `tests/integration/3d-viewer.integration.test.tsx`

### Test Cases (using jsdom + @napi-rs/canvas + headless-gl if needed)

Note: Full WebGL testing may require special setup or mocking. Focus on:

- [x] **Scene initialization**: Create floorplan → viewer initializes without error
- [x] **Room rendering**: Add room to store → verify mesh created in scene
- [x] **Update sync**: Change room dimensions → verify geometry updates
- [x] **Camera presets**: Click preset button → verify camera position changes
- [x] **Selection sync**: Select room in store → verify selection highlight in viewer
- [x] **Memory cleanup**: Delete room → verify geometry disposed

---

## Acceptance Criteria

- [x] 3D viewer renders rooms correctly
- [x] Camera controls (orbit, pan, zoom) work smoothly
- [x] Preset camera views work
- [x] Rooms update in real-time when dimensions change
- [x] Lighting and shadows render correctly
- [x] Room selection syncs with 2D/table views
- [x] Performance maintains 60 FPS for typical floorplans (<20 rooms)
- [x] First-person mode allows interior exploration
- [x] Unit test coverage > 80%

---

## Files Created

```
src/
├── components/
│   └── viewer/
│       ├── Viewer3D.tsx
│       ├── CameraControls.tsx
│       ├── Environment.tsx
│       ├── Lighting.tsx
│       ├── RoomMesh.tsx
│       ├── SceneManager.tsx
│       ├── ViewerControls.tsx
│       └── FirstPersonControls.tsx
├── hooks/
│   ├── useThreeScene.ts
│   ├── useCameraControls.ts
│   ├── useSceneSync.ts
│   └── useFirstPerson.ts
└── services/
    └── geometry3d/
        ├── roomGeometry.ts
        ├── materials.ts
        └── optimization.ts

tests/
├── unit/
│   └── components/
│       └── viewer/
│           ├── Viewer3D.test.tsx
│           └── RoomMesh.test.tsx
│   └── services/
│       └── geometry3d/
│           └── roomGeometry.test.ts
└── integration/
    └── 3d-viewer.integration.test.tsx
```
