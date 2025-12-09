import { saveProject, loadProject, projectExists } from '@/services/storage/projectStorage';
import { Floorplan } from '@/types/floorplan';
import { v4 as uuidv4 } from 'uuid';

/**
 * Immediate save, bypassing debounce.
 */
export const saveNow = async (floorplan: Floorplan): Promise<void> => {
    await saveProject(floorplan);
};

/**
 * Creates a new project with a new ID based on the current one.
 * Returns the new project ID.
 */
export const saveAs = async (floorplan: Floorplan, newName: string): Promise<string> => {
    const newId = uuidv4();
    const newFloorplan: Floorplan = {
        ...floorplan,
        id: newId,
        name: newName,
        createdAt: new Date(),
        updatedAt: new Date(),
        // We might want to reset version or keep it
    };

    await saveProject(newFloorplan);
    return newId;
};

/**
 * Reverts the current project to the last saved version.
 * Returns the loaded floorplan.
 */
export const revertToSaved = async (projectId: string): Promise<Floorplan> => {
    const saved = await loadProject(projectId);
    if (!saved) {
        throw new Error('No saved version found for this project');
    }
    return saved;
};
