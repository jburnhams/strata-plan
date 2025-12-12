import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ImportDialog } from '../../../../src/components/dialogs/ImportDialog';
import { useDialogStore } from '../../../../src/stores/dialogStore';
import { useImport } from '../../../../src/hooks/useImport';
import * as HistoryService from '../../../../src/services/import/history';
import * as SamplesService from '../../../../src/services/import/samples';

// Mock dependencies
jest.mock('../../../../src/stores/dialogStore');
jest.mock('../../../../src/hooks/useImport');
jest.mock('../../../../src/services/import/history');
jest.mock('../../../../src/services/import/samples', () => ({
  loadSampleProject: jest.fn(),
  SAMPLE_PROJECTS: [
    { id: 's1', name: 'Sample 1', description: 'Desc', filename: 's1.json' }
  ]
}));
jest.mock('../../../../src/components/ui/dialog', () => ({
  Dialog: ({ children, open }: any) => (open ? <div data-testid="dialog">{children}</div> : null),
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <div>{children}</div>,
  DialogDescription: ({ children }: any) => <div>{children}</div>,
  DialogFooter: ({ children }: any) => <div>{children}</div>,
}));

// Mock lucide icons
jest.mock('lucide-react', () => ({
  Upload: () => <div data-testid="icon-upload" />,
  FileJson: () => <div data-testid="icon-file-json" />,
  AlertTriangle: () => <div data-testid="icon-alert" />,
  AlertCircle: () => <div data-testid="icon-alert-circle" />,
  Check: () => <div data-testid="icon-check" />,
  Loader2: () => <div data-testid="icon-loader" />,
  X: () => <div data-testid="icon-close" />,
}));

describe('ImportDialog', () => {
  const mockCloseDialog = jest.fn();
  const mockImportFile = jest.fn();
  const mockReset = jest.fn();
  const mockOnOpenChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useDialogStore as unknown as jest.Mock).mockReturnValue({
      activeDialog: 'import-project',
      closeDialog: mockCloseDialog,
    });

    (useImport as unknown as jest.Mock).mockReturnValue({
      importFile: mockImportFile,
      isImporting: false,
      progress: 0,
      error: null,
      validationResult: null,
      reset: mockReset,
    });

    (HistoryService.getImportHistory as jest.Mock).mockResolvedValue([]);
    (SamplesService.loadSampleProject as jest.Mock).mockResolvedValue({});
    // Mock sample projects array if it's exported as a constant,
    // but typically we mock the module so we might need to rely on the real constant or mock it if it's used directly
    // Since we mocked the whole module, we need to provide the constant if the component imports it
    // Wait, if we mock the module with jest.mock, all exports are undefined/jest.fn unless specified.
    // The component imports SAMPLE_PROJECTS. We need to provide it.
  });

  it('should not render when dialog is not active', () => {
    render(<ImportDialog open={false} onOpenChange={mockOnOpenChange} />);
    expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
  });

  it('should render dropzone when no file selected', () => {
    render(<ImportDialog open={true} onOpenChange={mockOnOpenChange} />);

    expect(screen.getByText('Import Project')).toBeInTheDocument();
    expect(screen.getByText('Drag and drop your file here')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Upload file drop zone/i })).toBeInTheDocument();
  });

  it('should handle file selection via input', () => {
    render(<ImportDialog open={true} onOpenChange={mockOnOpenChange} />);

    const file = new File(['{}'], 'test.json', { type: 'application/json' });
    const input = screen.getByLabelText(/Upload file drop zone/i).querySelector('input') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    expect(screen.getByText('test.json')).toBeInTheDocument();
    expect(screen.queryByText('Drag and drop your file here')).not.toBeInTheDocument();
  });

  it('should handle drag and drop', () => {
    render(<ImportDialog open={true} onOpenChange={mockOnOpenChange} />);

    const dropzone = screen.getByRole('button', { name: /Upload file drop zone/i });
    const file = new File(['{}'], 'test.json', { type: 'application/json' });

    fireEvent.dragEnter(dropzone);
    fireEvent.dragOver(dropzone);
    fireEvent.drop(dropzone, { dataTransfer: { files: [file] } });

    expect(screen.getByText('test.json')).toBeInTheDocument();
  });

  it('should call importFile when import button clicked', () => {
    render(<ImportDialog open={true} onOpenChange={mockOnOpenChange} />);

    // Select file
    const file = new File(['{}'], 'test.json', { type: 'application/json' });
    const input = screen.getByLabelText(/Upload file drop zone/i).querySelector('input') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });

    // Click import
    const importButton = screen.getByRole('button', { name: /^Import Project$/i });
    fireEvent.click(importButton);

    expect(mockImportFile).toHaveBeenCalledWith(file, { generateNewIds: false });
  });

  it('should show validation errors', () => {
    (useImport as unknown as jest.Mock).mockReturnValue({
      importFile: mockImportFile,
      isImporting: false,
      progress: 0,
      error: 'Validation failed',
      validationResult: {
        valid: false,
        errors: ['Missing ID', 'Invalid units'],
        warnings: []
      },
      reset: mockReset,
    });

    render(<ImportDialog open={true} onOpenChange={mockOnOpenChange} />);

    // Select file to trigger error view state (although in reality error usually comes after import attempt)
    const file = new File(['{}'], 'test.json', { type: 'application/json' });
    const input = screen.getByLabelText(/Upload file drop zone/i).querySelector('input') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });

    expect(screen.getByText('Validation Errors')).toBeInTheDocument();
    expect(screen.getByText('Missing ID')).toBeInTheDocument();
    expect(screen.getByText('Invalid units')).toBeInTheDocument();
  });

  it('should show progress when importing', () => {
    (useImport as unknown as jest.Mock).mockReturnValue({
      importFile: mockImportFile,
      isImporting: true,
      progress: 45,
      error: null,
      validationResult: null,
      reset: mockReset,
    });

    render(<ImportDialog open={true} onOpenChange={mockOnOpenChange} />);

    // Select file
    const file = new File(['{}'], 'test.json', { type: 'application/json' });
    const input = screen.getByLabelText(/Upload file drop zone/i).querySelector('input') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });

    // There are two "Importing..." texts: one in progress label, one in button
    expect(screen.getAllByText('Importing...').length).toBeGreaterThan(0);
    expect(screen.getByText('45%')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Importing.../i })).toBeDisabled();
  });

  it('should allow removing selected file', () => {
    render(<ImportDialog open={true} onOpenChange={mockOnOpenChange} />);

    const file = new File(['{}'], 'test.json', { type: 'application/json' });
    const input = screen.getByLabelText(/Upload file drop zone/i).querySelector('input') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });

    expect(screen.getByText('test.json')).toBeInTheDocument();

    const removeButton = screen.getByRole('button', { name: /Remove file/i });
    fireEvent.click(removeButton);

    expect(screen.queryByText('test.json')).not.toBeInTheDocument();
    expect(screen.getByText('Drag and drop your file here')).toBeInTheDocument();
    expect(mockReset).toHaveBeenCalled();
  });
});
