import { renderHook, waitFor } from '@testing-library/react';
import { useSettingsSync } from '@/components/layout/SettingsSync';
import { loadSettings, saveSettings } from '@/services/storage/settingsStorage';
import { useUIStore } from '@/stores/uiStore';

jest.mock('@/services/storage/settingsStorage');

describe('useSettingsSync', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useUIStore.setState({ showGrid: true, theme: 'light' });
        (saveSettings as jest.Mock).mockResolvedValue(undefined); // Return promise
    });

    it('loads settings on mount', async () => {
        (loadSettings as jest.Mock).mockResolvedValue({
            theme: 'dark',
            showGrid: false,
            gridSize: 0.5,
            snapToGrid: true,
            materialQuality: 'high'
        });

        renderHook(() => useSettingsSync());

        await waitFor(() => {
            const state = useUIStore.getState();
            expect(state.theme).toBe('dark');
            expect(state.showGrid).toBe(false);
        });
    });

    it('saves settings when store changes', async () => {
        (loadSettings as jest.Mock).mockResolvedValue({
            theme: 'light',
            showGrid: true
        });

        renderHook(() => useSettingsSync());

        // Wait for init
        await waitFor(() => expect(loadSettings).toHaveBeenCalled());

        // Update store
        useUIStore.setState({ theme: 'dark' });

        await waitFor(() => {
            expect(saveSettings).toHaveBeenCalledWith(expect.objectContaining({
                theme: 'dark'
            }));
        });
    });
});
