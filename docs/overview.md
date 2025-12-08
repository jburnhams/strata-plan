# StrataPlan Technical Overview

## What is StrataPlan?

StrataPlan is a browser-based, offline-first floorplan application that enables homeowners to create professional 3D floorplans by entering room measurements. The core promise: **"Have a tape measure? Get a 3D floorplan in under 5 minutes."**

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                     STRATAPLAN (Client-Side Only)                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────────────┐ │
│  │ Room Input     │  │ 2D Canvas      │  │ 3D Viewer              │ │
│  │ Table          │  │ Editor         │  │ (Three.js)             │ │
│  │ (Quick Start)  │  │ (SVG/Canvas)   │  │                        │ │
│  └───────┬────────┘  └───────┬────────┘  └───────────┬────────────┘ │
│          │                   │                       │              │
│          └───────────────────┼───────────────────────┘              │
│                              │                                      │
│                    ┌─────────▼─────────┐                            │
│                    │   Zustand Store   │                            │
│                    │   (Global State)  │                            │
│                    └─────────┬─────────┘                            │
│                              │                                      │
│          ┌───────────────────┼───────────────────┐                  │
│          │                   │                   │                  │
│   ┌──────▼──────┐    ┌───────▼───────┐   ┌──────▼──────┐           │
│   │ IndexedDB   │    │ Export Engine │   │ Import      │           │
│   │ (Projects)  │    │ (JSON/glTF/   │   │ Parser      │           │
│   │             │    │  PDF)         │   │             │           │
│   └─────────────┘    └───────────────┘   └─────────────┘           │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    Cloudflare Pages (Static Deploy)
```

## Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Framework | React 19 + TypeScript | Component-based UI with type safety |
| Build | Vite | Fast dev server and optimized production builds |
| State | Zustand | Lightweight, performant global state management |
| UI Components | Shadcn/ui + Tailwind CSS | Accessible, customizable component library |
| 2D Rendering | SVG + Canvas API | Floorplan visualization and editing |
| 3D Rendering | Three.js | WebGL-based 3D floorplan viewer |
| Storage | IndexedDB (via idb) | Client-side project persistence |
| PDF Export | jsPDF | Generate printable 2D floorplan reports |
| 3D Export | Three.js GLTFExporter | Export models for external 3D viewers |
| Deployment | Cloudflare Pages | Static site hosting with global CDN |

## Testing Stack

| Type | Tools | Purpose |
|------|-------|---------|
| Unit Tests | Jest + React Testing Library | Fast isolated tests with mocks |
| Integration Tests | Jest + jsdom + @napi-rs/canvas | Deep browser-like testing with real canvas rendering |
| Coverage | Jest Coverage | Unit tests only, thresholds enforced |

## Core Data Model

```typescript
// Simplified view - full types in src/types/
interface Floorplan {
  id: string;
  name: string;
  units: 'meters' | 'feet';
  rooms: Room[];
  connections: RoomConnection[];
  createdAt: Date;
  updatedAt: Date;
}

interface Room {
  id: string;
  name: string;
  length: number;
  width: number;
  height: number;
  type: RoomType;
  position: { x: number; z: number };
  color?: string;
  material?: Material;
  doors: Door[];
  windows: Window[];
}

interface RoomConnection {
  id: string;
  room1Id: string;
  room2Id: string;
  sharedWall: WallSide;
  doors: Door[];
}
```

## Key Design Principles

1. **Numbers-First MVP**: Users reach their first 3D floorplan via table input only. No drawing required.

2. **Progressive Complexity**: Features unlock as needed - table input first, then canvas drawing, then doors/windows, then materials.

3. **100% Client-Side**: All logic runs in browser. Data never leaves user's device. No backend, no sync overhead.

4. **Spatial Modeling**: Rooms form a connected graph. System auto-detects adjacencies and shared walls.

5. **Offline-First**: Works without network after initial load. Auto-saves to IndexedDB.

## Input Methods

### Quick Start (Table-Based)
- User enters room dimensions in a table: name, length, width, height, type
- System auto-positions rooms left-to-right with gaps
- Ideal for users who "just want a floorplan from measurements"

### Advanced (Canvas Drawing)
- SVG/Canvas-based 2D editor with wall drawing tools
- Snap-to-grid, wall-to-wall snapping
- Manual room positioning and connections
- For users wanting precise control

## Project Structure

```
src/
├── components/           # React components
│   ├── ui/              # Shadcn/ui primitives
│   ├── editor/          # 2D canvas editor components
│   ├── viewer/          # 3D viewer components
│   ├── table/           # Room input table components
│   └── layout/          # App shell, navigation
├── hooks/               # Custom React hooks
├── stores/              # Zustand stores
├── services/            # Business logic
│   ├── geometry/        # 2D/3D geometry calculations
│   ├── adjacency/       # Room connection detection
│   ├── export/          # JSON, glTF, PDF exporters
│   ├── import/          # File import parsers
│   └── storage/         # IndexedDB operations
├── types/               # TypeScript interfaces
├── utils/               # Helper functions
└── constants/           # App-wide constants

tests/
├── unit/                # Fast tests with mocks
├── integration/         # Deep tests with jsdom + canvas
└── utils/               # Test helpers and setup
```

## Development Phases

| Phase | Focus | Key Features |
|-------|-------|--------------|
| **1 (MVP)** | Core Experience | Table input, 2D view, 3D preview, save/export |
| **2** | Advanced Editing | Canvas drawing mode, manual room positioning |
| **3** | Building Elements | Doors, windows, openings with 3D visualization |
| **4** | Visual Polish | Materials, textures, lighting controls |
| **5** | Collaboration | Share links, comments, public gallery |

## Performance Targets

| Operation | Target |
|-----------|--------|
| Add room to table | <10ms |
| Update room dimensions | <20ms |
| Generate 3D scene | 50-200ms |
| Save to IndexedDB | 10-50ms |
| Export to glTF | 100-300ms |
| 3D frame rate | 60 FPS |

## Section Documents

Implementation tasks are organized in numbered sections designed for parallel development:

- **01-data-model.md** - Core types, Zustand stores (foundation - do first)
- **02-ui-shell.md** - App layout, navigation, theming
- **03-room-table.md** - Table-based room input (Quick Start)
- **04-canvas-editor.md** - 2D drawing and editing
- **05-3d-viewer.md** - Three.js 3D visualization
- **06-adjacency.md** - Room connections and spatial graph
- **07-doors-windows.md** - Building openings
- **08-materials.md** - Colors, textures, styling
- **09-storage.md** - IndexedDB persistence
- **10-export.md** - JSON, glTF, PDF export
- **11-import.md** - File import and parsing
- **12-project-management.md** - Project list, CRUD operations
- **13-sharing.md** - Share links, collaboration
- **14-accessibility.md** - WCAG compliance, keyboard nav
- **15-mobile.md** - Responsive design, touch gestures

Each section includes tasks with checkboxes, dependencies, and key test cases.
