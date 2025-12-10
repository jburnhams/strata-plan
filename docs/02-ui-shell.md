# Section 02: UI Shell, Navigation & Theming

> **Priority**: High - Provides the application framework for all other features.
>
> **Phase**: MVP (Phase 1)
>
> **Dependencies**: Section 01 (types and stores must exist)
>
> **Parallel Work**: Can run in parallel with Sections 03, 04, 05 once basic shell is complete.

---

## Overview

This section builds the application shell including the main layout, top toolbar, sidebars, theme system, and navigation. Uses Shadcn/ui components with Tailwind CSS for consistent, accessible styling.

---

## Task 2.1: Install and Configure UI Dependencies

**Files**: `package.json`, `tailwind.config.js`, `src/index.css`, `components.json`

### Subtasks

- [x] **2.1.1** Install Tailwind CSS:
  ```bash
  npm install -D tailwindcss postcss autoprefixer
  npx tailwindcss init -p
  ```

- [x] **2.1.2** Configure `tailwind.config.js`:
  - Set content paths for `src/**/*.{ts,tsx}`
  - Add custom colors for room types
  - Configure dark mode as 'class'
  - Add container and breakpoint configuration

- [x] **2.1.3** Set up `src/index.css` with Tailwind directives:
  ```css
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
  ```

- [x] **2.1.4** Initialize Shadcn/ui:
  ```bash
  npx shadcn-ui@latest init
  ```
  - Style: Default
  - Base color: Slate
  - CSS variables: Yes

- [x] **2.1.5** Install core Shadcn components:
  ```bash
  npx shadcn-ui@latest add button
  npx shadcn-ui@latest add input
  npx shadcn-ui@latest add label
  npx shadcn-ui@latest add select
  npx shadcn-ui@latest add dialog
  npx shadcn-ui@latest add dropdown-menu
  npx shadcn-ui@latest add tooltip
  npx shadcn-ui@latest add toast
  npx shadcn-ui@latest add slider
  npx shadcn-ui@latest add switch
  npx shadcn-ui@latest add tabs
  npx shadcn-ui@latest add card
  npx shadcn-ui@latest add separator
  npx shadcn-ui@latest add scroll-area
  ```

- [x] **2.1.6** Install additional dependencies:
  ```bash
  npm install lucide-react clsx tailwind-merge
  npm install @radix-ui/react-icons
  ```

- [x] **2.1.7** Create `src/lib/utils.ts` with `cn()` helper for class merging

### Unit Tests

- [x] Verify Tailwind classes are being applied (render component, check classList)
- [x] Verify Shadcn Button renders correctly

---

## Task 2.2: Theme System

**Files**: `src/components/layout/ThemeProvider.tsx`, `src/hooks/useTheme.ts`

### Subtasks

- [x] **2.2.1** Create `ThemeProvider` component:
  - Wraps app with theme context
  - Reads initial theme from localStorage or system preference
  - Applies `dark` class to document root when dark mode active
  - Syncs with `uiStore.theme`

- [x] **2.2.2** Create `useTheme` hook:
  ```typescript
  interface UseThemeReturn {
    theme: 'light' | 'dark' | 'system'
    resolvedTheme: 'light' | 'dark'
    setTheme: (theme: 'light' | 'dark' | 'system') => void
    toggleTheme: () => void
  }
  ```

- [x] **2.2.3** Handle system preference changes via `matchMedia` listener

- [x] **2.2.4** Persist theme preference to localStorage

- [x] **2.2.5** Create `ThemeToggle` component:
  - Icon button showing sun/moon
  - Dropdown with Light / Dark / System options
  - Keyboard accessible

### Unit Tests (`tests/unit/components/layout/ThemeProvider.test.tsx`)

- [x] Theme defaults to 'system'
- [x] `setTheme('dark')` adds dark class to root
- [x] Theme persists across remounts (mock localStorage)
- [x] System preference changes update resolved theme

---

## Task 2.3: Application Shell Layout

**File**: `src/components/layout/AppShell.tsx`

### Subtasks

- [x] **2.3.1** Create main layout structure:
  ```
  ┌──────────────────────────────────────────────────────┐
  │                    TopToolbar                         │
  ├──────────┬───────────────────────────┬───────────────┤
  │          │                           │               │
  │  Left    │       MainCanvas          │    Right      │
  │  Sidebar │       (children)          │    Panel      │
  │  (nav)   │                           │  (properties) │
  │          │                           │               │
  └──────────┴───────────────────────────┴───────────────┘
  │                   StatusBar                          │
  └──────────────────────────────────────────────────────┘
  ```

- [x] **2.3.2** Implement collapsible left sidebar:
  - Default width: 280px
  - Collapsed width: 48px (icons only)
  - Collapse button with chevron icon
  - Respects `uiStore.sidebarOpen`

- [x] **2.3.3** Implement collapsible right properties panel:
  - Default width: 320px
  - Can be fully hidden
  - Respects `uiStore.propertiesPanelOpen`

- [x] **2.3.4** Main content area fills remaining space

- [x] **2.3.5** Add CSS transitions for sidebar collapse/expand (200ms ease)

- [x] **2.3.6** Handle keyboard shortcut: `[` to toggle left sidebar, `]` to toggle right panel

### Unit Tests

- [x] Layout renders all sections
- [x] Sidebar toggles correctly
- [x] Properties panel toggles correctly
- [x] Keyboard shortcuts trigger toggles

---

## Task 2.4: Top Toolbar

**File**: `src/components/layout/TopToolbar.tsx`

### Subtasks

- [x] **2.4.1** Create toolbar container:
  - Fixed height: 48px
  - Background with blur effect
  - Border bottom

- [x] **2.4.2** Implement File menu (dropdown):
  - New Project (Ctrl+N)
  - Open Project (Ctrl+O)
  - Recent Projects (submenu, shows last 5)
  - Separator
  - Save (Ctrl+S)
  - Save As
  - Separator
  - Import
  - Export (submenu: JSON, glTF, PDF)
  - Separator
  - Project Settings

- [x] **2.4.3** Implement Edit menu (dropdown):
  - Undo (Ctrl+Z)
  - Redo (Ctrl+Y)
  - Separator
  - Cut (Ctrl+X)
  - Copy (Ctrl+C)
  - Paste (Ctrl+V)
  - Duplicate (Ctrl+D)
  - Delete (Del)
  - Separator
  - Select All (Ctrl+A)
  - Deselect (Esc)

- [x] **2.4.4** Implement View menu (dropdown):
  - Table View (Ctrl+1)
  - 2D Editor (Ctrl+2)
  - 3D Preview (Ctrl+3)
  - Separator
  - Toggle Grid (G)
  - Toggle Measurements
  - Toggle Room Labels
  - Separator
  - Zoom In (+)
  - Zoom Out (-)
  - Zoom to Fit (0)
  - Separator
  - Dark Mode toggle

- [x] **2.4.5** Create tool buttons group:
  - View 3D button (prominent, primary color)
  - Export dropdown button

- [x] **2.4.6** Add right section:
  - Theme toggle
  - Help button (?)
  - Settings button (gear icon)

- [x] **2.4.7** Show keyboard shortcuts in menu items

- [x] **2.4.8** Disable menu items when not applicable (e.g., Undo when nothing to undo)

### Unit Tests

- [x] All menus render and open
- [x] Menu items have correct keyboard shortcuts displayed
- [x] Disabled state works correctly
- [x] Menu closes on item click

---

## Task 2.5: Left Sidebar Navigation

**File**: `src/components/layout/LeftSidebar.tsx`, `src/components/layout/SidebarSection.tsx`

### Subtasks

- [x] **2.5.1** Create collapsible section component:
  ```typescript
  interface SidebarSectionProps {
    title: string
    count?: number
    defaultOpen?: boolean
    children: React.ReactNode
  }
  ```
  - Header with title, count badge, chevron
  - Collapsible content area
  - Keyboard accessible (Enter/Space to toggle)

- [x] **2.5.2** Create Rooms section:
  - Header: "Rooms (N)"
  - List of room items
  - Each item: color swatch, name, area
  - Click to select room
  - Right-click context menu (Rename, Duplicate, Delete) (Deferred)
  - "+ Add Room" button at bottom

- [x] **2.5.3** Create Walls section (for canvas mode):
  - Header: "Walls (N)"
  - List of wall items
  - Each item: wall ID, length
  - Click to select

- [x] **2.5.4** Create Doors section:
  - Header: "Doors (N)"
  - List items with room association

- [x] **2.5.5** Create Windows section:
  - Header: "Windows (N)"
  - List items with room association

- [x] **2.5.6** Implement search/filter box at top:
  - Filters visible items across all sections
  - Debounced input (300ms)

- [x] **2.5.7** Collapsed state shows only icons for sections

### Unit Tests

- [x] Sections expand/collapse correctly
- [x] Room list shows correct count
- [x] Click on room item triggers selection
- [x] Filter filters items in all sections
- [x] Context menu shows on right-click (Deferred)

---

## Task 2.6: Right Properties Panel

**File**: `src/components/layout/PropertiesPanel.tsx`, `src/components/properties/*.tsx`

### Subtasks

- [ ] **2.6.1** Create panel container:
  - Header showing selection type ("Room Properties", "No Selection", etc.)
  - Scrollable content area

- [ ] **2.6.2** Create `NoSelectionPanel`:
  - Message: "Select a room to edit its properties"
  - Project summary stats (total area, room count)

- [ ] **2.6.3** Create `RoomPropertiesPanel`:
  - Name input field
  - Type dropdown
  - Dimensions: Length, Width, Height inputs with unit suffix
  - Area display (read-only, calculated)
  - Volume display (read-only, calculated)
  - Color picker
  - Material dropdown
  - Delete button with confirmation

- [ ] **2.6.4** Create `WallPropertiesPanel`:
  - Length display (read-only)
  - Thickness slider/input
  - Material dropdown
  - Delete button

- [ ] **2.6.5** Create `DoorPropertiesPanel`:
  - Width, Height inputs
  - Type dropdown (single, double, sliding, etc.)
  - Swing direction toggle
  - Handle side toggle
  - Delete button

- [ ] **2.6.6** Create `WindowPropertiesPanel`:
  - Width, Height inputs
  - Sill height input
  - Frame type dropdown
  - Delete button

- [ ] **2.6.7** Create `MultiSelectionPanel`:
  - Shows when multiple items selected
  - Common properties editable (batch edit)
  - Shows "Mixed" for differing values

- [ ] **2.6.8** Connect panels to Zustand store:
  - Read from store
  - Dispatch updates on change

### Unit Tests

- [ ] Correct panel shown based on selection type
- [ ] Input changes dispatch store updates
- [ ] Validation errors display inline
- [ ] Delete shows confirmation dialog
- [ ] Multi-selection shows common properties

---

## Task 2.7: Status Bar

**File**: `src/components/layout/StatusBar.tsx`

### Subtasks

- [ ] **2.7.1** Create status bar container:
  - Fixed height: 24px
  - Background slightly darker than main
  - Small text (12px)

- [ ] **2.7.2** Left section content:
  - Project name (truncated if long)
  - Selection info ("2 rooms selected" or "Kitchen selected")

- [ ] **2.7.3** Center section:
  - Mouse coordinates when over canvas ("X: 5.2m, Z: 3.8m")

- [ ] **2.7.4** Right section content:
  - Save status indicator:
    - Cloud icon + "Saved" (green) when synced
    - Spinner + "Saving..." when saving
    - Warning icon + "Error" (red) on error
    - Dot + "Unsaved" when dirty
  - Last save time ("Saved 2 min ago")
  - Zoom level ("100%")

- [ ] **2.7.5** Add tooltips on hover for each element

### Unit Tests

- [ ] Displays correct save status
- [ ] Coordinates update (mock mouse position)
- [ ] Selection info reflects store state

---

## Task 2.8: Toast Notifications

**File**: `src/components/ui/Toaster.tsx`, `src/hooks/useToast.ts`

### Subtasks

- [ ] **2.8.1** Configure Shadcn Toast provider in App root

- [ ] **2.8.2** Create `useToast` hook wrapper:
  ```typescript
  interface ToastOptions {
    title: string
    description?: string
    variant?: 'default' | 'success' | 'error' | 'warning'
    duration?: number
    action?: { label: string; onClick: () => void }
  }
  ```

- [ ] **2.8.3** Create toast variants with icons:
  - Default: info icon (blue)
  - Success: checkmark icon (green)
  - Error: X icon (red)
  - Warning: alert icon (yellow)

- [ ] **2.8.4** Position toasts in bottom-right

- [ ] **2.8.5** Default duration: 4000ms

- [ ] **2.8.6** Create convenience functions:
  - `toastSuccess(message: string)`
  - `toastError(message: string)`
  - `toastWarning(message: string)`

### Unit Tests

- [ ] Toast renders with correct variant
- [ ] Toast auto-dismisses after duration
- [ ] Action button triggers callback
- [ ] Multiple toasts stack correctly

---

## Task 2.9: Modal/Dialog System

**File**: `src/components/dialogs/*.tsx`

### Subtasks

- [ ] **2.9.1** Create `ConfirmDialog` component:
  ```typescript
  interface ConfirmDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    description: string
    confirmLabel?: string
    cancelLabel?: string
    variant?: 'default' | 'destructive'
    onConfirm: () => void
  }
  ```
  - Keyboard accessible (Enter to confirm, Escape to cancel)
  - Focus trapped in dialog

- [ ] **2.9.2** Create `NewProjectDialog`:
  - Project name input (auto-focused)
  - Units selector (meters/feet)
  - Create / Cancel buttons
  - Validates name not empty

- [ ] **2.9.3** Create `ProjectSettingsDialog`:
  - Edit project name
  - Change units (with warning about conversion)
  - View created/updated timestamps

- [ ] **2.9.4** Create `ExportDialog`:
  - Format selector (JSON, glTF, PDF)
  - Filename input (auto-generated default)
  - Format-specific options
  - Export / Cancel buttons

- [ ] **2.9.5** Create `ImportDialog`:
  - Drag-and-drop zone
  - File browser button
  - Shows file info after selection
  - Import / Cancel buttons

- [ ] **2.9.6** Create `KeyboardShortcutsDialog`:
  - Categorized list of all shortcuts
  - Searchable

- [ ] **2.9.7** Create `useDialog` hook for managing dialog state:
  ```typescript
  const { openDialog, closeDialog, isOpen } = useDialog('newProject')
  ```

### Unit Tests

- [ ] ConfirmDialog calls onConfirm when confirmed
- [ ] ConfirmDialog calls onOpenChange(false) when cancelled
- [ ] NewProjectDialog validates required fields
- [ ] Dialog traps focus
- [ ] Escape key closes dialog

---

## Task 2.10: Keyboard Shortcuts System

**File**: `src/hooks/useKeyboardShortcuts.ts`, `src/constants/shortcuts.ts`

### Subtasks

- [ ] **2.10.1** Create shortcuts constants map:
  ```typescript
  const SHORTCUTS = {
    NEW_PROJECT: { key: 'n', ctrl: true },
    OPEN_PROJECT: { key: 'o', ctrl: true },
    SAVE: { key: 's', ctrl: true },
    UNDO: { key: 'z', ctrl: true },
    REDO: { key: 'y', ctrl: true },
    DELETE: { key: 'Delete' },
    VIEW_TABLE: { key: '1', ctrl: true },
    VIEW_2D: { key: '2', ctrl: true },
    VIEW_3D: { key: '3', ctrl: true },
    TOGGLE_GRID: { key: 'g' },
    ZOOM_IN: { key: '=' },
    ZOOM_OUT: { key: '-' },
    ESCAPE: { key: 'Escape' },
    // ... etc
  }
  ```

- [ ] **2.10.2** Create `useKeyboardShortcuts` hook:
  - Registers global keydown listener
  - Checks for modifier keys (Ctrl/Cmd, Shift, Alt)
  - Calls registered handlers
  - Prevents default for handled shortcuts
  - Ignores when focus is in input/textarea

- [ ] **2.10.3** Create `KeyboardShortcutProvider` that registers all app shortcuts

- [ ] **2.10.4** Handle Mac vs Windows (Cmd vs Ctrl)

- [ ] **2.10.5** Create `formatShortcut(shortcut)` utility for display:
  - Returns "Ctrl+S" or "⌘S" based on platform

### Unit Tests

- [ ] Shortcuts fire handlers correctly
- [ ] Modifier keys are checked
- [ ] Shortcuts ignored when in input field
- [ ] Mac detection works
- [ ] formatShortcut returns correct string

---

## Integration Tests

**File**: `tests/integration/ui-shell.integration.test.tsx`

### Test Cases

- [ ] **Full layout render**: AppShell renders all sections
- [ ] **Theme switching**: Toggle dark mode → verify class applied → toggle back
- [ ] **Sidebar navigation**: Click room in sidebar → verify selection in store → verify properties panel updates
- [ ] **Menu interaction**: Open File menu → click New Project → verify dialog opens
- [ ] **Keyboard navigation**: Tab through toolbar → verify focus order correct
- [ ] **Toast lifecycle**: Trigger toast → verify visible → wait → verify dismissed

---

## Acceptance Criteria

- [ ] Application shell renders without errors
- [ ] All Shadcn components display correctly
- [ ] Theme toggle persists preference
- [ ] Sidebar collapse/expand works smoothly
- [ ] All menus are keyboard accessible
- [ ] Keyboard shortcuts work globally
- [ ] Toasts display and auto-dismiss
- [ ] Responsive at desktop breakpoints (mobile in Section 15)
- [ ] Unit test coverage > 85%

---

## Files Created

```
src/
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx
│   │   ├── TopToolbar.tsx
│   │   ├── LeftSidebar.tsx
│   │   ├── SidebarSection.tsx
│   │   ├── PropertiesPanel.tsx
│   │   ├── StatusBar.tsx
│   │   ├── ThemeProvider.tsx
│   │   └── ThemeToggle.tsx
│   ├── properties/
│   │   ├── NoSelectionPanel.tsx
│   │   ├── RoomPropertiesPanel.tsx
│   │   ├── WallPropertiesPanel.tsx
│   │   ├── DoorPropertiesPanel.tsx
│   │   ├── WindowPropertiesPanel.tsx
│   │   └── MultiSelectionPanel.tsx
│   ├── dialogs/
│   │   ├── ConfirmDialog.tsx
│   │   ├── NewProjectDialog.tsx
│   │   ├── ProjectSettingsDialog.tsx
│   │   ├── ExportDialog.tsx
│   │   ├── ImportDialog.tsx
│   │   └── KeyboardShortcutsDialog.tsx
│   └── ui/
│       └── Toaster.tsx (+ Shadcn components)
├── hooks/
│   ├── useTheme.ts
│   ├── useToast.ts
│   ├── useKeyboardShortcuts.ts
│   └── useDialog.ts
├── constants/
│   └── shortcuts.ts
└── lib/
    └── utils.ts

tests/
├── unit/
│   └── components/
│       ├── layout/
│       └── dialogs/
└── integration/
    └── ui-shell.integration.test.tsx
```
