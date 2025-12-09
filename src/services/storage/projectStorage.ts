import { initDatabase, StoredProject } from './database';
import { serializeFloorplan, deserializeFloorplan } from './serialization';
import { Floorplan, FloorplanMetadata } from '@/types/floorplan';

export interface ProjectMetadata extends FloorplanMetadata {}

/**
 * Saves a project to IndexedDB.
 * If the project already exists, it overwrites it.
 */
export const saveProject = async (floorplan: Floorplan, thumbnail?: string): Promise<void> => {
  if (!floorplan) throw new Error('Cannot save null floorplan');

  const db = await initDatabase();
  const serialized = serializeFloorplan(floorplan);

  const storedProject: StoredProject = {
    id: floorplan.id,
    name: floorplan.name,
    data: serialized,
    thumbnail,
    createdAt: floorplan.createdAt,
    updatedAt: floorplan.updatedAt,
    version: serialized.version
  };

  await db.put('projects', storedProject);
};

/**
 * Loads a project from IndexedDB by ID.
 * Returns null if not found.
 */
export const loadProject = async (id: string): Promise<Floorplan | null> => {
  if (!id) throw new Error('Project ID is required');

  const db = await initDatabase();
  const stored = await db.get('projects', id);

  if (!stored) return null;

  try {
      // TODO: Add migration logic here in future tasks
      return deserializeFloorplan(stored.data);
  } catch (error) {
      console.error(`Failed to deserialize project ${id}:`, error);
      throw new Error(`Failed to load project: ${(error as Error).message}`);
  }
};

/**
 * Updates an existing project.
 * This is effectively the same as saveProject but checks existence first?
 * The requirements distinguish them, likely for semantic reasons or specific validations.
 * For now, we will just use saveProject logic but ensure we update timestamps if not handled by caller.
 * Actually, the caller (store) usually handles updating the 'updatedAt' field on the object before saving.
 */
export const updateProject = async (id: string, floorplan: Floorplan): Promise<void> => {
    if (id !== floorplan.id) {
        throw new Error('ID mismatch between argument and floorplan object');
    }
    // We assume the floorplan object has already been updated with latest data
    await saveProject(floorplan);
};

/**
 * Deletes a project by ID.
 */
export const deleteProject = async (id: string): Promise<void> => {
    const db = await initDatabase();
    await db.delete('projects', id);
};

/**
 * Checks if a project exists.
 */
export const projectExists = async (id: string): Promise<boolean> => {
    const db = await initDatabase();
    const key = await db.getKey('projects', id);
    return key !== undefined;
};

/**
 * Lists all projects with metadata, sorted by updatedAt (newest first).
 */
export const listProjects = async (): Promise<ProjectMetadata[]> => {
    const db = await initDatabase();
    const projects = await db.getAllFromIndex('projects', 'by-updated');

    // getAllFromIndex returns in ascending order (oldest first). We want newest first.
    return projects.reverse().map(p => {
        // Safe access using SerializedFloorplan type structure
        // Note: p.data is typed as SerializedFloorplan in StoredProject
        // However, SerializedFloorplan is defined in another file and has unknown property access if not imported carefully?
        // No, SerializedFloorplan is imported. But deserialization might be needed if we want strict typing?
        // Actually SerializedFloorplan interface defines rooms as Room[] (inherited from Omit<Floorplan...>) so it should be fine.
        // Wait, SerializedFloorplan omits createdAt/updatedAt but keeps rooms.
        // But database.ts defines SerializedFloorplan as 'unknown' initially.
        // Ah, I updated database.ts to import the real one.
        // But StoredProject uses SerializedFloorplan from './serialization'.
        // Let's ensure types are correct.
        const data = p.data as any; // Using any for safety if types are misaligned, but cleaner would be:
        // const roomCount = (p.data as unknown as { rooms: any[] }).rooms?.length || 0;
        // But if types align:
        // const roomCount = p.data.rooms.length;

        // Let's assume dynamic access for robustness against data corruption
        const rooms = (data && Array.isArray(data.rooms)) ? data.rooms : [];

        return {
            id: p.id,
            name: p.name,
            roomCount: rooms.length,
            totalArea: 0, // TODO: Calculate area if needed, or store it in metadata
            updatedAt: p.updatedAt,
            thumbnailDataUrl: p.thumbnail
        };
    });
};
