# Section 14: Accessibility

> **Priority**: Medium-High - Important for inclusive design.
>
> **Phase**: MVP (basic), ongoing improvements
>
> **Dependencies**:
> - Section 02 (UI components)
> - All interactive sections
>
> **Parallel Work**: Accessibility should be woven into all other sections as they're built.

---

## Overview

This section ensures StrataPlan meets WCAG 2.1 AA compliance for accessibility. Features include full keyboard navigation, screen reader support, high contrast mode, color-blind palettes, and proper focus management.

---

## Task 14.1: Keyboard Navigation

**File**: Updates across all interactive components

### Subtasks

- [ ] **14.1.1** Audit all interactive elements:
  - Buttons, links, inputs
  - Menus and dropdowns
  - Dialogs and modals
  - Custom controls

- [ ] **14.1.2** Ensure Tab navigation:
  - All focusable elements reachable via Tab
  - Logical tab order (left-to-right, top-to-bottom)
  - No keyboard traps
  - Skip links for main content

- [ ] **14.1.3** Implement arrow key navigation:
  - Menu items: Up/Down arrows
  - Table cells: Arrow keys
  - Slider controls: Left/Right arrows
  - Radio groups: Arrow keys

- [ ] **14.1.4** Implement Enter/Space activation:
  - Buttons: Enter or Space
  - Links: Enter
  - Checkboxes: Space
  - Menus: Enter to select

- [ ] **14.1.5** Implement Escape to close:
  - All dialogs close on Escape
  - Dropdowns close on Escape
  - Return focus to trigger element

- [ ] **14.1.6** Custom keyboard shortcuts:
  - All shortcuts documented
  - Shortcuts dialog (Ctrl+/)
  - No conflicts with screen reader shortcuts

- [ ] **14.1.7** Focus visible indicators:
  - Clear focus outline on all elements
  - Minimum 2px outline
  - High contrast against background

### Unit Tests

- [ ] Tab moves through elements in order
- [ ] Enter activates focused button
- [ ] Escape closes modal
- [ ] Focus visible on all interactive elements

---

## Task 14.2: Screen Reader Support

**File**: Updates across all components

### Subtasks

- [ ] **14.2.1** Semantic HTML structure:
  - Use proper heading hierarchy (h1, h2, h3)
  - Use landmark elements (header, main, nav, aside)
  - Use lists for list content
  - Use tables for tabular data

- [ ] **14.2.2** ARIA labels:
  - `aria-label` for icon-only buttons
  - `aria-labelledby` for complex controls
  - `aria-describedby` for additional context
  - `aria-hidden` for decorative elements

- [ ] **14.2.3** ARIA roles:
  - `role="button"` for custom buttons
  - `role="dialog"` for modals
  - `role="menu"` and `role="menuitem"` for menus
  - `role="tablist"`, `role="tab"`, `role="tabpanel"` for tabs

- [ ] **14.2.4** ARIA states:
  - `aria-expanded` for collapsibles
  - `aria-selected` for selected items
  - `aria-checked` for checkboxes
  - `aria-disabled` for disabled elements
  - `aria-busy` for loading states

- [ ] **14.2.5** Live regions:
  - `aria-live="polite"` for status updates
  - `aria-live="assertive"` for errors
  - Toast notifications announced
  - Form validation errors announced

- [ ] **14.2.6** Form accessibility:
  - All inputs have associated labels
  - Error messages linked with `aria-describedby`
  - Required fields marked with `aria-required`
  - Invalid fields marked with `aria-invalid`

- [ ] **14.2.7** Image alternatives:
  - `alt` text for informative images
  - Empty `alt=""` for decorative images
  - Complex images have long descriptions

### Unit Tests

- [ ] Buttons have accessible names
- [ ] Form inputs have labels
- [ ] Live regions announce updates
- [ ] ARIA states update correctly

---

## Task 14.3: Focus Management

**File**: `src/hooks/useFocusManagement.ts`

### Subtasks

- [ ] **14.3.1** Modal focus trap:
  ```typescript
  function useFocusTrap(containerRef: RefObject<HTMLElement>): void
  ```
  - Focus stays within modal when open
  - Tab cycles through modal elements
  - Focus returns to trigger on close

- [ ] **14.3.2** Focus restoration:
  - After modal closes, focus returns to trigger
  - After dropdown closes, focus returns to button
  - After delete, focus moves to next item

- [ ] **14.3.3** Initial focus:
  - Dialogs focus first focusable element
  - Or focus element with `autoFocus`
  - Or focus close button

- [ ] **14.3.4** Skip links:
  - "Skip to main content" link
  - Visible on focus
  - Jumps past navigation

- [ ] **14.3.5** Focus on route change:
  - Announce page changes
  - Focus main heading or content

### Unit Tests

- [ ] Focus trapped in modal
- [ ] Focus restored after modal close
- [ ] Skip link jumps to content

---

## Task 14.4: Color and Contrast

**File**: `src/styles/`, `tailwind.config.js`

### Subtasks

- [ ] **14.4.1** Audit color contrast:
  - Text: minimum 4.5:1 ratio (AA)
  - Large text: minimum 3:1 ratio
  - UI components: minimum 3:1 ratio
  - Use tool: WebAIM Contrast Checker

- [ ] **14.4.2** Fix contrast issues:
  - Increase text darkness
  - Add backgrounds for visibility
  - Ensure focus indicators visible

- [ ] **14.4.3** Non-color indicators:
  - Don't rely on color alone
  - Add icons or patterns
  - Error: icon + red color
  - Room types: pattern + color

- [ ] **14.4.4** High contrast mode:
  ```typescript
  // In uiStore
  highContrastMode: boolean
  ```
  - Toggle in accessibility settings
  - Increases all contrast
  - Adds borders to elements

### Unit Tests

- [ ] All text meets contrast ratio
- [ ] Color-only indicators have alternatives

---

## Task 14.5: Color-Blind Support

**File**: `src/constants/colorBlindPalettes.ts`, `src/hooks/useColorBlindMode.ts`

### Subtasks

- [ ] **14.5.1** Create color-blind palettes:
  ```typescript
  const COLOR_BLIND_PALETTES = {
    deuteranopia: { bedroom: '#...', kitchen: '#...', ... },
    protanopia: { bedroom: '#...', kitchen: '#...', ... },
    tritanopia: { bedroom: '#...', kitchen: '#...', ... },
  }
  ```

- [ ] **14.5.2** Color-blind mode toggle:
  - Setting in accessibility preferences
  - Options: Normal, Deuteranopia, Protanopia, Tritanopia

- [ ] **14.5.3** Apply palette:
  - Room type colors use selected palette
  - Update 2D and 3D views
  - Update UI elements

- [ ] **14.5.4** Test with simulators:
  - Use color blindness simulators
  - Verify distinguishability
  - Verify no information lost

### Unit Tests

- [ ] Palette changes colors
- [ ] All room types distinguishable

---

## Task 14.6: Motion and Animation

**File**: `src/hooks/useReducedMotion.ts`

### Subtasks

- [ ] **14.6.1** Respect prefers-reduced-motion:
  ```typescript
  function useReducedMotion(): boolean {
    const [reduced, setReduced] = useState(false)
    useEffect(() => {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
      setReduced(mq.matches)
      mq.addEventListener('change', (e) => setReduced(e.matches))
    }, [])
    return reduced
  }
  ```

- [ ] **14.6.2** Apply reduced motion:
  - Disable animations when preferred
  - Use instant transitions
  - Keep functionality without animation

- [ ] **14.6.3** Animation toggle in settings:
  - Manual override option
  - "Reduce motion" checkbox

- [ ] **14.6.4** Safe animations:
  - No flashing content
  - No auto-playing animations
  - User-initiated animations OK

### Unit Tests

- [ ] Motion preference detected
- [ ] Animations disabled when preferred

---

## Task 14.7: Text and Typography

**File**: `src/styles/typography.css`

### Subtasks

- [ ] **14.7.1** Minimum text size:
  - Body text: minimum 16px
  - Small text: minimum 12px
  - All text readable

- [ ] **14.7.2** Scalable text:
  - Use relative units (rem, em)
  - Support browser zoom to 200%
  - No horizontal scroll on zoom

- [ ] **14.7.3** Line height and spacing:
  - Line height: minimum 1.5
  - Paragraph spacing: minimum 1.5em
  - Letter spacing: adjustable

- [ ] **14.7.4** Font settings:
  - Sans-serif for UI
  - Monospace for code/numbers
  - Dyslexia-friendly font option (future)

### Unit Tests

- [ ] Text scales with zoom
- [ ] No overflow at 200% zoom

---

## Task 14.8: Alternative Input Methods

**File**: Updates to interaction handlers

### Subtasks

- [ ] **14.8.1** Touch accessibility:
  - Minimum touch target: 44×44px
  - Adequate spacing between targets
  - Touch actions have alternatives

- [ ] **14.8.2** Voice control compatibility:
  - All buttons have visible labels
  - Labels match accessible names
  - No reliance on hover-only

- [ ] **14.8.3** Switch control support:
  - Sequential focus navigation
  - Clear focus indicators
  - Single-action activation

### Unit Tests

- [ ] Touch targets meet minimum size
- [ ] All actions available via keyboard

---

## Task 14.9: Accessibility Settings Panel

**File**: `src/components/dialogs/AccessibilitySettingsDialog.tsx`

### Subtasks

- [ ] **14.9.1** Create settings panel:
  - Accessible from Settings menu
  - Groups related options

- [ ] **14.9.2** Settings options:
  - High contrast mode toggle
  - Color-blind palette selector
  - Reduce motion toggle
  - Focus indicator style
  - Text size adjustment
  - Animation speed

- [ ] **14.9.3** Apply settings:
  - Settings apply immediately
  - Persist to localStorage
  - Load on app start

- [ ] **14.9.4** Reset to defaults:
  - "Reset to defaults" button
  - Confirmation dialog

### Unit Tests

- [ ] Settings save correctly
- [ ] Settings apply to UI
- [ ] Reset restores defaults

---

## Task 14.10: Accessibility Testing

**File**: `tests/accessibility/`

### Subtasks

- [ ] **14.10.1** Set up automated testing:
  ```bash
  npm install --save-dev jest-axe @axe-core/react
  ```

- [ ] **14.10.2** Create axe integration:
  ```typescript
  import { axe, toHaveNoViolations } from 'jest-axe'
  expect.extend(toHaveNoViolations)

  test('should have no accessibility violations', async () => {
    const { container } = render(<MyComponent />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
  ```

- [ ] **14.10.3** Test all major components:
  - Landing page
  - Editor view
  - All dialogs
  - Room table
  - Properties panel

- [ ] **14.10.4** Manual testing checklist:
  - Test with screen reader (NVDA, VoiceOver)
  - Test keyboard-only navigation
  - Test at 200% zoom
  - Test with color blindness simulator
  - Test with reduced motion

### Unit Tests (using jest-axe)

- [ ] LandingPage has no violations
- [ ] RoomTable has no violations
- [ ] All dialogs have no violations
- [ ] PropertiesPanel has no violations

---

## Integration Tests

**File**: `tests/integration/accessibility.integration.test.tsx`

### Test Cases

- [ ] **Full keyboard flow**: Navigate entire app using only keyboard
- [ ] **Screen reader flow**: Verify all content announced correctly
- [ ] **Focus management**: Open modal → close → verify focus returned
- [ ] **Color mode switch**: Enable high contrast → verify applied
- [ ] **Zoom test**: Zoom to 200% → verify no content cut off

---

## Acceptance Criteria

- [ ] All interactive elements keyboard accessible
- [ ] Full screen reader support with ARIA
- [ ] Color contrast meets WCAG AA (4.5:1)
- [ ] Color-blind palettes available
- [ ] Reduced motion respected
- [ ] Focus visible on all elements
- [ ] Text scalable to 200%
- [ ] Touch targets 44×44px minimum
- [ ] Accessibility settings panel available
- [ ] Automated accessibility tests pass
- [ ] Manual testing completed with screen reader

---

## Files Created

```
src/
├── hooks/
│   ├── useFocusManagement.ts
│   ├── useReducedMotion.ts
│   └── useColorBlindMode.ts
├── constants/
│   └── colorBlindPalettes.ts
├── components/
│   └── dialogs/
│       └── AccessibilitySettingsDialog.tsx
└── styles/
    └── accessibility.css

tests/
├── accessibility/
│   ├── axe-setup.ts
│   └── components.a11y.test.tsx
└── integration/
    └── accessibility.integration.test.tsx
```

---

## Resources

- WCAG 2.1 Guidelines: https://www.w3.org/WAI/WCAG21/quickref/
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- Color-Blind Simulator: https://www.color-blindness.com/coblis-color-blindness-simulator/
- Axe Accessibility Testing: https://www.deque.com/axe/
