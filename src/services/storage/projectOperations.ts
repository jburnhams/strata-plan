import { loadProject, saveProject, deleteProject as deleteProjectStorage } from './projectStorage';
import { v4 as uuidv4 } from 'uuid';
import { Floorplan } from '../../types';

/**
 * Duplicates a project by ID.
 * Returns the ID of the new project.
 */
export const duplicateProject = async (id: string): Promise<string> => {
  const originalProject = await loadProject(id);
  if (!originalProject) {
    throw new Error(`Project ${id} not found`);
  }

  const newId = uuidv4();
  const newName = `${originalProject.name} (copy)`;

  const newProject = {
    ...originalProject,
    id: newId,
    name: newName,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await saveProject(newProject);
  return newId;
};

/**
 * Updates a project.
 */
export const updateProject = async (project: Floorplan): Promise<void> => {
    await saveProject(project);
};

/**
 * Deletes a project by ID.
 */
export const deleteProject = async (id: string): Promise<void> => {
    await deleteProjectStorage(id);
};
