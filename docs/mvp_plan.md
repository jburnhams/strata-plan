# Floorplan App: MVP Plan Synthesizing Best-of-Breed Features

## North Star: Best of Planner 5D + Archilogic + RoomSketcher

### What We're Taking From Each

**From Planner 5D (68M users, frictionless UX):**
- ✅ Instant 2D→3D auto-extrusion (no manual steps)
- ✅ Real-time 3D preview as user edits 2D
- ✅ Dead-simple furniture placement
- ✅ Minimal learning curve (5 minutes to first 3D)

**From Archilogic (professional, extensible):**
- ✅ API-first architecture (not locked into UI)
- ✅ Modular: 2D editor, 3D viewer as separate components
- ✅ TypeScript SDK approach (developer-friendly)
- ✅ Data layer separate from rendering layer

**From RoomSketcher (professional workflows):**
- ✅ AI image→floorplan (PDF/photo upload)
- ✅ Detailed 3D walkthroughs with camera control
- ✅ Professional export options (2D/3D/PDF)
- ✅ Collaboration/sharing features

**What We're NOT Taking (Avoiding Their Mistakes):**
- ❌ Proprietary data formats (we use polymorphic JSON)
- ❌ Paywalling core features (free tier has full editing)
- ❌ Vendor lock-in (users can export anytime)
- ❌ Bloated UI (start minimal, add features progressively)

---

## Product Vision

### Positioning

**"Open-source Planner 5D with Archilogic's architecture and RoomSketcher's pro features"**

### Core Value Proposition

1. **Fastest 2D→3D workflow** - Beat Planner 5D's speed
2. **Developer-first** - SDKs and APIs for extensions
3. **Open data** - Standard formats (glTF, CityJSON exports)
4. **Progressive enhancement** - Start simple, scale to complex
5. **Free forever** - Core features never paywalled

### Target Users (MVP → Growth Path)

**Phase 1 (MVP):** Homeowners, small design studios, hobbyists
**Phase 2:** Professional designers, interior decorators
**Phase 3:** Integration partners (real estate, construction)

---

## Technical Architecture

### System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      WEB APPLICATION                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐         ┌──────────────────┐             │
│  │ 2D Floorplan     │         │ 3D Viewer        │             │
│  │ Editor (React)   │◄───────►│ (Three.js)       │             │
│  └────────┬─────────┘         └────────┬─────────┘             │
│           │                           │                        │
│           └───────────┬───────────────┘                        │
│                       │                                        │
│                 ┌─────▼─────────┐                              │
│                 │ Data Layer    │                              │
│                 │ (Polymorphic  │                              │
│                 │  Room Objects)│                              │
│                 └─────┬─────────┘                              │
│                       │                                        │
└───────────────────────┼────────────────────────────────────────┘
                        │ REST/GraphQL
        ┌───────────────┴──────────────────┐
        │                                  │
   ┌────▼──────┐                   ┌──────▼────┐
   │ FastAPI   │                   │ Node.js   │
   │ Backend   │                   │ Conversion│
   │ (Python)  │                   │ Service   │
   └────┬──────┘                   └──────┬────┘
        │                                 │
   ┌────▼──────────────────────────────────▼────┐
   │        PostgreSQL Database                  │
   │ (Store floorplans as JSONB)                │
   └───────────────────────────────────────────┘
        │
        ├─► Export: glTF (3D viewing)
        ├─► Export: CityJSON (publication)
        ├─► Export: PDF (printing)
        └─► Export: IFC (professional tools)
```

### Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **2D Editor** | React + Canvas/SVG | Fast, familiar, web-native |
| **3D Viewer** | Three.js | Industry standard, performant |
| **Data Model** | TypeScript (polymorphic) | Type-safe, flexible |
| **Backend** | FastAPI (Python) | Quick iteration, geometry libs |
| **Conversion** | Python (Trimesh, Shapely) | Mature 3D/2D libraries |
| **Database** | PostgreSQL (JSONB) | JSON-native, reliable |
| **Deployment** | Docker + Render/Railway | Simple, scalable, free tier |
| **Export** | Trimesh (glTF), custom (CityJSON) | Standards-based |

---

## MVP Feature Set (8 Weeks)

### Week 1-2: Core 2D Editor

**Features:**
- [ ] Canvas-based drawing (walls only)
- [ ] Wall placement (drag-and-drop)
- [ ] Wall properties: thickness, material
- [ ] 2D grid and snap-to-grid
- [ ] Pan and zoom
- [ ] Clear/undo/redo
- [ ] Save (to database)

**UI:**
- Minimal toolbar (draw wall, delete, select)
- Properties panel (left sidebar)
- Canvas (main area)
- No 3D yet

**Data:** Store as custom JSON (polymorphic format)

---

### Week 3-4: Room Definition

**Features:**
- [ ] Define rooms from walls (click enclosed area)
- [ ] Room properties: name, type (bedroom/kitchen/bathroom/living/other)
- [ ] Assign room metadata (ceiling height, material)
- [ ] Multiple rooms in same floorplan
- [ ] Room adjacency tracking
- [ ] Delete/rename rooms

**UI:**
- Room list panel (left sidebar)
- Click room → highlight on map
- Double-click room → edit properties
- Color-code rooms by type

**Data:** Extend JSON format with Room objects

---

### Week 5-6: 3D Export & Viewer

**Features:**
- [ ] Generate 3D geometry from 2D rooms
- [ ] Extrude rooms with ceiling heights
- [ ] Generate walls, floor, ceiling meshes
- [ ] Create glTF file
- [ ] Load and display in Three.js
- [ ] Basic materials (solid colors)
- [ ] Simple lighting (directional + ambient)
- [ ] Camera control (orbit, pan, zoom)

**UI:**
- "View 3D" button (top toolbar)
- Modal with 3D viewer
- Lighting controls (brightness slider)
- Close/fullscreen options

**Backend:** Python conversion service (CityJSON → glTF)

---

### Week 7-8: Polish & UI/UX

**Features:**
- [ ] Door/window placement on walls
- [ ] Door swing direction
- [ ] Window frame types (simple visual indicators)
- [ ] Room color picker (2D representation)
- [ ] Material picker (basic: color + texture)
- [ ] Export: glTF download
- [ ] Export: PDF (2D floorplan)
- [ ] Keyboard shortcuts
- [ ] Help/tutorial

**UI Polish:**
- Refined toolbar
- Better property panels
- Responsive layout (mobile-aware)
- Dark/light theme toggle

**Performance:**
- Lazy load 3D (only when "View 3D" clicked)
- Cache 3D geometries
- Optimize Three.js rendering

---

## MVP Success Metrics

**Performance:**
- 2D editor responsive (60 FPS)
- 3D loads in <2 seconds
- Can handle 20+ rooms without lag

**UX:**
- First-time user creates floorplan in <10 minutes
- Can switch between 2D and 3D seamlessly
- Export works without errors

**Data:**
- Floorplans persist to database
- Can reload saved floorplans
- JSON export is valid format

---

## Post-MVP: Growth Roadmap

### Phase 1 (Weeks 9-12): Social & Sharing

- [ ] User accounts (sign-up/login)
- [ ] Save floorplans to profile
- [ ] Share links (read-only 3D view)
- [ ] Public gallery (featured floorplans)
- [ ] Comment/like system

**Why:** Drive engagement, build community

---

### Phase 2 (Weeks 13-16): Furniture & Customization

- [ ] Furniture library (basic: bed, sofa, table, chair)
- [ ] Drag-drop furniture into rooms
- [ ] Furniture placement snapping
- [ ] Rotate/scale furniture
- [ ] Custom furniture upload (OBJ/GLTF)
- [ ] Material textures (wood, metal, fabric, etc.)
- [ ] Color customization per surface

**Why:** Users want "interior design" not just "room outlines"

---

### Phase 3 (Weeks 17-20): Professional Features

- [ ] Multi-floor support
- [ ] 3D walkthroughs (camera paths)
- [ ] 360° panorama export
- [ ] AI image-to-floorplan (optional, complex)
- [ ] CityJSON export
- [ ] IFC export
- [ ] Collaboration (real-time editing)
- [ ] Revision history

**Why:** Open up professional use cases

---

### Phase 4 (Weeks 21+): Developer Ecosystem

- [ ] TypeScript SDK (like Archilogic)
- [ ] REST API (CRUD floorplans)
- [ ] Webhooks (publish events)
- [ ] Extension marketplace
- [ ] Custom material library support
- [ ] Plugin system (2D editor, 3D viewer, exporters)

**Why:** Enable integrations, partners, 3rd-party tools

---

## Data Model (Finalized)

### Floorplan JSON Format

```typescript
interface Floorplan {
  id: string;
  version: string;              // "1.0.0" for versioning
  createdAt: string;
  updatedAt: string;
  
  metadata: {
    name: string;
    scale: { value: number; unit: 'meters' | 'feet' };
    northAxis: number;          // degrees
  };
  
  building: {
    name?: string;
    totalHeight?: number;
  };
  
  // Multiple floors
  floors: Array<{
    id: string;
    level: number;              // 0 = ground, 1 = first, etc.
    name: string;
    heightAboveGround: number;
    
    // Rooms on this floor
    rooms: Array<{
      id: string;
      name: string;
      type: 'bedroom' | 'kitchen' | 'bathroom' | 'living' | 'other';
      ceilingHeight: number;
      
      // Type discriminator
      geometry: SimpleRoomGeometry | PolygonRoomGeometry | CustomRoomGeometry;
      
      attributes: {
        material?: string;
        color?: string;
        [key: string]: any;
      };
    }>;
    
    // Doors/windows (shared)
    openings: Array<{
      id: string;
      type: 'door' | 'window';
      roomId: string;
      position: { x: number; y: number };
      width: number;
      height: number;
      rotation?: number;
    }>;
  }>;
  
  // Furniture (separate layer)
  furniture?: Array<{
    id: string;
    name: string;
    type: string;                // "sofa", "table", "bed", etc.
    modelUrl?: string;           // URL to GLTF/OBJ
    roomId?: string;
    position: { x: number; y: number; z: number };
    rotation: number;            // degrees
    scale: { x: number; y: number; z: number };
    attributes: Record<string, any>;
  }>;
}

type SimpleRoomGeometry = {
  kind: 'simple';
  x: number;
  y: number;
  width: number;
  depth: number;
};

type PolygonRoomGeometry = {
  kind: 'polygon';
  vertices: Array<{ x: number; y: number }>;
  wallThickness: number;
};

type CustomRoomGeometry = {
  kind: 'custom';
  vertices: Array<{ x: number; y: number; z: number }>;
  faces: Array<number[]>;
};
```

---

## Development Timeline

### Week 1-2: Setup + Core 2D
- [ ] Project setup (React, FastAPI, PostgreSQL)
- [ ] Database schema
- [ ] Canvas-based 2D editor
- [ ] Wall placement logic
- [ ] Basic save/load

**Deliverable:** Can draw walls and save them

---

### Week 3-4: Rooms
- [ ] Room detection (polygon detection from walls)
- [ ] Room properties UI
- [ ] Room metadata storage
- [ ] Multi-room floorplans

**Deliverable:** Can define multiple rooms in a floorplan

---

### Week 5-6: 3D
- [ ] Python conversion service (floorplan → glTF)
- [ ] Three.js viewer integration
- [ ] Real-time preview toggle
- [ ] Lighting controls

**Deliverable:** Can view 2D floorplan as 3D

---

### Week 7-8: Polish
- [ ] Doors/windows
- [ ] Material picker
- [ ] Export (glTF, PDF)
- [ ] UI refinement
- [ ] Performance optimization
- [ ] Testing and bug fixes

**Deliverable:** Polished MVP ready for launch

---

## Success Criteria for MVP Launch

**Functional:**
- ✅ Can create, save, load floorplans
- ✅ 2D drawing is responsive
- ✅ 3D viewer works for all room types
- ✅ Export to glTF and PDF
- ✅ No crashes or data loss

**UX:**
- ✅ <10 minute onboarding for new users
- ✅ Smooth 2D↔3D switching
- ✅ Intuitive furniture placement (Phase 2)

**Performance:**
- ✅ 2D editor: 60 FPS
- ✅ 3D load: <2 seconds
- ✅ 20+ rooms: still responsive

**Data:**
- ✅ JSON export is valid
- ✅ Can round-trip (export → import)
- ✅ Database persistence works

---

## Competitive Positioning

| Feature | Planner 5D | RoomSketcher | Archilogic | **Our App** |
|---------|-----------|--------------|-----------|-----------|
| **2D→3D Speed** | ✅ Instant | ✅ Instant | ⚠️ Manual | ✅ Instant |
| **AI Image Import** | ❌ No | ✅ Yes | ❌ No | 🚧 Later |
| **3D Walkthroughs** | ⚠️ Basic | ✅ Advanced | ✅ Advanced | 🚧 Later |
| **API/SDK** | ❌ No | ❌ No | ✅ Yes | ✅ Yes |
| **Data Export** | ❌ Proprietary | ❌ Proprietary | ⚠️ Limited | ✅ Open |
| **Furniture Lib** | ✅ Extensive | ✅ Extensive | ⚠️ Basic | 🚧 MVP+ |
| **Free Tier** | ✅ Limited | ⚠️ Limited | ❌ No | ✅ Full |
| **Open Source** | ❌ No | ❌ No | ❌ No | ✅ Yes |
| **For Developers** | ❌ Bad | ⚠️ OK | ✅ Excellent | ✅ Excellent |

---

## Go-to-Market Strategy

### Week 0-2 (Pre-Launch)
- [ ] Create landing page
- [ ] Set up GitHub repo (open-source)
- [ ] Write launch blog post
- [ ] Reach out to tech communities (HN, Reddit, ProductHunt)

### Week 2-4 (Launch)
- [ ] Launch on Product Hunt
- [ ] Tweet + share on Twitter
- [ ] Post on architecture/design communities
- [ ] Reach out to design bloggers for review

### Week 4-12 (Growth)
- [ ] User feedback collection
- [ ] Bug fixes from early users
- [ ] Polish based on feedback
- [ ] Add Phase 1 features (sharing, gallery)
- [ ] Document API for developers

---

## Revenue Model (Future, Not MVP)

**MVP:** Free, open-source, no monetization

**Post-MVP Ideas (never lock core features):**
- ✅ Premium cloud storage (more floorplans)
- ✅ Furniture library premium add-ons
- ✅ AI image-to-floorplan as service
- ✅ 3D walkthrough hosting
- ✅ Commercial license for agencies
- ✅ White-label version
- ✅ Professional support/SLA

**Never:**
- ❌ Paywall 2D editing
- ❌ Paywall 3D viewing
- ❌ Paywall export
- ❌ Paywall core features

---

## Success Definition

**MVP success = "Can anyone create a simple floorplan in 10 minutes and view it in 3D"**

That's it. Everything else is phase 2+.

If we nail that, we've beaten Planner 5D on accessibility while keeping Archilogic's architecture and RoomSketcher's polish.

---

## Risk Mitigation

| Risk | Likelihood | Mitigation |
|------|-----------|-----------|
| **Geometry bugs** | High | Early unit tests for polygon logic, shoelace formula validation |
| **Performance** | Medium | Lazy load 3D, cache meshes, profile early |
| **Data loss** | Medium | Frequent saves, test backup/restore early |
| **UX friction** | Medium | Weekly user testing, iterate UI fast |
| **Scope creep** | High | Hard stop at week 8, everything else is post-MVP |

---

## Next Step: Week 1 Sprint Plan

**Day 1-2:** Project setup
- [ ] GitHub repo initialized
- [ ] React frontend scaffold
- [ ] FastAPI backend scaffold
- [ ] PostgreSQL setup
- [ ] Docker Compose for dev environment

**Day 3-5:** 2D Canvas
- [ ] Canvas rendering loop
- [ ] Mouse event handling (click, drag)
- [ ] Line drawing (wall placement)
- [ ] Grid and snap-to-grid

**Day 6-7:** Basic save/load
- [ ] JSON serialization
- [ ] Database CRUD
- [ ] Load floorplan from DB
- [ ] Persist to DB on every wall add

**Week 1 Deliverable:** Fully functional 2D wall drawing with persistence

---

## Conclusion

This plan synthesizes:
- **Planner 5D's friction-free UX** (instant 2D→3D)
- **Archilogic's extensible architecture** (API-first, modular)
- **RoomSketcher's professional polish** (detailed 3D, exports)
- **Open-source ethos** (user data ownership)

We're not competing on features. We're competing on **user experience + developer experience + open data**.

The market clearly wants floorplanning to be fast and easy. We're making it fast, easy, AND open.
