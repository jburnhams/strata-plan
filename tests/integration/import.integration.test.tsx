import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { DialogProvider } from '../../src/components/dialogs/DialogProvider';
import { useDialogStore } from '../../src/stores/dialogStore';
import { useFloorplanStore } from '../../src/stores/floorplanStore';
import { useProject } from '../../src/hooks/useProject';
import { readFileAsText } from '../../src/services/import/fileReader';
import * as HistoryService from '../../src/services/import/history';
import { useToast } from '../../src/hooks/use-toast';
import { DIALOG_IMPORT } from '../../src/constants/dialogs';
import * as ProjectStorage from '../../src/services/storage/projectStorage';
import { SAMPLE_PROJECTS } from '../../src/services/import/samples';
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

// Mock Tabs using Context
jest.mock('../../src/components/ui/tabs', () => {
  const React = require('react');
  const TabsContext = React.createContext({ value: 'file', setValue: (v: any) => {} });

  return {
    Tabs: ({ children, defaultValue, className }: any) => {
       const [value, setValue] = React.useState(defaultValue || 'file');
       return (
         <TabsContext.Provider value={{ value, setValue }}>
           <div data-testid="tabs" className={className}>
             {children}
           </div>
         </TabsContext.Provider>
       );
    },
    TabsList: ({ children }: any) => <div role="tablist">{children}</div>,
    TabsTrigger: ({ children, value, onClick }: any) => {
      const { value: activeValue, setValue } = React.useContext(TabsContext);
      return (
        <button
            role="tab"
            data-value={value}
            data-state={activeValue === value ? 'active' : 'inactive'}
            onClick={(e) => {
                if (onClick) onClick(e);
                setValue(value);
            }}
        >
          {children}
        </button>
      );
    },
    TabsContent: ({ children, value }: any) => {
      const { value: activeValue } = React.useContext(TabsContext);
      if (value !== activeValue) return null;
      return <div role="tabpanel" data-value={value}>{children}</div>;
    },
  };
});

// Mock Lucide icons
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
    updatedAt: new Date().toISOString(),
    version: '1.0.0', // Ensure version is present
    walls: [] // Ensure walls array is present
  };

  beforeAll(() => {
    if (!global.structuredClone) {
        global.structuredClone = (val) => JSON.parse(JSON.stringify(val));
    }

    // Mock global fetch for samples
    global.fetch = jest.fn() as jest.Mock;
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset stores
    useDialogStore.setState({ activeDialog: DIALOG_IMPORT });
    useFloorplanStore.setState({ currentFloorplan: null });

    (useProject as jest.Mock).mockReturnValue({
      saveProject: jest.fn(),
    });

    (useToast as jest.Mock).mockReturnValue({
      toast: mockToast,
    });

    saveProjectSpy = jest.spyOn(ProjectStorage, 'saveProject');

    (HistoryService.getImportHistory as jest.Mock).mockResolvedValue([]);
    (HistoryService.addToImportHistory as jest.Mock).mockResolvedValue(undefined);
    (readFileAsText as jest.Mock).mockReset();
  });

  it('should import a valid JSON file via file selection', async () => {
    render(<DialogProvider />);

    const fileContent = JSON.stringify(validFloorplan);
    const file = new File([fileContent], 'test.json', { type: 'application/json' });

    (readFileAsText as jest.Mock).mockResolvedValue(fileContent);

    const input = screen.getByLabelText(/Upload file drop zone/i).querySelector('input') as HTMLInputElement;

    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } });
    });

    await waitFor(() => {
      expect(screen.getByText('test.json')).toBeInTheDocument();
    });

    const importButton = screen.getByRole('button', { name: /^Import Project$/i });

    await act(async () => {
      fireEvent.click(importButton);
    });

    await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
            title: 'Import Successful'
        }));
    }, { timeout: 3000 });

    expect(saveProjectSpy).toHaveBeenCalled();
    const state = useFloorplanStore.getState();
    expect(state.currentFloorplan?.id).toBe('fp-1');
  });

  it('should import via drag and drop', async () => {
    render(<DialogProvider />);

    const fileContent = JSON.stringify(validFloorplan);
    const file = new File([fileContent], 'dropped.json', { type: 'application/json' });
    (readFileAsText as jest.Mock).mockResolvedValue(fileContent);

    const dropZone = screen.getByLabelText(/Upload file drop zone/i);

    // Simulate drag enter
    fireEvent.dragEnter(dropZone);
    expect(dropZone).toHaveClass('border-primary'); // Check for active class

    // Simulate drop
    await act(async () => {
        fireEvent.drop(dropZone, {
            dataTransfer: {
                files: [file],
            },
        });
    });

    await waitFor(() => {
      expect(screen.getByText('dropped.json')).toBeInTheDocument();
    });

    // Proceed to import
    const importButton = screen.getByRole('button', { name: /^Import Project$/i });
    await act(async () => {
      fireEvent.click(importButton);
    });

    await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
            title: 'Import Successful'
        }));
    });
  });

  it('should handle validation errors', async () => {
    render(<DialogProvider />);

    const invalidContent = JSON.stringify({ name: 'Invalid' });
    const file = new File([invalidContent], 'invalid.json', { type: 'application/json' });

    (readFileAsText as jest.Mock).mockResolvedValue(invalidContent);

    const input = screen.getByLabelText(/Upload file drop zone/i).querySelector('input') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } });
    });

    const importButton = screen.getByRole('button', { name: /^Import Project$/i });
    await act(async () => {
      fireEvent.click(importButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Validation Errors')).toBeInTheDocument();
    });

    expect(saveProjectSpy).not.toHaveBeenCalled();
  });

  it('should generate new IDs when requested', async () => {
    render(<DialogProvider />);

    const fileContent = JSON.stringify(validFloorplan);
    const file = new File([fileContent], 'new-ids.json', { type: 'application/json' });
    (readFileAsText as jest.Mock).mockResolvedValue(fileContent);

    // Select file
    const input = screen.getByLabelText(/Upload file drop zone/i).querySelector('input') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } });
    });

    // Wait for file UI
    await waitFor(() => {
      expect(screen.getByText('new-ids.json')).toBeInTheDocument();
    });

    // Check "Generate new IDs"
    const checkbox = screen.getByLabelText(/Generate new IDs/i);
    fireEvent.click(checkbox);

    // Import
    const importButton = screen.getByRole('button', { name: /^Import Project$/i });
    await act(async () => {
      fireEvent.click(importButton);
    });

    await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
            title: 'Import Successful'
        }));
    });

    const state = useFloorplanStore.getState();
    // ID should be different from input
    expect(state.currentFloorplan?.id).not.toBe('fp-1');
  });

  it('should load a sample project', async () => {
    render(<DialogProvider />);

    // Mock fetch response for sample
    const sampleFloorplan = { ...validFloorplan, id: 'sample-fp', name: 'Sample Project' };
    (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(sampleFloorplan)
    });

    // Switch to Samples tab
    const samplesTab = screen.getByRole('tab', { name: /Samples/i });
    await act(async () => {
        fireEvent.click(samplesTab);
    });

    // Check if samples list is visible
    expect(screen.getByText(SAMPLE_PROJECTS[0].name)).toBeInTheDocument();

    const loadButtons = screen.getAllByRole('button', { name: /Load Template/i });

    await act(async () => {
        fireEvent.click(loadButtons[0]);
    });

    await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
            title: 'Sample Loaded'
        }));
    });

    expect(global.fetch).toHaveBeenCalledWith(`/samples/${SAMPLE_PROJECTS[0].filename}`);
    expect(saveProjectSpy).toHaveBeenCalled();
    const state = useFloorplanStore.getState();
    expect(state.currentFloorplan?.id).toBe('sample-fp');
  });
});
