# Section 15: Mobile & Responsive Design

> **Priority**: Medium - Important for broad accessibility.
>
> **Phase**: MVP (basic responsive), Phase 2 (mobile optimization)
>
> **Dependencies**:
> - Section 02 (UI shell, layout)
> - Section 03 (room table)
> - Section 04 (2D canvas)
> - Section 05 (3D viewer)
>
> **Parallel Work**: Can be developed alongside desktop features.

---

## Overview

This section ensures StrataPlan works well on tablets and phones. Responsive design adapts layouts for different screen sizes. Touch optimization makes interactions natural on mobile devices.

---

## Task 15.1: Responsive Breakpoints

**File**: `tailwind.config.js`, `src/styles/breakpoints.ts`

### Subtasks

- [x] **15.1.1** Define breakpoints:
  ```typescript
  const BREAKPOINTS = {
    sm: 640,    // Small phones
    md: 768,    // Large phones, small tablets
    lg: 1024,   // Tablets, small laptops
    xl: 1280,   // Desktops
    '2xl': 1536 // Large desktops
  }
  ```

- [x] **15.1.2** Configure Tailwind:
  ```javascript
  // tailwind.config.js
  module.exports = {
    theme: {
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      }
    }
  }
  ```

- [x] **15.1.3** Create useBreakpoint hook:
  ```typescript
  function useBreakpoint(): {
    isMobile: boolean    // < 768px
    isTablet: boolean    // 768-1024px
    isDesktop: boolean   // > 1024px
    breakpoint: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  }
  ```

- [ ] **15.1.4** Define layout strategies:
  - **Mobile (< 768px)**: Single column, stacked views
  - **Tablet (768-1024px)**: Collapsible sidebars, compact toolbar
  - **Desktop (> 1024px)**: Full multi-column layout

### Unit Tests

- [x] useBreakpoint returns correct value
- [x] Breakpoint changes on resize

---

## Task 15.2: Mobile Layout

**File**: `src/components/layout/MobileLayout.tsx`

### Subtasks

- [ ] **15.2.1** Create mobile layout component:
  - Single column layout
  - Bottom navigation bar
  - Full-width content area
  - Swipeable panels

- [ ] **15.2.2** Mobile navigation structure:
  ```
  ┌─────────────────────────────┐
  │ ≡  Project Name        ⋮   │ ← Header (48px)
  ├─────────────────────────────┤
  │                             │
  │                             │
  │     Main Content Area       │
  │     (Table / 2D / 3D)       │
  │                             │
  │                             │
  ├─────────────────────────────┤
  │ [Table] [2D] [3D] [More]   │ ← Bottom nav (56px)
  └─────────────────────────────┘
  ```

- [ ] **15.2.3** Header bar:
  - Hamburger menu (opens drawer)
  - Project name (truncated)
  - Actions menu (...)

- [ ] **15.2.4** Bottom navigation:
  - Tab buttons for main views
  - Table view, 2D editor, 3D viewer
  - More menu for additional options

- [ ] **15.2.5** Side drawer:
  - Slide from left
  - Contains: room list, settings, export
  - Backdrop to close

### Unit Tests

- [ ] Mobile layout renders correctly
- [ ] Bottom nav switches views
- [ ] Drawer opens and closes

---

## Task 15.3: Tablet Layout

**File**: `src/components/layout/TabletLayout.tsx`

### Subtasks

- [ ] **15.3.1** Create tablet layout:
  - Sidebar hidden by default (icon strip visible)
  - Main content takes full width
  - Properties panel slides from right

- [ ] **15.3.2** Compact toolbar:
  - Essential tools only visible
  - Overflow in menu
  - Larger touch targets

- [ ] **15.3.3** Collapsible panels:
  - Left sidebar: collapse to icon strip (48px)
  - Right panel: slide out overlay
  - Quick toggle buttons

- [ ] **15.3.4** Split view option:
  - 2D + 3D side by side
  - Adjustable split ratio
  - Or: toggle between views

### Unit Tests

- [ ] Tablet layout shows compact toolbar
- [ ] Sidebar collapses correctly
- [ ] Split view works

---

## Task 15.4: Mobile Room Table

**File**: `src/components/table/MobileRoomTable.tsx`, `src/components/table/RoomCard.tsx`

### Subtasks

- [ ] **15.4.1** Create card-based layout:
  - Each room as a card
  - Vertical stack
  - Swipe to navigate (optional)

- [ ] **15.4.2** Room card design:
  ```
  ┌─────────────────────────────┐
  │ 🛏 Bedroom 1          [≡]  │
  ├─────────────────────────────┤
  │ Length: 5.0 m   Width: 4.0m│
  │ Height: 2.7 m   Area: 20 m²│
  │ Type: [Bedroom ▼]          │
  ├─────────────────────────────┤
  │ [Edit]  [Delete]           │
  └─────────────────────────────┘
  ```

- [ ] **15.4.3** Expandable details:
  - Tap card to expand
  - Shows all editable fields
  - Inline editing

- [ ] **15.4.4** Add room button:
  - Floating action button (FAB)
  - Or: Button at bottom of list

- [ ] **15.4.5** Swipe actions:
  - Swipe left: delete
  - Swipe right: edit/duplicate

### Unit Tests

- [ ] Cards display room data
- [ ] Tap expands card
- [ ] Swipe triggers action

---

## Task 15.5: Touch-Optimized 2D Canvas

**File**: `src/components/editor/TouchCanvas.tsx`, `src/hooks/useTouchGestures.ts`

### Subtasks

- [ ] **15.5.1** Create touch gesture handler:
  ```typescript
  interface TouchGestures {
    onPan: (deltaX: number, deltaY: number) => void
    onPinch: (scale: number, centerX: number, centerY: number) => void
    onTap: (x: number, y: number) => void
    onDoubleTap: (x: number, y: number) => void
    onLongPress: (x: number, y: number) => void
  }
  ```

- [ ] **15.5.2** Implement pan gesture:
  - Single finger drag to pan
  - Momentum scrolling
  - Bounds checking

- [ ] **15.5.3** Implement pinch zoom:
  - Two-finger pinch to zoom
  - Zoom centered on pinch point
  - Smooth zoom animation

- [ ] **15.5.4** Implement tap interactions:
  - Tap to select room
  - Double-tap to open properties
  - Long-press for context menu

- [ ] **15.5.5** Touch-friendly selection:
  - Larger hit areas for rooms
  - Selection handles larger (20×20px minimum)
  - Clear visual feedback

- [ ] **15.5.6** Mobile toolbar:
  - Floating toolbar
  - Essential tools only
  - Toggle visibility

### Unit Tests

- [ ] Pan gesture moves canvas
- [ ] Pinch zoom changes scale
- [ ] Tap selects room
- [ ] Long-press shows menu

---

## Task 15.6: Touch-Optimized 3D Viewer

**File**: `src/components/viewer/TouchViewer.tsx`

### Subtasks

- [ ] **15.6.1** Touch orbit controls:
  - Single finger drag to orbit
  - Two-finger drag to pan
  - Pinch to zoom

- [ ] **15.6.2** Configure Three.js controls for touch:
  ```typescript
  controls.enableDamping = true
  controls.dampingFactor = 0.1
  controls.rotateSpeed = 0.5  // Slower for touch
  controls.panSpeed = 0.5
  controls.zoomSpeed = 0.5
  ```

- [ ] **15.6.3** Touch-friendly presets:
  - Large buttons for camera presets
  - Gesture hints overlay (first use)

- [ ] **15.6.4** Performance on mobile:
  - Reduce shadow quality
  - Lower resolution rendering
  - Simpler materials

### Unit Tests

- [ ] Touch controls work on 3D viewer
- [ ] Performance acceptable on mobile

---

## Task 15.7: Mobile Properties Panel

**File**: `src/components/properties/MobilePropertiesPanel.tsx`

### Subtasks

- [ ] **15.7.1** Bottom sheet design:
  - Slides up from bottom
  - Drag handle to resize
  - Snap points: closed, half, full

- [ ] **15.7.2** Property editing:
  - Large input fields
  - Native keyboard support
  - Dropdown selects as native pickers

- [ ] **15.7.3** Scroll management:
  - Scrollable content within sheet
  - Pull to dismiss
  - Keyboard avoidance

- [ ] **15.7.4** Quick actions:
  - Delete, duplicate buttons prominent
  - Confirmation on delete

### Unit Tests

- [ ] Bottom sheet opens/closes
- [ ] Property changes save
- [ ] Keyboard avoidance works

---

## Task 15.8: Touch Target Sizes

**File**: Updates across all components

### Subtasks

- [ ] **15.8.1** Audit touch targets:
  - Minimum 44×44px for buttons
  - Minimum 48×48px for primary actions
  - Adequate spacing between targets

- [ ] **15.8.2** Increase sizes on mobile:
  - Conditional sizing based on breakpoint
  - Or: use touch-specific CSS

- [ ] **15.8.3** Update toolbar buttons:
  - Increase padding on mobile
  - Reduce number of visible buttons
  - Overflow to menu

- [ ] **15.8.4** Update form controls:
  - Larger checkboxes and radio buttons
  - Larger slider thumbs
  - Adequate input height

### Unit Tests

- [ ] Touch targets meet minimum size
- [ ] Spacing between targets adequate

---

## Task 15.9: Mobile-Specific Features

**File**: Various components

### Subtasks

- [ ] **15.9.1** Pull-to-refresh:
  - On project list
  - Refreshes storage data

- [ ] **15.9.2** Swipe navigation:
  - Swipe between Table/2D/3D views
  - Page indicator dots

- [ ] **15.9.3** Device orientation:
  - Support landscape and portrait
  - Adapt layout to orientation
  - Optional: lock to landscape for editor

- [ ] **15.9.4** Mobile share sheet:
  - Use native share API when available
  - Fallback to custom share dialog

- [ ] **15.9.5** Add to home screen:
  - PWA manifest
  - Splash screen
  - Standalone mode

### Unit Tests

- [ ] Swipe navigation works
- [ ] Orientation change adapts layout

---

## Task 15.10: Progressive Web App (PWA)

**File**: `public/manifest.json`, `public/service-worker.js`

### Subtasks

- [ ] **15.10.1** Create web manifest:
  ```json
  {
    "name": "StrataPlan",
    "short_name": "StrataPlan",
    "description": "Create 3D floorplans",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#ffffff",
    "theme_color": "#3b82f6",
    "icons": [
      { "src": "/icon-192.png", "sizes": "192x192" },
      { "src": "/icon-512.png", "sizes": "512x512" }
    ]
  }
  ```

- [ ] **15.10.2** Create service worker (using Vite PWA plugin):
  ```bash
  npm install vite-plugin-pwa
  ```
  - Cache static assets
  - Offline support
  - Background sync for saves

- [ ] **15.10.3** App icons:
  - Create icons at multiple sizes
  - Apple touch icon
  - Favicon

- [ ] **15.10.4** Install prompt:
  - Detect installable state
  - Show install banner
  - Custom install button

- [ ] **15.10.5** Offline indicator:
  - Show when offline
  - Reassure data is saved locally

### Unit Tests

- [ ] Manifest loads correctly
- [ ] Service worker registers
- [ ] Offline mode works

---

## Task 15.11: Responsive Testing

**File**: `tests/responsive/`

### Subtasks

- [ ] **15.11.1** Create viewport test helpers:
  ```typescript
  function setViewport(width: number, height: number): void
  const VIEWPORTS = {
    mobile: { width: 375, height: 667 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: 1280, height: 800 },
  }
  ```

- [ ] **15.11.2** Test layouts at each breakpoint:
  - Mobile: single column, cards
  - Tablet: collapsible sidebars
  - Desktop: full layout

- [ ] **15.11.3** Test touch interactions:
  - Simulate touch events in tests
  - Verify gesture handlers fire

- [ ] **15.11.4** Device testing checklist:
  - iPhone SE (small phone)
  - iPhone 14 (standard phone)
  - iPad (tablet)
  - Android phone
  - Android tablet

### Unit Tests

- [ ] Layout correct at mobile viewport
- [ ] Layout correct at tablet viewport
- [ ] Layout correct at desktop viewport

---

## Integration Tests

**File**: `tests/integration/mobile.integration.test.tsx`

### Test Cases

- [ ] **Mobile table flow**: Open on mobile → view room cards → add room → edit → verify
- [ ] **Touch canvas**: Pinch zoom → pan → tap select → verify interactions
- [ ] **View switching**: Swipe between views → verify correct view shown
- [ ] **Bottom sheet**: Select room → sheet opens → edit → close → verify saved
- [ ] **Offline mode**: Go offline → make changes → verify saved locally

---

## Acceptance Criteria

- [ ] App usable on mobile phones (320px minimum width)
- [ ] App usable on tablets
- [ ] Touch gestures work naturally
- [ ] Touch targets meet minimum sizes (44px)
- [ ] Bottom navigation provides easy access to views
- [ ] Room cards work on mobile (vs. table)
- [ ] Properties edit in bottom sheet
- [ ] 2D canvas supports pinch zoom and pan
- [ ] 3D viewer supports touch orbit
- [ ] PWA installable on mobile devices
- [ ] Offline mode works
- [ ] Unit test coverage > 80%

---

## Files Created

```
src/
├── components/
│   ├── layout/
│   │   ├── MobileLayout.tsx
│   │   └── TabletLayout.tsx
│   ├── table/
│   │   ├── MobileRoomTable.tsx
│   │   └── RoomCard.tsx
│   ├── editor/
│   │   └── TouchCanvas.tsx
│   ├── viewer/
│   │   └── TouchViewer.tsx
│   └── properties/
│       └── MobilePropertiesPanel.tsx
├── hooks/
│   ├── useBreakpoint.ts
│   └── useTouchGestures.ts
├── styles/
│   └── mobile.css
└── public/
    ├── manifest.json
    ├── icon-192.png
    ├── icon-512.png
    └── service-worker.js

tests/
├── responsive/
│   └── viewports.test.tsx
└── integration/
    └── mobile.integration.test.tsx
```
