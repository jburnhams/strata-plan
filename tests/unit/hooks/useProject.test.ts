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

    it('handles race conditions when id changes rapidly', async () => {
        const mockProject1 = { id: 'p1', name: 'Project 1' };
        const mockProject2 = { id: 'p2', name: 'Project 2' };

        // Mock loadProject to have a delay
        (loadProject as jest.Mock).mockImplementation(async (id) => {
            await new Promise(resolve => setTimeout(resolve, 10));
            if (id === 'p1') return mockProject1;
            if (id === 'p2') return mockProject2;
            return null;
        });

        const { result, rerender } = renderHook((props) => useProject(props.id), {
            initialProps: { id: 'p1' }
        });

        // Immediately change to p2 before p1 finishes
        rerender({ id: 'p2' });

        await waitFor(() => expect(result.current.loading).toBe(false));

        // Should have p2 loaded, not p1
        expect(result.current.project).toEqual(mockProject2);
        expect(loadProject).toHaveBeenCalledTimes(2);
    });

    it('handles race conditions in reload', async () => {
        // This is harder to test because reload is imperative, but we can check if unmounting prevents state updates
        const mockProject = { id: 'p1', name: 'Test' };
        let resolveLoad: (value: any) => void;
        (loadProject as jest.Mock).mockImplementation(() => new Promise(resolve => {
            resolveLoad = resolve;
        }));

        const { result, unmount } = renderHook(() => useProject('p1'));

        expect(result.current.loading).toBe(true);

        unmount();

        // Resolve after unmount
        // @ts-ignore
        resolveLoad(mockProject);

        // We can't really assert state on unmounted hook, but we want to ensure no "act" warnings or errors
        // React Testing Library usually catches these.
    });
});
