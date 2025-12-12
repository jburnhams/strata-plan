import { renderHook, waitFor, act } from '@testing-library/react';
import { useProject } from '@/hooks/useProject';
import { loadProject } from '@/services/storage/projectStorage';

// Mock the storage service
jest.mock('@/services/storage/projectStorage');

describe('useProject Hook', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('loads project on mount', async () => {
        const mockProject = { id: 'p1', name: 'Test' };
        (loadProject as jest.Mock).mockResolvedValue(mockProject);

        const { result } = renderHook(() => useProject('p1'));

        expect(result.current.loading).toBe(true);

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.project).toBe(mockProject);
        expect(result.current.error).toBeNull();
    });

    it('handles error when loading', async () => {
        (loadProject as jest.Mock).mockRejectedValue(new Error('Load failed'));

        const { result } = renderHook(() => useProject('p1'));

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.project).toBeNull();
        expect(result.current.error).toEqual(new Error('Load failed'));
    });

    it('does not load if id is null', async () => {
        const { result } = renderHook(() => useProject(null));

        expect(result.current.loading).toBe(false);
        expect(result.current.project).toBeNull();
        expect(loadProject).not.toHaveBeenCalled();
    });

    it('reloads when reload is called', async () => {
        const mockProject = { id: 'p1', name: 'Test' };
        (loadProject as jest.Mock).mockResolvedValue(mockProject);

        const { result } = renderHook(() => useProject('p1'));

        await waitFor(() => expect(result.current.loading).toBe(false));

        // Reload
        await act(async () => {
            await result.current.reload();
        });

        expect(loadProject).toHaveBeenCalledTimes(2); // Initial + reload
    });
});
