# Section 12: Project Management

> **Priority**: High - Essential for managing multiple projects.
>
> **Phase**: MVP (Phase 1)
>
> **Dependencies**:
> - Section 01 (data model)
> - Section 02 (UI shell for project list view)
> - Section 09 (storage for project persistence)
>
> **Parallel Work**: Can run in parallel with editor sections.

---

## Overview

This section provides the UI and logic for managing multiple floorplan projects: creating, listing, opening, renaming, duplicating, and deleting projects. Includes the landing page and project dashboard.

---

## Task 12.1: Landing Page

**File**: `src/components/pages/LandingPage.tsx`

### Subtasks

- [ ] **12.1.1** Create landing page component:
  - Displays when no project is open
  - Clean, welcoming design
  - Clear call-to-action

- [ ] **12.1.2** Design layout:
  ```
  ┌─────────────────────────────────────────────────────┐
  │                   [StrataPlan Logo]                 │
  │                                                     │
  │     Create professional 3D floorplans               │
  │     by entering room measurements                   │
  │                                                     │
  │     ┌─────────────────────────────────────────┐    │
  │     │      [ Create New Floorplan ]           │    │
  │     └─────────────────────────────────────────┘    │
  │                                                     │
  │     [ Try Demo ]    [ Import File ]                │
  │                                                     │
  │     ─────────────────────────────────────────      │
  │                                                     │
  │     Recent Projects:                               │
  │     ┌─────┐  ┌─────┐  ┌─────┐                     │
  │     │     │  │     │  │     │                     │
  │     └─────┘  └─────┘  └─────┘                     │
  │     My House  Office   Studio                      │
  │                                                     │
  │                          [Theme Toggle] [?]        │
  └─────────────────────────────────────────────────────┘
  ```

- [ ] **12.1.3** Create New Floorplan button:
  - Large, prominent primary button
  - Opens NewProjectDialog on click

- [ ] **12.1.4** Try Demo button:
  - Loads sample project
  - Opens directly into editor

- [ ] **12.1.5** Import File button:
  - Opens ImportDialog
  - Accepts JSON/glTF files

- [ ] **12.1.6** Recent projects section:
  - Shows last 5 opened projects
  - Thumbnail + name + date
  - Click to open project
  - Empty state: "No recent projects"

- [ ] **12.1.7** Footer actions:
  - Theme toggle
  - Help button → opens docs/shortcuts

### Unit Tests

- [ ] Landing page renders correctly
- [ ] Create button opens dialog
- [ ] Try Demo loads sample project
- [ ] Recent projects display correctly

---

## Task 12.2: New Project Dialog

**File**: `src/components/dialogs/NewProjectDialog.tsx`

### Subtasks

- [ ] **12.2.1** Create dialog component:
  - Modal dialog
  - Form with project settings
  - Create / Cancel buttons

- [ ] **12.2.2** Project name input:
  - Auto-focused on open
  - Default: "My Floorplan" or "Project N"
  - Max length: 100 characters
  - Validation: required, non-empty

- [ ] **12.2.3** Measurement units selector:
  - Radio buttons: Meters / Feet
  - Default: Meters
  - Shows example: "5 m" or "16 ft"

- [ ] **12.2.4** Template selector (optional):
  - Dropdown: Blank, Studio, 2-Bedroom, Office
  - Preview thumbnail
  - Default: Blank

- [ ] **12.2.5** Create button:
  - Validates form
  - Creates new project in store
  - Navigates to editor view
  - Closes dialog

- [ ] **12.2.6** Keyboard handling:
  - Enter: Submit form
  - Escape: Close dialog

### Unit Tests

- [ ] Dialog opens and closes
- [ ] Form validation works
- [ ] Create button creates project
- [ ] Template selection works

---

## Task 12.3: Project Dashboard / List View

**File**: `src/components/pages/ProjectListPage.tsx`

### Subtasks

- [ ] **12.3.1** Create project list page:
  - Accessed via File → Recent Projects or home icon
  - Grid of project cards
  - Search and sort options

- [ ] **12.3.2** Design layout:
  ```
  ┌─────────────────────────────────────────────────────┐
  │  ← Back    All Projects           [Search] [Sort ▼] │
  ├─────────────────────────────────────────────────────┤
  │                                                     │
  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌───────┐ │
  │  │ Thumb   │  │ Thumb   │  │ Thumb   │  │   +   │ │
  │  │         │  │         │  │         │  │  New  │ │
  │  ├─────────┤  ├─────────┤  ├─────────┤  │Project│ │
  │  │ My House│  │ Office  │  │ Studio  │  │       │ │
  │  │ 5 rooms │  │ 3 rooms │  │ 1 room  │  └───────┘ │
  │  │ 120 m²  │  │ 85 m²   │  │ 45 m²   │            │
  │  │ 2d ago  │  │ 1w ago  │  │ 3w ago  │            │
  │  └─────────┘  └─────────┘  └─────────┘            │
  │                                                     │
  └─────────────────────────────────────────────────────┘
  ```

- [ ] **12.3.3** Project card component:
  ```typescript
  interface ProjectCardProps {
    project: ProjectMetadata
    onOpen: () => void
    onRename: () => void
    onDuplicate: () => void
    onDelete: () => void
    onExport: () => void
  }
  ```

- [ ] **12.3.4** Card contents:
  - Thumbnail (or placeholder icon)
  - Project name (truncated if long)
  - Room count
  - Total area
  - Last modified (relative time: "2 days ago")

- [ ] **12.3.5** Card interactions:
  - Click: Open project
  - Right-click: Context menu
  - Hover: Show quick actions

- [ ] **12.3.6** Context menu:
  - Open
  - Rename
  - Duplicate
  - Export → (JSON, glTF, PDF)
  - Delete

- [ ] **12.3.7** "New Project" card:
  - Last card in grid
  - Plus icon
  - Opens NewProjectDialog

### Unit Tests

- [ ] Project list loads and displays projects
- [ ] Card click opens project
- [ ] Context menu shows on right-click
- [ ] Empty state shown when no projects

---

## Task 12.4: Search and Sort

**File**: `src/components/projects/ProjectFilters.tsx`, `src/hooks/useProjectFilters.ts`

### Subtasks

- [ ] **12.4.1** Search input:
  - Filter projects by name
  - Debounced (300ms)
  - Clear button

- [ ] **12.4.2** Sort dropdown:
  - Options:
    - Newest first (default)
    - Oldest first
    - Name (A-Z)
    - Name (Z-A)
    - Largest (area)
    - Smallest (area)

- [ ] **12.4.3** Create filter hook:
  ```typescript
  function useProjectFilters(projects: ProjectMetadata[]): {
    filteredProjects: ProjectMetadata[]
    searchQuery: string
    setSearchQuery: (query: string) => void
    sortBy: SortOption
    setSortBy: (option: SortOption) => void
  }
  ```

- [ ] **12.4.4** Persist filter preferences:
  - Remember sort preference
  - Clear search on page leave

### Unit Tests

- [ ] Search filters by name
- [ ] Sort orders correctly
- [ ] Combined filter and sort works

---

## Task 12.5: Project Rename

**File**: `src/components/dialogs/RenameProjectDialog.tsx`

### Subtasks

- [ ] **12.5.1** Create rename dialog:
  - Input with current name
  - Save / Cancel buttons

- [ ] **12.5.2** Inline rename option:
  - Double-click project name in card
  - Inline text input
  - Enter to save, Escape to cancel

- [ ] **12.5.3** Rename action:
  ```typescript
  async function renameProject(id: string, newName: string): Promise<void>
  ```
  - Update in storage
  - Update in store
  - Toast: "Project renamed"

- [ ] **12.5.4** Validation:
  - Name required
  - Max length 100 characters

### Unit Tests

- [ ] Rename dialog works
- [ ] Inline rename works
- [ ] Validation prevents empty name

---

## Task 12.6: Project Duplicate

**File**: `src/services/storage/projectOperations.ts`

### Subtasks

- [ ] **12.6.1** Duplicate action:
  ```typescript
  async function duplicateProject(id: string): Promise<string>
  ```
  - Load project
  - Generate new ID
  - Append " (copy)" to name
  - Save new project
  - Return new project ID

- [ ] **12.6.2** UI trigger:
  - Context menu: "Duplicate"
  - Keyboard: Ctrl+D when project selected

- [ ] **12.6.3** Feedback:
  - Toast: "Project duplicated"
  - New project appears in list
  - Option to open immediately

### Unit Tests

- [ ] Duplicate creates new project
- [ ] New project has new ID
- [ ] Name has "(copy)" suffix
- [ ] Original unchanged

---

## Task 12.7: Project Delete

**File**: `src/components/dialogs/DeleteProjectDialog.tsx`

### Subtasks

- [ ] **12.7.1** Create delete confirmation dialog:
  - Warning message: "Delete 'Project Name'?"
  - Description: "This cannot be undone"
  - Delete / Cancel buttons
  - Delete button is red (destructive)

- [ ] **12.7.2** Delete action:
  ```typescript
  async function deleteProject(id: string): Promise<void>
  ```
  - Remove from storage
  - Remove from recent projects
  - Update project list

- [ ] **12.7.3** Handle current project:
  - If deleting currently open project
  - Show warning: "You're about to delete the open project"
  - After delete, return to landing page

- [ ] **12.7.4** Feedback:
  - Toast: "Project deleted"
  - Remove from list with animation

### Unit Tests

- [ ] Delete removes from storage
- [ ] Confirmation required
- [ ] Current project handled correctly

---

## Task 12.8: Project Settings Dialog

**File**: `src/components/dialogs/ProjectSettingsDialog.tsx`

### Subtasks

- [ ] **12.8.1** Create settings dialog:
  - Accessed via File → Project Settings
  - Edit project properties

- [ ] **12.8.2** Editable settings:
  - Project name
  - Measurement units (with conversion warning)

- [ ] **12.8.3** Read-only info:
  - Created date
  - Last modified date
  - Room count
  - Total area
  - Storage size

- [ ] **12.8.4** Unit conversion:
  - If changing units, offer to convert values
  - "Convert dimensions to feet?" / "Keep numeric values"

- [ ] **12.8.5** Save button:
  - Updates project metadata
  - Toast: "Settings saved"

### Unit Tests

- [ ] Settings dialog displays correct values
- [ ] Name change saves
- [ ] Unit change prompts for conversion

---

## Task 12.9: Navigation and Routing

**File**: `src/App.tsx`, `src/hooks/useNavigation.ts`

### Subtasks

- [ ] **12.9.1** Define app routes/states:
  ```typescript
  type AppView = 'landing' | 'projectList' | 'editor'
  ```
  - No URL routing (SPA without router)
  - State-based navigation

- [ ] **12.9.2** Create navigation hook:
  ```typescript
  function useNavigation(): {
    currentView: AppView
    navigateTo: (view: AppView) => void
    openProject: (id: string) => void
    createProject: (name: string, units: MeasurementUnit) => void
    closeProject: () => void
  }
  ```

- [ ] **12.9.3** Navigation triggers:
  - Landing → Editor: Create/Open project
  - Editor → Landing: Close project
  - Any → ProjectList: File → Recent Projects

- [ ] **12.9.4** Unsaved changes handling:
  - If navigating away with unsaved changes
  - Show confirmation dialog
  - Save / Don't Save / Cancel

- [ ] **12.9.5** Browser back button:
  - Handle browser back/forward
  - Confirm if unsaved changes

### Unit Tests

- [ ] Navigation changes view
- [ ] Unsaved changes prompt appears
- [ ] openProject loads correct project

---

## Task 12.10: Recent Projects

**File**: `src/services/storage/recentProjects.ts`

### Subtasks

- [ ] **12.10.1** Track recent projects:
  ```typescript
  async function addToRecentProjects(id: string): Promise<void>
  async function getRecentProjects(): Promise<ProjectMetadata[]>
  async function removeFromRecentProjects(id: string): Promise<void>
  ```

- [ ] **12.10.2** Recent projects rules:
  - Maximum 10 projects
  - Most recently opened first
  - Opening project moves to top
  - Deleted projects removed automatically

- [ ] **12.10.3** Display in File menu:
  - Recent Projects submenu
  - Shows last 5-10 projects
  - "Clear Recent" option

- [ ] **12.10.4** Display on landing page:
  - Recent projects section
  - Shows last 5 projects

### Unit Tests

- [ ] Recent projects tracked correctly
- [ ] Order updated on open
- [ ] Maximum limit enforced
- [ ] Deleted projects removed

---

## Integration Tests

**File**: `tests/integration/project-management.integration.test.tsx`

### Test Cases

- [ ] **Create flow**: Open app → Create project → Verify in editor
- [ ] **Open flow**: Create project → Close → Open from list → Verify loaded
- [ ] **Rename flow**: Create → Rename → Verify name updated
- [ ] **Duplicate flow**: Create → Duplicate → Verify two projects
- [ ] **Delete flow**: Create → Delete → Verify removed from list
- [ ] **Recent projects**: Open 3 projects → Verify recent order correct

---

## Acceptance Criteria

- [ ] Landing page displays on app start
- [ ] Create New Floorplan opens dialog and creates project
- [ ] Project list shows all saved projects
- [ ] Search filters projects by name
- [ ] Sort orders projects correctly
- [ ] Rename updates project name
- [ ] Duplicate creates copy
- [ ] Delete removes project with confirmation
- [ ] Recent projects tracked and displayed
- [ ] Unsaved changes prompt prevents data loss
- [ ] Unit test coverage > 85%

---

## Files Created

```
src/
├── components/
│   ├── pages/
│   │   ├── LandingPage.tsx
│   │   └── ProjectListPage.tsx
│   ├── projects/
│   │   ├── ProjectCard.tsx
│   │   └── ProjectFilters.tsx
│   └── dialogs/
│       ├── NewProjectDialog.tsx
│       ├── RenameProjectDialog.tsx
│       ├── DeleteProjectDialog.tsx
│       └── ProjectSettingsDialog.tsx
├── hooks/
│   ├── useNavigation.ts
│   └── useProjectFilters.ts
└── services/
    └── storage/
        ├── projectOperations.ts
        └── recentProjects.ts

tests/
├── unit/
│   └── components/
│       ├── pages/
│       └── projects/
└── integration/
    └── project-management.integration.test.tsx
```
