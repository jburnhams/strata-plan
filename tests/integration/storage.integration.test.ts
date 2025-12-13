import 'fake-indexeddb/auto';
import { createCanvas } from '@napi-rs/canvas';

if (!global.structuredClone) {
  global.structuredClone = (val: any) => JSON.parse(JSON.stringify(val));
}
import { saveProject, loadProject, listProjects, deleteProject } from '@/services/storage/projectStorage';
import { saveAs, revertToSaved } from '@/services/storage/saveOperations';
import { saveSettings, loadSettings } from '@/services/storage/settingsStorage';
import { useAutoSave } from '@/hooks/useAutoSave';
import { migrateData } from '@/services/storage/migrations';
import { Floorplan } from '@/types/floorplan';
import { _resetDatabaseInstance } from '@/services/storage/database';
import { renderHook, waitFor } from '@testing-library/react';
import { useUIStore } from '@/stores/uiStore';
import { act } from '@testing-library/react';

// We need to mock useToast because useAutoSave uses it
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

// Mock useFloorplanStore for useAutoSave
const mockFloorplanStore = {
  subscribe: jest.fn(),
};
jest.mock('@/stores/floorplanStore', () => ({
  useFloorplanStore: {
    subscribe: (selector: any, callback: any) => {
       // Mock implementation for test if needed, or just a spy
       return () => {};
    },
    getState: jest.fn(),
  }
}));

describe('Storage Integration', () => {
  let createElementSpy: jest.SpyInstance;

  beforeAll(() => {
    const originalCreateElement = document.createElement.bind(document);
    createElementSpy = jest.spyOn(document, 'createElement').mockImplementation((tagName: string, options) => {
      if (tagName === 'canvas') {
        const canvas = createCanvas(200, 150);
        return canvas as unknown as HTMLCanvasElement;
      }
      return originalCreateElement(tagName, options);
    });
  });

  afterAll(() => {
    if (createElementSpy) {
      createElementSpy.mockRestore();
    }
  });

  beforeEach(async () => {
    await _resetDatabaseInstance();
    const dbs = await window.indexedDB.databases();
    for (const db of dbs) {
        if (db.name) {
            const req = window.indexedDB.deleteDatabase(db.name);
            await new Promise((resolve, reject) => {
                req.onsuccess = resolve;
                req.onerror = reject;
                req.onblocked = resolve;
            });
        }
    }
    useUIStore.setState({ saveStatus: 'saved', lastSaveTime: null });
    jest.clearAllMocks();
  });

  const mockDate = new Date('2023-01-01T12:00:00.000Z');
  const mockFloorplan: Floorplan = {
    id: 'p1',
    name: 'Test Project',
    units: 'meters',
    rooms: [
      { id: 'r1', name: 'Living Room', width: 5, length: 4, height: 2.4, type: 'living_room', position: { x: 0, z: 0 } },
    ],
    walls: [],
    doors: [],
    windows: [],
    connections: [],
    createdAt: mockDate,
    updatedAt: mockDate,
    version: '1.0.0',
  } as Floorplan;

  describe('Full Lifecycle', () => {
    it('performs full save and load cycle', async () => {
        await saveProject(mockFloorplan, 'data:image/png;base64,fake');
        const loaded = await loadProject('p1');
        expect(loaded).toBeDefined();
        expect(loaded?.id).toBe(mockFloorplan.id);
        expect(loaded?.rooms).toHaveLength(1);
    });
  });

  describe('Project Management', () => {
      it('lists projects correctly', async () => {
        await saveProject({ ...mockFloorplan, id: 'p1', name: 'Project 1', updatedAt: new Date('2023-01-01') });
        await saveProject({ ...mockFloorplan, id: 'p2', name: 'Project 2', updatedAt: new Date('2023-01-02') });
        const list = await listProjects();
        expect(list).toHaveLength(2);
        expect(list[0].id).toBe('p2');
        expect(list[1].id).toBe('p1');
      });

      it('updates existing project', async () => {
        await saveProject(mockFloorplan);
        const updated = {
            ...mockFloorplan,
            name: 'Updated Name',
            rooms: [...mockFloorplan.rooms, { ...mockFloorplan.rooms[0], id: 'r2' }]
        };
        await saveProject(updated);
        const loaded = await loadProject('p1');
        expect(loaded?.name).toBe('Updated Name');
        expect(loaded?.rooms).toHaveLength(2);
      });

      it('deletes project', async () => {
        await saveProject(mockFloorplan);
        await deleteProject('p1');
        const loaded = await loadProject('p1');
        expect(loaded).toBeNull();
        const list = await listProjects();
        expect(list).toHaveLength(0);
      });

      it('performs save-as operation', async () => {
        await saveProject(mockFloorplan);
        const newId = await saveAs(mockFloorplan, 'Copy of Project');
        const original = await loadProject('p1');
        const copy = await loadProject(newId);
        expect(original).toBeDefined();
        expect(copy).toBeDefined();
        expect(copy?.id).not.toBe('p1');
        expect(copy?.name).toBe('Copy of Project');
      });

      it('reverts to saved version', async () => {
          await saveProject(mockFloorplan);
          const currentAppState = { ...mockFloorplan, name: 'Unsaved Changes' };
          const reverted = await revertToSaved(currentAppState.id);
          expect(reverted.name).toBe('Test Project');
      });
  });

  describe('Settings Persistence', () => {
    it('saves and loads settings', async () => {
        const newSettings = { theme: 'dark' as const, showGrid: false };
        await saveSettings(newSettings);
        const loaded = await loadSettings();
        expect(loaded.theme).toBe('dark');
        expect(loaded.showGrid).toBe(false);
    });
  });

  describe('Migration', () => {
      it('migrates old data version', async () => {
          const oldData = { ...mockFloorplan, version: '0.9.0' };
          const migrated = migrateData(oldData, '0.9.0', '1.0.0');
          expect(migrated).toBeDefined();
      });
  });

  describe('Auto-Save', () => {
    it('auto-saves after delay', async () => {
        jest.useFakeTimers();

        const { result, rerender } = renderHook((props) => useAutoSave(props.floorplan, true), {
            initialProps: { floorplan: mockFloorplan }
        });

        const changedFloorplan = { ...mockFloorplan, name: 'Changed' };
        rerender({ floorplan: changedFloorplan });

        // Wait for debounce delay
        await act(async () => {
            jest.advanceTimersByTime(35000);
        });

        // The hook triggers async saveProject.
        // We need to wait for it to complete.
        // We can poll status or just wait a bit more?
        // Since we are fake timers, async tasks still run in event loop.

        // We can wait for status to become 'saved'
        await waitFor(() => {
            expect(result.current.status).toBe('saved');
        });

        const saved = await loadProject('p1');
        expect(saved?.name).toBe('Changed');

        jest.useRealTimers();
    });
  });
});
