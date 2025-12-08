# Quick Start Checklist: 8-Week MVP Launch

## Pre-Flight (Before Day 1)

### Decision: Tech Stack

**Decided:**
- Frontend: React + TypeScript + Canvas
- 3D: Three.js
- Backend: FastAPI (Python)
- Database: PostgreSQL (JSONB columns)
- Geometry: Trimesh, Shapely, NumPy
- Deployment: Docker + Render/Railway

**Lock in:** Don't second-guess these decisions. They're proven, available, and right for this scope.

### Setup Tasks (1 day)

```bash
# Create monorepo structure
floorplan-app/
├── frontend/               # React app
│   ├── src/
│   │   ├── components/    # 2D editor, 3D viewer
│   │   ├── types/         # Room, Floorplan interfaces
│   │   ├── hooks/         # useFloorplan, useCanvas, etc.
│   │   └── App.tsx
│   └── package.json
├── backend/               # FastAPI
│   ├── app/
│   │   ├── main.py
│   │   ├── models.py      # SQLAlchemy models
│   │   ├── schemas.py     # Pydantic schemas
│   │   ├── geometry.py    # Room geometry logic
│   │   └── export.py      # glTF, CityJSON, PDF export
│   ├── requirements.txt
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

**Tools to install:**
- Node.js 18+
- Python 3.11+
- Docker Desktop
- Git

---

## Week 1: 2D Canvas Editor

### Day 1-2: Project Skeleton

**Tasks:**
- [ ] Create React app (use Vite for speed)
- [ ] Set up TypeScript
- [ ] Create Canvas component with basic rendering loop
- [ ] Set up FastAPI backend scaffold
- [ ] Create PostgreSQL schema (floorplans table, JSONB column)
- [ ] Test round-trip: frontend → backend → DB

**Deliverable:** Can draw a single line on canvas

**Code example:**
```typescript
// Canvas rendering loop
const canvas = useRef<HTMLCanvasElement>(null);

useEffect(() => {
  const ctx = canvas.current?.getContext('2d');
  if (!ctx) return;

  const render = () => {
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.current!.width, canvas.current!.height);
    
    // Draw grid
    drawGrid(ctx);
    
    // Draw walls
    walls.forEach(wall => drawWall(ctx, wall));
    
    requestAnimationFrame(render);
  };
  
  render();
}, [walls]);
```

---

### Day 3-5: Wall Drawing

**Tasks:**
- [ ] Mouse event handling (mousedown, mousemove, mouseup)
- [ ] Draw lines while dragging
- [ ] Create Wall objects (from, to coordinates)
- [ ] Grid snapping (snap to nearest 0.1m)
- [ ] Delete walls (right-click)
- [ ] Undo/redo (use a Stack)

**Data model:**
```typescript
interface Wall {
  id: string;
  from: { x: number; y: number };
  to: { x: number; y: number };
  thickness: number;
}

interface Canvas2D {
  walls: Wall[];
  selectedWall?: string;
}
```

**Deliverable:** Can draw, move, delete walls interactively

---

### Day 6-7: Save/Load

**Tasks:**
- [ ] Serialize walls to JSON
- [ ] POST to backend (save floorplan)
- [ ] GET from backend (load floorplan)
- [ ] Add naming/listing UI
- [ ] Test round-trip: draw → save → reload

**Backend endpoint:**
```python
@app.post("/api/floorplans/")
async def create_floorplan(floorplan: FloorplanSchema, db: Session):
    db_floorplan = Floorplan(
        name=floorplan.name,
        data=floorplan.model_dump_json()  # Store as JSON
    )
    db.add(db_floorplan)
    db.commit()
    return db_floorplan
```

**Deliverable:** Can save and reload walls

---

## Week 2: Room Definition

### Day 1-3: Room Detection

**Tasks:**
- [ ] Implement flood-fill algorithm to detect enclosed areas
- [ ] Convert enclosed area to Room object
- [ ] Store rooms separately from walls
- [ ] Click on enclosed area → create room

**Algorithm:**
```typescript
function detectEnclosedAreas(walls: Wall[]): Area[] {
  // Rasterize walls to grid
  const grid = rasterizeWalls(walls, gridSize);
  
  // Flood-fill from outside boundary
  const visited = floodFillFromOutside(grid);
  
  // Find unvisited clusters (enclosed areas)
  return findClusters(visited);
}
```

**Deliverable:** Can click on enclosed area and create a room

---

### Day 4-5: Room Properties

**Tasks:**
- [ ] Room list panel (left sidebar)
- [ ] Click room → highlight on canvas
- [ ] Double-click room → edit dialog
- [ ] Properties: name, type, ceiling height, material
- [ ] Color-code rooms by type

**Data model:**
```typescript
interface Room {
  id: string;
  name: string;
  type: 'bedroom' | 'kitchen' | 'bathroom' | 'living' | 'other';
  vertices: Array<{ x: number; y: number }>;
  ceilingHeight: number;
  attributes: { material?: string; color?: string };
}
```

**Deliverable:** Can create, name, and color-code multiple rooms

---

### Day 6-7: Multi-room Floorplans

**Tasks:**
- [ ] Test with 5+ room floorplans
- [ ] Ensure room adjacency is tracked correctly
- [ ] Save/load multi-room floorplans
- [ ] Fix any bugs in room detection

**Deliverable:** Fully functional multi-room 2D editor

---

## Week 3: 3D Geometry Generation

### Day 1-3: Python Conversion Service

**Tasks:**
- [ ] Create endpoint `/api/convert/floorplan-to-3d`
- [ ] Parse floorplan JSON
- [ ] For each room:
  - Extract 2D polygon (vertices)
  - Extrude to 3D with ceiling height
  - Generate faces (floor, ceiling, walls)
  - Apply default material
- [ ] Combine all meshes into single geometry

**Python code:**
```python
import trimesh
import numpy as np

def floorplan_to_3d(floorplan_data: dict) -> trimesh.Trimesh:
    meshes = []
    
    for room in floorplan_data['floors'][0]['rooms']:
        vertices, faces = create_room_geometry(
            room['geometry'],
            room['ceilingHeight']
        )
        mesh = trimesh.Trimesh(vertices=vertices, faces=faces)
        meshes.append(mesh)
    
    return trimesh.util.concatenate(meshes)
```

**Deliverable:** Can convert 2D floorplan to 3D mesh

---

### Day 4-5: glTF Export

**Tasks:**
- [ ] Export 3D mesh to glTF format
- [ ] Ensure glTF is valid (test in viewers)
- [ ] Store glTF URL in database
- [ ] Cache glTF (regenerate only on edit)

**Code:**
```python
def export_to_gltf(mesh: trimesh.Trimesh) -> bytes:
    # Export to glTF binary format
    return mesh.export(file_type='gltf', include_normals=True)
```

**Deliverable:** Valid glTF files being generated

---

### Day 6-7: Three.js Viewer

**Tasks:**
- [ ] Create 3D viewer component (React + Three.js)
- [ ] Load glTF from URL
- [ ] Add basic lighting (directional + ambient)
- [ ] Add camera controls (orbit controls)
- [ ] Add materials (solid colors)

**Code:**
```typescript
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const loader = new GLTFLoader();
loader.load('floorplan.gltf', (gltf) => {
  scene.add(gltf.scene);
  renderer.render(scene, camera);
});
```

**Deliverable:** Can view 2D floorplan as 3D

---

## Week 4: Real-time Preview & Polish

### Day 1-2: Real-time 3D

**Tasks:**
- [ ] Auto-generate 3D preview when floorplan changes
- [ ] Show 3D in modal/split view (don't block 2D editing)
- [ ] Debounce 3D generation (no more than 1/sec)
- [ ] Handle errors gracefully

**Deliverable:** 3D updates in real-time as user edits 2D

---

### Day 3-4: Doors/Windows

**Tasks:**
- [ ] Add door/window tool to toolbar
- [ ] Click on wall → place door/window
- [ ] Doors have swing direction, windows have frame type
- [ ] Render doors/windows in 3D

**Data model:**
```typescript
interface Opening {
  id: string;
  type: 'door' | 'window';
  position: { x: number; y: number };  // On room canvas
  width: number;
  height: number;
  rotation?: number;
}
```

**Deliverable:** Can place and view doors/windows

---

### Day 5: Material Picker

**Tasks:**
- [ ] Material selector UI (color + texture)
- [ ] Apply to rooms or surfaces
- [ ] Update 3D rendering with materials
- [ ] Include 5-10 basic textures (tile, wood, carpet, etc.)

**Deliverable:** Can change room colors/materials

---

### Day 6: Export

**Tasks:**
- [ ] Export to glTF (download)
- [ ] Export to PDF (2D floorplan)
- [ ] Export to JSON (custom format)
- [ ] Ensure exports are valid and round-trip

**Deliverable:** Multiple export formats working

---

### Day 7: Testing & Bug Fixes

**Tasks:**
- [ ] Create floorplans of various complexity
- [ ] Test all workflows end-to-end
- [ ] Fix crashes, geometry bugs
- [ ] Performance optimization (profiles rendering)

**Deliverable:** Stable, tested MVP

---

## Success Metrics Checklist

### Functional
- [ ] Can draw walls
- [ ] Can detect and create rooms
- [ ] Can switch between 2D and 3D
- [ ] Can export to glTF, PDF, JSON
- [ ] No crashes

### Performance
- [ ] 2D canvas runs at 60 FPS
- [ ] 3D loads in <2 seconds
- [ ] 20+ room floorplan responsive

### UX
- [ ] Toolbar is intuitive
- [ ] Drawing feels responsive
- [ ] 3D preview is helpful
- [ ] Export works without errors

### Data
- [ ] JSON export is valid format
- [ ] Can round-trip (export → import)
- [ ] Database persists reliably

---

## Daily Standup Template

**Every day, ask:**
1. ✅ What did I build today?
2. 🚧 What am I building next?
3. 🚨 What blockers do I have?
4. 📊 Did I hit my weekly milestone?

**If you're behind:**
- Cut scope (defer non-MVP features)
- Don't extend timeline (ship on Week 8 anyway)
- Prioritize: 2D editor > 3D rendering > export polish

---

## Red Flags (Stop and Re-evaluate)

If you encounter:
- ❌ **Geometry bugs taking >4 hours** → Use external library (Shapely, instead of custom code)
- ❌ **Performance issues with 10+ rooms** → Profile and optimize, or simplify geometry
- ❌ **Scope creep (adding features not in MVP)** → Drop them, add after launch
- ❌ **Database issues** → Switch to simpler solution if needed
- ❌ **Third-party library not working** → Replace immediately, don't debug

**Only 8 weeks. Ship > perfection.**

---

## Launch Checklist (Week 8)

- [ ] Code reviewed
- [ ] No console errors or warnings
- [ ] Database backup tested
- [ ] Deployment tested (can restart without issues)
- [ ] README written
- [ ] Basic docs/tutorial created
- [ ] GitHub repo public
- [ ] Product Hunt post drafted
- [ ] Twitter announcement ready
- [ ] Email to friends/communities ready

---

## Post-MVP (Week 9+)

**Don't touch MVP code. Start separate branch for Phase 1 features:**
- User accounts
- Sharing / public gallery
- Furniture library

**Lessons learned from MVP:**
- What did users love?
- What was confusing?
- What crashed?
- What was too slow?

Build Phase 1 answering those questions.

---

## Motivation Reminder

You're building the app that:
- ✅ Users actually want (beats Planner 5D on accessibility)
- ✅ Architects can extend (beats Planner 5D on architecture)
- ✅ Data portability (beats Planner 5D on lock-in)
- ✅ Takes 8 weeks (beats perpetual delay)

Week 8 is your hard stop. Ship something real, learn from users, iterate.

**Go build.**
