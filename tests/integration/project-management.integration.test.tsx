import React from 'react';
import { render, screen, fireEvent, waitFor, within, act } from '@testing-library/react';
import App from '../../src/App';
import 'fake-indexeddb/auto';
import { initDatabase } from '../../src/services/storage/database';
import { useFloorplanStore } from '../../src/stores/floorplanStore';
import { useNavigation } from '../../src/hooks/useNavigation';

// We need to ensure we start in a clean state.
// Since stores are global, we should reset them.

describe('Project Management Integration', () => {
  beforeEach(async () => {
    // Clear DB
    const database = await initDatabase();
    await database.clear('projects');
    localStorage.clear();

    // Reset stores
    act(() => {
      useFloorplanStore.setState({ currentFloorplan: null });
    });

    // We cannot easily reset the hook state of useNavigation directly if it's not exported.
    // But we can rely on the fact that if we render a fresh App, and the floorplanStore is empty,
    // we might trigger the auto-create effect.
    // However, App.tsx effect says:
    // useEffect(() => { if (!currentFloorplan) createFloorplan(...) }, ...)
    // This creates a project immediately on mount.

    // This makes it hard to test the Landing Page because the app auto-navigates to editor.
    // We should modify App.tsx to NOT auto-create project if we want a landing page flow.
    // OR we should accept that the app starts in editor for a "Quick Start",
    // but navigating to Home/Landing is possible.

    // Let's modify the test to expect Editor first, then navigate to Landing if we want to test Landing.
  });

  it('allows creating a new project from landing page', async () => {
    // We override the useFloorplanStore state to ensure it starts empty,
    // AND we need to prevent the App's auto-creation effect if possible,
    // OR just verify the landing page if the App stays there.

    // Actually, looking at the previous failure output, the DOM contained "Create New Floorplan",
    // which means we ARE on the Landing Page!
    // The previous test failed because it looked for 'top-toolbar' (Editor element) but found Landing Page elements.
    // This means my assumption that App auto-creates was wrong or `currentFloorplan` was null but the effect didn't run/finish yet?
    // OR useNavigation initializes 'landing' and that takes precedence in rendering.

    // Let's re-verify the Landing Page flow since we are actually on it.

    render(<App />);

    // Wait for landing page
    await waitFor(() => expect(screen.getByText('Create New Floorplan')).toBeInTheDocument());

    // Click Create
    fireEvent.click(screen.getByText('Create New Floorplan'));

    // Dialog opens
    const dialog = await screen.findByRole('dialog');
    expect(screen.getByText('Create New Project')).toBeInTheDocument();

    // Fill form
    const nameInput = within(dialog).getByLabelText('Name');
    fireEvent.change(nameInput, { target: { value: 'Integration Project' } });

    const submitBtn = within(dialog).getByText('Create Project');
    fireEvent.click(submitBtn);

    // Now we expect navigation to Editor
    await waitFor(() => expect(screen.getByTestId('top-toolbar')).toBeInTheDocument());

    // Verify project name in toolbar (if it displays it) or just existence of editor
    // We expect the canvas-2d container or top-toolbar which we already checked
    expect(screen.getByTestId('top-toolbar')).toBeInTheDocument();
  });
});
