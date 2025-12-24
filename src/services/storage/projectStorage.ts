import { initDatabase, StoredProject } from './database';
import { serializeFloorplan, deserializeFloorplan, CURRENT_VERSION } from './serialization';
import { generateThumbnail } from './thumbnails';
import { migrateData } from './migrations';
import { Floorplan, FloorplanMetadata } from '@/types/floorplan';
import { calculatePolygonArea } from '@/utils/geometry';

export interface ProjectMetadata extends FloorplanMetadata {}

/**
 * Saves a project to IndexedDB.
 * If the project already exists, it overwrites it.
 */
export const saveProject = async (floorplan: Floorplan, thumbnail?: string): Promise<void> => {
  if (!floorplan) throw new Error('Cannot save null floorplan');

  const db = await initDatabase();
  const serialized = serializeFloorplan(floorplan);

  // If thumbnail is not provided, generate one
  let thumbnailData = thumbnail;
  if (!thumbnailData) {
    try {
      thumbnailData = await generateThumbnail(floorplan);
    } catch (error) {
      console.warn('Failed to generate thumbnail during save:', error);
      // Proceed without thumbnail rather than failing the save
    }
  }

  const storedProject: StoredProject = {
    id: floorplan.id,
    name: floorplan.name,
    data: serialized,
    thumbnail: thumbnailData,
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
      // Check for migration
      let data = stored.data;
      const storedVersion = data.version || '0.0.0';

      if (storedVersion !== CURRENT_VERSION) {
          console.log(`Migrating project ${id} from ${storedVersion} to ${CURRENT_VERSION}`);
          data = migrateData(data, CURRENT_VERSION);

          // Note: We don't automatically save back here to avoid unintentional side effects on load.
          // The application should decide when to persist the migrated data (e.g. on next save).
          // However, the requirements say "Save migrated data back".
          // So I will implement that, but be careful.

          // Deserialize first to ensure it's valid
          const floorplan = deserializeFloorplan(data);

          // Update the stored record with migrated data
          // We preserve original timestamps unless migration changed them
          stored.data = data;
          stored.version = CURRENT_VERSION;

          // We can run this async without awaiting if we don't want to block load,
          // but safer to await to ensure consistency.
          await db.put('projects', stored);

          return floorplan;
      }

      return deserializeFloorplan(data);
  } catch (error) {
      console.error(`Failed to deserialize project ${id}:`, error);
      throw new Error(`Failed to load project: ${(error as Error).message}`);
  }
};

/**
 * Updates an existing project.
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
        const data = p.data as any;

        const rooms = (data && Array.isArray(data.rooms)) ? data.rooms : [];

        const totalArea = rooms.reduce((sum: number, room: any) => {
            if (room.vertices && Array.isArray(room.vertices) && room.vertices.length > 2) {
                return sum + calculatePolygonArea(room.vertices);
            }
            const length = Number(room.length) || 0;
            const width = Number(room.width) || 0;
            return sum + (length * width);
        }, 0);

        return {
            id: p.id,
            name: p.name,
            roomCount: rooms.length,
            totalArea: Number(totalArea.toFixed(2)),
            updatedAt: p.updatedAt,
            thumbnailDataUrl: p.thumbnail
        };
    });
};
