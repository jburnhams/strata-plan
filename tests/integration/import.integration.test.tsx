import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
// import { ImportDialog } from '../../src/components/dialogs/ImportDialog'; // Use DialogProvider instead
import { DialogProvider } from '../../src/components/dialogs/DialogProvider';
import { useDialogStore } from '../../src/stores/dialogStore';
import { useFloorplanStore } from '../../src/stores/floorplanStore';
import { useProject } from '../../src/hooks/useProject';
import { importFloorplan } from '../../src/services/import';
import { readFileAsText } from '../../src/services/import/fileReader';
import * as HistoryService from '../../src/services/import/history';
import { useToast } from '../../src/hooks/use-toast';
import { DIALOG_IMPORT } from '../../src/constants/dialogs';
import * as ProjectStorage from '../../src/services/storage/projectStorage';
import 'fake-indexeddb/auto'; // Enable fake IndexedDB

// Mock dependencies
jest.mock('../../src/hooks/useProject');
jest.mock('../../src/hooks/use-toast');
jest.mock('../../src/services/import/history');
jest.mock('../../src/services/import/fileReader');
jest.mock('../../src/services/storage/thumbnails', () => ({
  generateThumbnail: jest.fn().mockResolvedValue('data:image/png;base64,mock'),
}));

// Mock dialog component parts to avoid complexity with Radix UI
jest.mock('../../src/components/ui/dialog', () => ({
  Dialog: ({ children, open }: any) => (open ? <div data-testid="dialog">{children}</div> : null),
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <div>{children}</div>,
  DialogDescription: ({ children }: any) => <div>{children}</div>,
  DialogFooter: ({ children }: any) => <div>{children}</div>,
}));

// Mock Tabs
jest.mock('../../src/components/ui/tabs', () => ({
  Tabs: ({ children, defaultValue }: any) => <div data-testid="tabs" data-default={defaultValue}>{children}</div>,
  TabsList: ({ children }: any) => <div role="tablist">{children}</div>,
  TabsTrigger: ({ children, value, onClick }: any) => (
    <button role="tab" data-value={value} onClick={onClick}>
      {children}
    </button>
  ),
  TabsContent: ({ children, value }: any) => <div role="tabpanel" data-value={value}>{children}</div>,
}));

// Mock Lucide icons - use spans to avoid nesting divs in p tags
jest.mock('lucide-react', () => ({
  Upload: () => <span data-testid="icon-upload" />,
  FileJson: () => <span data-testid="icon-file-json" />,
  AlertTriangle: () => <span data-testid="icon-alert" />,
  AlertCircle: () => <span data-testid="icon-alert-circle" />,
  Check: () => <span data-testid="icon-check" />,
  Loader2: () => <span data-testid="icon-loader" />,
  X: () => <span data-testid="icon-close" />,
  Clock: () => <span data-testid="icon-clock" />,
  Layout: () => <span data-testid="icon-layout" />,
}));

describe('Import Integration', () => {
  const mockToast = jest.fn();
  let saveProjectSpy: jest.SpyInstance;

  beforeAll(() => {
    if (!global.structuredClone) {
        global.structuredClone = (val) => JSON.parse(JSON.stringify(val));
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset stores
    useDialogStore.setState({ activeDialog: DIALOG_IMPORT });
    useFloorplanStore.setState({ currentFloorplan: null });

    (useProject as jest.Mock).mockReturnValue({
      saveProject: jest.fn(), // Not used by ImportDialog anymore
    });

    (useToast as jest.Mock).mockReturnValue({
      toast: mockToast,
    });

    // Spy on the real saveProject
    saveProjectSpy = jest.spyOn(ProjectStorage, 'saveProject');

    (HistoryService.getImportHistory as jest.Mock).mockResolvedValue([]);
    (HistoryService.addToImportHistory as jest.Mock).mockResolvedValue(undefined);
    (readFileAsText as jest.Mock).mockReset();
  });

  it('should import a valid JSON file successfully', async () => {
    const validFloorplan = {
      id: 'fp-1',
      name: 'Test Plan',
      units: 'meters',
      rooms: [
        {
          id: 'room-1',
          name: 'Living',
          type: 'living',
          length: 5, width: 4, height: 2.4,
          position: { x: 0, z: 0 },
          doors: [],
          windows: []
        }
      ],
      connections: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    render(<DialogProvider />);

    // Create a file
    const fileContent = JSON.stringify(validFloorplan);
    const file = new File([fileContent], 'test.json', { type: 'application/json' });

    // Mock reading file
    (readFileAsText as jest.Mock).mockImplementation((f) => {
        return Promise.resolve(fileContent);
    });

    // Find input and simulate upload
    const input = screen.getByLabelText(/Upload file drop zone/i).querySelector('input') as HTMLInputElement;

    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } });
    });

    // Verify file is selected
    await waitFor(() => {
      expect(screen.getByText('test.json')).toBeInTheDocument();
    });

    // Click import
    const importButton = screen.getByRole('button', { name: /^Import Project$/i });

    await act(async () => {
      fireEvent.click(importButton);
    });

    // Wait for completion (toast or history)
    await waitFor(() => {
        if (screen.queryByText('Validation Errors')) {
            screen.debug();
        }
        // Wait until success toast appears
        expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
            title: 'Import Successful'
        }));
    }, { timeout: 3000 });

    expect(saveProjectSpy).toHaveBeenCalled();

    // Verify store updated
    const state = useFloorplanStore.getState();
    expect(state.currentFloorplan?.id).toBe('fp-1');
    expect(state.currentFloorplan?.rooms).toHaveLength(1);

    // Verify history updated
    expect(HistoryService.addToImportHistory).toHaveBeenCalledWith('test.json', expect.any(Number));

    // Verify dialog closed
    expect(useDialogStore.getState().activeDialog).toBeNull();
  });

  it('should show validation errors for invalid file', async () => {
    render(<DialogProvider />);

    // Create invalid file
    const invalidData = { name: 'Invalid' }; // Missing required fields
    const invalidContent = JSON.stringify(invalidData);
    const file = new File([invalidContent], 'invalid.json', { type: 'application/json' });

    // Mock reading file
    (readFileAsText as jest.Mock).mockReset();
    (readFileAsText as jest.Mock).mockResolvedValue(invalidContent);

    const input = screen.getByLabelText(/Upload file drop zone/i).querySelector('input') as HTMLInputElement;

    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } });
    });

    const importButton = screen.getByRole('button', { name: /^Import Project$/i });

    await act(async () => {
      fireEvent.click(importButton);
    });

    // Should verify error shown
    await waitFor(() => {
      expect(screen.getByText('Validation Errors')).toBeInTheDocument();
    });

    // Check for the specific error
    await waitFor(() => {
       const listItems = screen.getAllByRole('listitem');
       expect(listItems.length).toBeGreaterThan(0);
       // Check if it contains the expected error OR 'Invalid JSON'
       expect(listItems[0].textContent).toMatch(/Missing|Invalid/);
    });

    // Verify NOT saved
    expect(saveProjectSpy).not.toHaveBeenCalled();
    expect(useDialogStore.getState().activeDialog).toBe(DIALOG_IMPORT); // Still open
  });
});
