import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ImportDialog } from '@/components/dialogs/ImportDialog';
import { useImport } from '@/hooks/useImport';
import { getImportHistory } from '@/services/import/history';
import { loadSampleProject } from '@/services/import/samples';
import userEvent from '@testing-library/user-event';

// Mocks
jest.mock('@/hooks/useImport');
jest.mock('@/services/import/history');
jest.mock('@/services/import/samples');
jest.mock('@/stores/floorplanStore', () => ({
  useFloorplanStore: jest.fn(() => ({ loadFloorplan: jest.fn() })),
}));
jest.mock('@/hooks/useProject', () => ({
  useProject: jest.fn(() => ({})),
}));
jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn(() => ({ toast: jest.fn() })),
}));
jest.mock('@/services/storage/projectStorage', () => ({
  saveProject: jest.fn(),
}));
jest.mock('@/stores/dialogStore', () => ({
    useDialogStore: jest.fn(() => ({ openDialog: jest.fn(), closeDialog: jest.fn() }))
}));

describe('ImportDialog', () => {
  const mockImportFile = jest.fn();
  const mockReset = jest.fn();
  const mockOnOpenChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useImport as jest.Mock).mockReturnValue({
      importFile: mockImportFile,
      isImporting: false,
      progress: 0,
      error: null,
      validationResult: null,
      reset: mockReset,
    });

    (getImportHistory as jest.Mock).mockResolvedValue([]);
  });

  it('renders correctly when open', () => {
    render(<ImportDialog open={true} onOpenChange={mockOnOpenChange} />);

    expect(screen.getByText('Import Project')).toBeInTheDocument();
    expect(screen.getByText('File Upload')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'File Upload' })).toBeInTheDocument();
  });

  it('handles file selection via input', async () => {
    const user = userEvent.setup();
    render(<ImportDialog open={true} onOpenChange={mockOnOpenChange} />);
    const file = new File(['{}'], 'test.json', { type: 'application/json' });

    // Find drop zone by aria-label (portal aware)
    const dropZone = screen.getByLabelText('Upload file drop zone');
    // Find input inside
    const input = dropZone.querySelector('input[type="file"]');

    expect(input).toBeInTheDocument();

    // Use fireEvent for hidden input as userEvent.upload requires label association usually,
    // but fireEvent is reliable for hidden inputs in tests
    fireEvent.change(input!, { target: { files: [file] } });

    await waitFor(() => {
        expect(screen.getByText('test.json')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: 'Import Project' })).toBeInTheDocument();
  });

  it('calls importFile on button click', async () => {
    const user = userEvent.setup();
    render(<ImportDialog open={true} onOpenChange={mockOnOpenChange} />);
    const file = new File(['{}'], 'test.json', { type: 'application/json' });

    const dropZone = screen.getByLabelText('Upload file drop zone');
    const input = dropZone.querySelector('input[type="file"]');

    fireEvent.change(input!, { target: { files: [file] } });

    await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Import Project' })).toBeInTheDocument();
    });

    const importButton = screen.getByRole('button', { name: 'Import Project' });
    await user.click(importButton);

    expect(mockImportFile).toHaveBeenCalledWith(file, { generateNewIds: false });
  });

  it('displays history tabs', async () => {
    const user = userEvent.setup();
    (getImportHistory as jest.Mock).mockResolvedValue([
       { filename: 'old.json', importedAt: new Date().toISOString(), size: 1024 }
    ]);

    render(<ImportDialog open={true} onOpenChange={mockOnOpenChange} />);

    const historyTab = screen.getByRole('tab', { name: 'History' });
    await user.click(historyTab);

    // Wait for history content
    await waitFor(() => {
        expect(screen.getByText('old.json')).toBeInTheDocument();
    });
  });
});
