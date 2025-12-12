# Section 08: Materials & Styling

> **Priority**: Low-Medium - Visual enhancement feature.
>
> **Phase**: Phase 4 (after core features complete)
>
> **Dependencies**:
> - Section 01 (data model)
> - Section 05 (3D viewer for material rendering)
>
> **Parallel Work**: Can begin once 3D viewer is rendering basic rooms.

---

## Overview

This section adds visual richness through material selection, textures, and color customization. Users can assign floor materials (wood, tile, carpet), wall finishes, and custom colors. Materials affect both 2D color representation and 3D texture rendering.

---

## Task 8.1: Material Type Definitions

**File**: `src/types/materials.ts`

### Subtasks

- [x] **8.1.1** Define floor material types:
  ```typescript
  type FloorMaterial =
    | 'hardwood' | 'laminate' | 'tile-ceramic' | 'tile-porcelain'
    | 'carpet' | 'concrete' | 'stone-marble' | 'stone-slate'
    | 'vinyl' | 'bamboo'

  interface FloorMaterialConfig {
    id: FloorMaterial
    name: string
    category: 'wood' | 'tile' | 'carpet' | 'stone' | 'other'
    defaultColor: string
    textureUrl?: string
    roughness: number
    reflectivity: number
  }
  ```

- [x] **8.1.2** Define wall material types:
  ```typescript
  type WallMaterial =
    | 'drywall-white' | 'drywall-painted' | 'brick-red' | 'brick-white'
    | 'concrete' | 'wood-panel' | 'wallpaper' | 'stone'

  interface WallMaterialConfig {
    id: WallMaterial
    name: string
    defaultColor: string
    textureUrl?: string
    roughness: number
  }
  ```

- [x] **8.1.3** Define ceiling material types:
  ```typescript
  type CeilingMaterial =
    | 'drywall' | 'acoustic-tile' | 'wood-beam' | 'exposed-concrete'

  interface CeilingMaterialConfig {
    id: CeilingMaterial
    name: string
    defaultColor: string
    textureUrl?: string
    roughness: number
  }
  ```

- [x] **8.1.4** Create material registry:
  ```typescript
  const FLOOR_MATERIALS: Record<FloorMaterial, FloorMaterialConfig>
  const WALL_MATERIALS: Record<WallMaterial, WallMaterialConfig>
  const CEILING_MATERIALS: Record<CeilingMaterial, CeilingMaterialConfig>
  ```

### Unit Tests

- [x] All material types have valid configs
- [x] Default colors are valid hex strings
- [x] Roughness values in 0-1 range

---

## Task 8.2: Room Material Properties

**File**: Update `src/types/room.ts`, `src/stores/floorplanStore.ts`

### Subtasks

- [x] **8.2.1** Extend Room interface:
  ```typescript
  interface Room {
    // ... existing properties
    floorMaterial?: FloorMaterial
    wallMaterial?: WallMaterial
    ceilingMaterial?: CeilingMaterial
    customFloorColor?: string
    customWallColor?: string
    customCeilingColor?: string
  }
  ```

- [x] **8.2.2** Add material defaults based on room type:
  ```typescript
  const ROOM_TYPE_MATERIALS = {
    bedroom: { floor: 'hardwood', wall: 'drywall-painted' },
    kitchen: { floor: 'tile-ceramic', wall: 'drywall-painted' },
    bathroom: { floor: 'tile-porcelain', wall: 'tile-ceramic' },
    living: { floor: 'hardwood', wall: 'drywall-painted' },
    garage: { floor: 'concrete', wall: 'drywall-white' },
    // ...
  }
  ```

- [x] **8.2.3** Add store actions:
  ```typescript
  setRoomFloorMaterial(roomId: string, material: FloorMaterial): void
  setRoomWallMaterial(roomId: string, material: WallMaterial): void
  setRoomCeilingMaterial(roomId: string, material: CeilingMaterial): void
  setRoomCustomColor(roomId: string, surface: 'floor' | 'wall' | 'ceiling', color: string): void
  ```

### Unit Tests

- [x] Material assignment updates room
- [x] Custom color overrides material default
- [x] Room type defaults applied on creation

---

## Task 8.3: Material Picker Component

**File**: `src/components/properties/MaterialPicker.tsx`

### Subtasks

- [x] **8.3.1** Create material picker UI:
  ```typescript
  interface MaterialPickerProps {
    type: 'floor' | 'wall' | 'ceiling'
    value: string
    onChange: (material: string) => void
    customColor?: string
    onCustomColorChange: (color: string) => void
  }
  ```

- [x] **8.3.2** Display material options:
  - Grid of material swatches
  - Material name below swatch
  - Grouped by category (Wood, Tile, etc.)
  - Selected material highlighted

- [x] **8.3.3** Material preview swatch:
  - Show texture thumbnail if available
  - Show solid color if no texture

- [x] **8.3.4** Custom color option:
  - "Custom Color" as last option
  - Opens color picker on select
  - Shows color swatch

- [x] **8.3.5** Color picker integration:
  - Use Shadcn/ui color picker or react-colorful
  - Hex input for precise colors
  - Recent colors palette

### Unit Tests

- [x] Material picker displays all options
- [x] Selection triggers onChange
- [x] Custom color shows color picker

---

## Task 8.4: Material Properties Panel Integration

**File**: Update `src/components/properties/RoomPropertiesPanel.tsx`

### Subtasks

- [x] **8.4.1** Add material section to room properties:
  - Collapsible section: "Materials"
  - Floor material picker
  - Wall material picker
  - Ceiling material picker

- [x] **8.4.2** Show material preview:
  - Small 3D preview cube showing materials
  - Or: flat preview swatches

- [x] **8.4.3** "Reset to Default" button:
  - Resets materials to room type defaults

- [ ] **8.4.4** Apply material to all rooms:
  - Optional: "Apply to all rooms of this type"
  - Confirmation dialog

### Unit Tests

- [x] Material section renders in properties panel
- [x] Changing material updates store
- [x] Reset restores defaults

---

## Task 8.5: 2D Material Representation

**File**: Update `src/components/editor/RoomShape.tsx`

### Subtasks

- [x] **8.5.1** Apply floor color based on material:
  - Use material's defaultColor
  - Or custom color if set

- [ ] **8.5.2** Optional: Floor pattern overlay:
  - SVG pattern for wood grain direction
  - Grid pattern for tiles
  - Subtle, doesn't obscure room info

- [ ] **8.5.3** Wall color indicator:
  - Border color can reflect wall material
  - Or: small color indicator in room label

### Unit Tests

- [x] Room fill color matches floor material
- [x] Custom color overrides material color

---

## Task 8.6: 3D Material Rendering

**File**: Update `src/services/geometry3d/materials.ts`, `src/components/viewer/RoomMesh.tsx`

### Subtasks

- [ ] **8.6.1** Create Three.js materials from configs:
  ```typescript
  function createFloorMaterial(config: FloorMaterialConfig): THREE.Material
  function createWallMaterial(config: WallMaterialConfig): THREE.Material
  ```

- [ ] **8.6.2** Implement material caching:
  - Cache created materials by config
  - Reuse for multiple rooms with same material

- [ ] **8.6.3** Load textures for materials:
  - TextureLoader for material textures
  - Apply to material map property
  - Handle loading states

- [ ] **8.6.4** Configure texture properties:
  - Repeat based on room size (e.g., 1 tile per meter)
  - wrapS, wrapT = RepeatWrapping

- [ ] **8.6.5** Apply materials to room meshes:
  - Floor mesh gets floor material
  - Wall meshes get wall material
  - Ceiling mesh gets ceiling material

- [ ] **8.6.6** Handle custom colors:
  - If custom color set, use color instead of texture
  - Create new material with custom color

### Unit Tests

- [ ] Material created with correct color
- [ ] Texture loading triggers
- [ ] Cache returns same material for same config
- [ ] Custom color overrides texture

---

## Task 8.7: Texture Assets

**File**: `public/textures/`, asset pipeline

### Subtasks

- [ ] **8.7.1** Source texture images:
  - Seamless tileable textures
  - Common materials: wood, tile, carpet, concrete
  - Recommended size: 512×512 or 1024×1024

- [ ] **8.7.2** Organize texture files:
  ```
  public/textures/
  ├── floors/
  │   ├── hardwood-oak.jpg
  │   ├── tile-ceramic-white.jpg
  │   ├── carpet-beige.jpg
  │   └── ...
  ├── walls/
  │   ├── brick-red.jpg
  │   ├── concrete.jpg
  │   └── ...
  └── ceilings/
      └── ...
  ```

- [ ] **8.7.3** Create texture manifest:
  ```typescript
  const TEXTURE_PATHS: Record<string, string> = {
    'hardwood': '/textures/floors/hardwood-oak.jpg',
    'tile-ceramic': '/textures/floors/tile-ceramic-white.jpg',
    // ...
  }
  ```

- [ ] **8.7.4** Optimize textures:
  - Compress for web (JPEG for photos, PNG for patterns)
  - Consider WebP format
  - Multiple resolutions for LOD (optional)

- [ ] **8.7.5** Implement lazy loading:
  - Load textures only when material is used
  - Show placeholder color while loading

### Unit Tests

- [ ] Texture paths resolve correctly
- [ ] Loading fallback to default color

---

## Task 8.8: Color Schemes and Presets

**File**: `src/services/colorSchemes.ts`, `src/components/dialogs/ColorSchemeDialog.tsx`

### Subtasks

- [ ] **8.8.1** Define color scheme presets:
  ```typescript
  interface ColorScheme {
    id: string
    name: string
    roomTypeColors: Record<RoomType, string>
    defaultFloorMaterial: FloorMaterial
    defaultWallMaterial: WallMaterial
  }

  const COLOR_SCHEMES: ColorScheme[] = [
    { id: 'modern', name: 'Modern', ... },
    { id: 'classic', name: 'Classic', ... },
    { id: 'warm', name: 'Warm', ... },
    { id: 'cool', name: 'Cool', ... },
    { id: 'neutral', name: 'Neutral', ... },
  ]
  ```

- [ ] **8.8.2** Create color scheme selector:
  - Dropdown or grid of preset options
  - Preview thumbnails
  - Apply to entire floorplan

- [ ] **8.8.3** Color-blind friendly schemes:
  - Preset optimized for color blindness
  - Deuteranopia, Protanopia, Tritanopia variants
  - Toggle in accessibility settings

- [ ] **8.8.4** Apply scheme action:
  ```typescript
  applyColorScheme(schemeId: string): void
  ```
  - Updates all room colors to scheme
  - Confirmation dialog

### Unit Tests

- [ ] Color schemes load correctly
- [ ] Applying scheme updates all rooms
- [ ] Color-blind schemes have valid colors

---

## Task 8.9: Material Quality Settings

**File**: `src/stores/uiStore.ts` (additions), `src/components/viewer/ViewerControls.tsx`

### Subtasks

- [ ] **8.9.1** Add material quality setting:
  ```typescript
  materialQuality: 'simple' | 'standard' | 'detailed'
  ```

- [ ] **8.9.2** Define quality levels:
  - **Simple**: Solid colors only, no textures, MeshBasicMaterial
  - **Standard**: Textures enabled, MeshStandardMaterial
  - **Detailed**: High-res textures, MeshPhysicalMaterial, reflections

- [ ] **8.9.3** Create quality selector in viewer:
  - Dropdown in viewer settings
  - Immediate effect on rendering

- [ ] **8.9.4** Auto-quality based on performance:
  - If FPS drops below 30, suggest reducing quality
  - Optional: auto-reduce quality

### Unit Tests

- [ ] Quality setting persists
- [ ] Material type changes with quality

---

## Integration Tests

**File**: `tests/integration/materials.integration.test.tsx`

### Test Cases

- [ ] **Material assignment**: Assign floor material → verify 3D updates
- [ ] **Custom color**: Set custom floor color → verify renders correctly
- [ ] **Color scheme**: Apply scheme → verify all rooms updated
- [ ] **Quality switch**: Change quality → verify material types change
- [ ] **Persistence**: Set materials → save → reload → verify restored

---

## Acceptance Criteria

- [ ] Floor, wall, ceiling materials can be assigned per room
- [ ] Custom colors can override material defaults
- [ ] Materials render correctly in 3D with textures
- [ ] 2D view reflects floor material color
- [ ] Color schemes can be applied globally
- [ ] Color-blind friendly options available
- [ ] Material quality affects performance appropriately
- [ ] Unit test coverage > 80%

---

## Files Created

```
src/
├── types/
│   └── materials.ts
├── services/
│   ├── colorSchemes.ts
│   └── geometry3d/
│       └── materials.ts (updated)
├── components/
│   ├── properties/
│   │   └── MaterialPicker.tsx
│   └── dialogs/
│       └── ColorSchemeDialog.tsx
├── constants/
│   └── materialConfigs.ts
└── public/
    └── textures/
        ├── floors/
        ├── walls/
        └── ceilings/

tests/
├── unit/
│   └── services/
│       └── colorSchemes.test.ts
└── integration/
    └── materials.integration.test.tsx
```
