# Section 13: Sharing & Collaboration

> **Priority**: Low - Future enhancement after core features.
>
> **Phase**: Phase 5 (post-MVP)
>
> **Dependencies**:
> - Section 01 (data model)
> - Section 05 (3D viewer for shared view)
> - Section 10 (export for file sharing)
>
> **Note**: Full sharing requires optional backend. MVP sharing is file-based only.

---

## Overview

This section implements sharing features for floorplans. MVP focuses on file-based sharing (export and send). Future phases add link-based sharing, comments, and real-time collaboration. Link-based features require an optional backend service.

---

## Task 13.1: File-Based Sharing (MVP)

**File**: `src/components/dialogs/ShareDialog.tsx`

### Subtasks

- [ ] **13.1.1** Create share dialog:
  - Opens from Share button in toolbar
  - Multiple sharing options

- [ ] **13.1.2** Export options:
  - Download JSON (for StrataPlan users)
  - Download glTF (for 3D viewers)
  - Download PDF (for printing/email)

- [ ] **13.1.3** Copy JSON to clipboard:
  - Button: "Copy to Clipboard"
  - Copies JSON representation
  - Toast: "Copied to clipboard"

- [ ] **13.1.4** Email share (client-side):
  - "Email" button
  - Opens mailto: link with subject and body
  - Body includes instructions and note about attachment

- [ ] **13.1.5** Social share buttons:
  - Twitter: Share text + link to StrataPlan app
  - Facebook: Share with preview image
  - LinkedIn: Share with description

### Unit Tests

- [ ] Share dialog opens
- [ ] Export buttons trigger downloads
- [ ] Copy to clipboard works
- [ ] Email link opens mail client

---

## Task 13.2: Share Link Generation (Requires Backend)

**File**: `src/services/sharing/linkSharing.ts`

> **Note**: This task requires an optional backend service. Skip for client-only deployment.

### Subtasks

- [ ] **13.2.1** Create share link service:
  ```typescript
  async function createShareLink(
    floorplan: Floorplan,
    options: ShareOptions
  ): Promise<ShareLink>

  interface ShareOptions {
    permissions: 'view' | 'comment' | 'edit'
    expiry: Date | null
    password?: string
  }

  interface ShareLink {
    id: string
    url: string
    shortCode: string
    expiresAt: Date | null
    hasPassword: boolean
  }
  ```

- [ ] **13.2.2** Backend requirements:
  - POST /api/shares: Create share link
  - GET /api/shares/:code: Get shared floorplan
  - DELETE /api/shares/:code: Revoke share
  - Storage: Redis or database for share data

- [ ] **13.2.3** Expiry options:
  - Never
  - 7 days
  - 30 days
  - Custom date

- [ ] **13.2.4** Password protection:
  - Optional password for share links
  - Password entry on shared view

- [ ] **13.2.5** Usage limits (optional):
  - Limit number of views
  - Limit number of downloads

### Unit Tests

- [ ] Share link generated correctly
- [ ] Expiry calculated correctly
- [ ] Password hash stored (not plaintext)

---

## Task 13.3: Share Link UI

**File**: `src/components/dialogs/ShareLinkDialog.tsx`

### Subtasks

- [ ] **13.3.1** Link generation UI:
  - Generate Link button
  - Shows generated URL
  - Copy button

- [ ] **13.3.2** Link options form:
  - Permission dropdown (View only, View + Comment, Edit)
  - Expiry dropdown
  - Password toggle + input

- [ ] **13.3.3** QR code display:
  - Generate QR code for link
  - Download QR as image

- [ ] **13.3.4** Manage existing links:
  - List of active share links
  - Revoke button for each
  - View count/stats

### Unit Tests

- [ ] UI shows generated link
- [ ] Options affect generated link
- [ ] QR code generates

---

## Task 13.4: Shared View Page

**File**: `src/components/pages/SharedViewPage.tsx`

### Subtasks

- [ ] **13.4.1** Create shared view page:
  - Loads floorplan from share link
  - Minimal UI, focus on viewing
  - No editing tools

- [ ] **13.4.2** Password entry:
  - If share is password-protected
  - Show password form first
  - Validate password with backend

- [ ] **13.4.3** View UI:
  - 3D viewer (primary view)
  - Room list (sidebar, collapsible)
  - Camera controls
  - Fullscreen option

- [ ] **13.4.4** Room info on hover:
  - Hover over room in 3D
  - Show info card: name, dimensions, area

- [ ] **13.4.5** Download options (if permitted):
  - Download as glTF
  - Download screenshot
  - Download PDF

- [ ] **13.4.6** Expired/invalid handling:
  - If link expired: "This link has expired"
  - If link invalid: "Link not found"
  - If password wrong: "Incorrect password"

### Unit Tests

- [ ] Shared view loads floorplan
- [ ] Password prompt shows when required
- [ ] Expired link shows message

---

## Task 13.5: Comment System (Optional)

**File**: `src/services/sharing/comments.ts`, `src/components/viewer/CommentMarker.tsx`

### Subtasks

- [ ] **13.5.1** Comment data model:
  ```typescript
  interface Comment {
    id: string
    shareId: string
    authorName: string
    text: string
    position: { x: number, y: number, z: number }  // 3D position
    roomId?: string
    createdAt: Date
    resolved: boolean
  }
  ```

- [ ] **13.5.2** Create comment service:
  ```typescript
  async function addComment(shareId: string, comment: CreateComment): Promise<Comment>
  async function getComments(shareId: string): Promise<Comment[]>
  async function resolveComment(commentId: string): Promise<void>
  async function deleteComment(commentId: string): Promise<void>
  ```

- [ ] **13.5.3** Comment markers in 3D:
  - Small pin/bubble at comment position
  - Click to expand comment
  - Number badge for multiple comments

- [ ] **13.5.4** Comment panel:
  - List of all comments
  - Click comment → camera moves to position
  - Reply option (threaded)
  - Resolve/delete options

- [ ] **13.5.5** Add comment UI:
  - Click point in 3D → add comment dialog
  - Name input (for anonymous users)
  - Comment text
  - Submit button

### Unit Tests

- [ ] Comments display at correct positions
- [ ] Add comment creates marker
- [ ] Resolve hides/grays comment

---

## Task 13.6: Social Preview / Open Graph

**File**: `src/services/sharing/socialPreview.ts`

### Subtasks

- [ ] **13.6.1** Generate preview image:
  - Thumbnail of floorplan for social sharing
  - Stored with share link

- [ ] **13.6.2** Open Graph meta tags:
  - For shared view pages
  - Title: Project name
  - Description: "X rooms, Y m²"
  - Image: preview thumbnail

- [ ] **13.6.3** Twitter Card tags:
  - Summary card with large image
  - Same content as Open Graph

### Unit Tests

- [ ] Preview image generated
- [ ] Meta tags render correctly

---

## Task 13.7: Collaboration (Future)

**File**: `src/services/sharing/collaboration.ts`

> **Note**: Real-time collaboration is a complex feature for future phases.

### Subtasks

- [ ] **13.7.1** Define collaboration architecture:
  - WebSocket or WebRTC for real-time
  - Operational Transform or CRDTs for conflict resolution
  - Cursor presence

- [ ] **13.7.2** Collaboration features (specification):
  - Real-time cursor positions
  - Real-time edits sync
  - User presence list
  - Conflict resolution

- [ ] **13.7.3** Collaboration UI (specification):
  - User avatars in corner
  - Colored cursors for each user
  - "John is editing Kitchen"

### Unit Tests

- [ ] (Tests defined when feature implemented)

---

## Task 13.8: Share Analytics (Optional)

**File**: `src/services/sharing/analytics.ts`

### Subtasks

- [ ] **13.8.1** Track share views:
  - View count per share link
  - Unique viewers (by IP/fingerprint)
  - View timestamps

- [ ] **13.8.2** Display analytics:
  - In share management UI
  - View count
  - Last viewed date
  - Geographic distribution (optional)

- [ ] **13.8.3** Privacy considerations:
  - Anonymous tracking
  - Option to disable tracking
  - GDPR compliance

### Unit Tests

- [ ] View count increments
- [ ] Analytics display correctly

---

## Integration Tests

**File**: `tests/integration/sharing.integration.test.tsx`

### Test Cases

- [ ] **Export sharing**: Export JSON → Verify downloadable
- [ ] **Copy to clipboard**: Copy → Paste → Verify content
- [ ] **Email share**: Click email → Verify mailto link
- [ ] (Backend-dependent tests for link sharing)

---

## Acceptance Criteria

### MVP (File-Based)

- [ ] Export options available in Share dialog
- [ ] Copy to clipboard works
- [ ] Email share opens mail client
- [ ] Social share buttons work

### Phase 5 (Link-Based, Backend Required)

- [ ] Share links can be generated
- [ ] Links can have permissions/expiry
- [ ] Shared view page works
- [ ] Password protection works
- [ ] Comments can be added and viewed
- [ ] Analytics tracked (if enabled)

---

## Files Created

```
src/
├── services/
│   └── sharing/
│       ├── linkSharing.ts
│       ├── comments.ts
│       ├── socialPreview.ts
│       ├── collaboration.ts
│       └── analytics.ts
├── components/
│   ├── dialogs/
│   │   ├── ShareDialog.tsx
│   │   └── ShareLinkDialog.tsx
│   ├── pages/
│   │   └── SharedViewPage.tsx
│   └── viewer/
│       └── CommentMarker.tsx

tests/
├── unit/
│   └── services/
│       └── sharing/
└── integration/
    └── sharing.integration.test.tsx
```
