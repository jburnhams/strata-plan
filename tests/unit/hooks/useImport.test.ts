import { renderHook, act, waitFor } from '@testing-library/react';
import { useImport } from '@/hooks/useImport';
import * as ImportService from '@/services/import/index';
import { useFloorplanStore } from '@/stores/floorplanStore';
import { useProject } from '@/hooks/useProject';
import { useDialogStore } from '@/stores/dialogStore';
import { useToast } from '@/hooks/use-toast';

// Mock dependencies
jest.mock('@/services/import/index', () => ({
  importFloorplan: jest.fn(),
}));

jest.mock('@/stores/floorplanStore', () => ({
  useFloorplanStore: jest.fn(),
}));

jest.mock('@/hooks/useProject', () => ({
  useProject: jest.fn(),
}));

jest.mock('@/stores/dialogStore', () => ({
  useDialogStore: jest.fn(),
}));

jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn(),
}));

// Removing duplicate mocks

describe('useImport Hook', () => {
  const mockLoadFloorplan = jest.fn();
  const mockSaveProject = jest.fn();
  const mockCloseDialog = jest.fn();
  const mockToast = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useFloorplanStore as unknown as jest.Mock).mockReturnValue({
      loadFloorplan: mockLoadFloorplan,
    });

    (useProject as unknown as jest.Mock).mockReturnValue({
      saveProject: mockSaveProject,
    });

    (useDialogStore as unknown as jest.Mock).mockReturnValue({
      closeDialog: mockCloseDialog,
    });

    (useToast as unknown as jest.Mock).mockReturnValue({
      toast: mockToast,
    });
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useImport());

    expect(result.current.isImporting).toBe(false);
    expect(result.current.progress).toBe(0);
    expect(result.current.error).toBeNull();
    expect(result.current.validationResult).toBeNull();
  });

  it('should handle successful import', async () => {
    const mockFile = new File(['{}'], 'test.json', { type: 'application/json' });
    const mockFloorplan = { id: 'fp-1', name: 'Test' };

    (ImportService.importFloorplan as jest.Mock).mockResolvedValue({
      success: true,
      floorplan: mockFloorplan,
    });

    const { result } = renderHook(() => useImport());

    await act(async () => {
      await result.current.importFile(mockFile);
    });

    expect(result.current.isImporting).toBe(false);
    expect(result.current.progress).toBe(100);
    expect(result.current.error).toBeNull();

    expect(mockLoadFloorplan).toHaveBeenCalledWith(mockFloorplan);
    expect(mockSaveProject).toHaveBeenCalledWith(mockFloorplan);
    expect(mockCloseDialog).toHaveBeenCalledWith('import-project');
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Import Successful',
    }));
  });

  it('should handle import failure', async () => {
    const mockFile = new File(['{}'], 'test.json', { type: 'application/json' });
    const errorMsg = 'Invalid JSON';

    (ImportService.importFloorplan as jest.Mock).mockResolvedValue({
      success: false,
      errors: [errorMsg],
    });

    const { result } = renderHook(() => useImport());

    await act(async () => {
      await result.current.importFile(mockFile);
    });

    expect(result.current.isImporting).toBe(false);
    expect(result.current.error).toBe(errorMsg);
    expect(result.current.validationResult).toEqual({
      valid: false,
      errors: [errorMsg],
      warnings: [],
    });

    expect(mockLoadFloorplan).not.toHaveBeenCalled();
    expect(mockSaveProject).not.toHaveBeenCalled();
  });

  it('should handle exception during import', async () => {
    const mockFile = new File(['{}'], 'test.json', { type: 'application/json' });
    const errorMsg = 'Network error';

    (ImportService.importFloorplan as jest.Mock).mockRejectedValue(new Error(errorMsg));

    const { result } = renderHook(() => useImport());

    await act(async () => {
      await result.current.importFile(mockFile);
    });

    expect(result.current.isImporting).toBe(false);
    expect(result.current.error).toBe(errorMsg);

    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Import Failed',
      description: errorMsg,
      variant: 'destructive',
    }));
  });

  it('should pass options to importFloorplan', async () => {
    const mockFile = new File(['{}'], 'test.json', { type: 'application/json' });
    (ImportService.importFloorplan as jest.Mock).mockResolvedValue({
      success: true,
      floorplan: { id: 'fp-1' },
    });

    const { result } = renderHook(() => useImport());

    await act(async () => {
      await result.current.importFile(mockFile, { generateNewIds: true });
    });

    expect(ImportService.importFloorplan).toHaveBeenCalledWith(
      mockFile,
      expect.objectContaining({ generateNewIds: true })
    );
  });
});
