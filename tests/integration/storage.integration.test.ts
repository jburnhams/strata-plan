import 'fake-indexeddb/auto';
if (!global.structuredClone) {
  global.structuredClone = (val: any) => JSON.parse(JSON.stringify(val));
}
import { saveProject, loadProject, listProjects, deleteProject } from '@/services/storage/projectStorage';
import { saveAs, revertToSaved } from '@/services/storage/saveOperations';
import { Floorplan } from '@/types/floorplan';
import { _resetDatabaseInstance } from '@/services/storage/database';

describe('Storage Integration', () => {
  // Ensure we start with fresh DB
  beforeEach(async () => {
    await _resetDatabaseInstance();
    // fake-indexeddb keeps state in memory, we need to clear it or use unique DB names
    // Actually fake-indexeddb globals are reset if we import auto?
    // No, usually we need to clear indexedDB.
    const dbs = await window.indexedDB.databases();
    for (const db of dbs) {
        if (db.name) {
            const req = window.indexedDB.deleteDatabase(db.name);
            await new Promise((resolve, reject) => {
                req.onsuccess = resolve;
                req.onerror = reject;
                req.onblocked = resolve; // Just resolve if blocked for now, though it implies connection open
            });
        }
    }
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

  it('performs full save and load cycle', async () => {
    // 1. Save
    await saveProject(mockFloorplan, 'data:image/png;base64,fake');

    // 2. Load
    const loaded = await loadProject('p1');

    // 3. Verify
    expect(loaded).toBeDefined();
    expect(loaded?.id).toBe(mockFloorplan.id);
    expect(loaded?.rooms).toHaveLength(1);
    expect(loaded?.rooms[0].name).toBe('Living Room');
    expect(loaded?.createdAt.toISOString()).toBe(mockFloorplan.createdAt.toISOString());
  });

  it('lists projects correctly', async () => {
    await saveProject({ ...mockFloorplan, id: 'p1', name: 'Project 1', updatedAt: new Date('2023-01-01') });
    await saveProject({ ...mockFloorplan, id: 'p2', name: 'Project 2', updatedAt: new Date('2023-01-02') });

    const list = await listProjects();

    expect(list).toHaveLength(2);
    // Should be sorted by updatedAt descending
    expect(list[0].id).toBe('p2');
    expect(list[1].id).toBe('p1');
    expect(list[0].thumbnailDataUrl).toBeUndefined(); // We didn't save thumbnail
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
    expect(copy?.rooms).toHaveLength(original!.rooms.length);
  });

  it('reverts to saved version', async () => {
      // Save initial state
      await saveProject(mockFloorplan);

      // Mutate in memory (simulating unsaved changes in app state)
      const currentAppState = { ...mockFloorplan, name: 'Unsaved Changes' };

      // Revert
      const reverted = await revertToSaved(currentAppState.id);

      expect(reverted.name).toBe('Test Project'); // Should be original name
  });
});
