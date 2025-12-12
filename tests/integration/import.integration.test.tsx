import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ImportDialog } from '../../src/components/dialogs/ImportDialog';
import { useDialogStore } from '../../src/stores/dialogStore';
import { useFloorplanStore } from '../../src/stores/floorplanStore';
import { useProject } from '../../src/hooks/useProject';
import { importFloorplan } from '../../src/services/import';
import { readFileAsText } from '../../src/services/import/fileReader';
import * as HistoryService from '../../src/services/import/history';
import { useToast } from '../../src/hooks/use-toast';

// Mock dependencies
jest.mock('../../src/hooks/useProject');
jest.mock('../../src/hooks/use-toast');
jest.mock('../../src/services/import/history');
jest.mock('../../src/services/import/fileReader');

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
  const mockSaveProject = jest.fn();
  const mockToast = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset stores
    useDialogStore.setState({ activeDialog: 'import-project' });
    useFloorplanStore.setState({ currentFloorplan: null });

    (useProject as jest.Mock).mockReturnValue({
      saveProject: mockSaveProject,
    });

    (useToast as jest.Mock).mockReturnValue({
      toast: mockToast,
    });

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

    render(<ImportDialog />);

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

    // Wait for progress and then completion
    // The hook updates progress states which causes re-renders
    // We need to wait for the saveProject call which happens at the end
    await waitFor(() => {
      if (screen.queryByText('Validation Errors')) {
        screen.debug(); // Print errors if import failed
      }
      // Check if toast was called with error
      try {
        expect(mockSaveProject).toHaveBeenCalled();
      } catch (e) {
        // If saveProject not called, check if error toast appeared
        console.log('Toast calls:', mockToast.mock.calls);
        throw e;
      }
    }, { timeout: 3000 });

    // Verify store updated
    const state = useFloorplanStore.getState();
    expect(state.currentFloorplan?.id).toBe('fp-1');
    expect(state.currentFloorplan?.rooms).toHaveLength(1);

    // Verify history updated
    expect(HistoryService.addToImportHistory).toHaveBeenCalledWith('test.json', expect.any(Number));

    // Verify success toast
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Import Successful'
    }));

    // Verify dialog closed
    expect(useDialogStore.getState().activeDialog).toBeNull();
  });

  it('should show validation errors for invalid file', async () => {
    render(<ImportDialog />);

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
    expect(mockSaveProject).not.toHaveBeenCalled();
    expect(useDialogStore.getState().activeDialog).toBe('import-project'); // Still open
  });
});
