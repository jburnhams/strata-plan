import { renderHook, waitFor, act } from '@testing-library/react';
import { useProjectList } from '@/hooks/useProjectList';
import { listProjects } from '@/services/storage/projectStorage';

// Mock the storage service
jest.mock('@/services/storage/projectStorage');

describe('useProjectList Hook', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('lists projects on mount', async () => {
        const mockProjects = [{ id: 'p1', name: 'Test' }];
        (listProjects as jest.Mock).mockResolvedValue(mockProjects);

        const { result } = renderHook(() => useProjectList());

        expect(result.current.loading).toBe(true);

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.projects).toBe(mockProjects);
        expect(result.current.error).toBeNull();
    });

    it('handles error when listing', async () => {
        (listProjects as jest.Mock).mockRejectedValue(new Error('List failed'));

        const { result } = renderHook(() => useProjectList());

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.projects).toEqual([]);
        expect(result.current.error).toEqual(new Error('List failed'));
    });

    it('refreshes when refresh is called', async () => {
        const mockProjects = [{ id: 'p1', name: 'Test' }];
        (listProjects as jest.Mock).mockResolvedValue(mockProjects);

        const { result } = renderHook(() => useProjectList());

        await waitFor(() => expect(result.current.loading).toBe(false));

        // Refresh
        await act(async () => {
            await result.current.refresh();
        });

        expect(listProjects).toHaveBeenCalledTimes(2); // Initial + refresh
    });
});
