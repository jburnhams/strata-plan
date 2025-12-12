import { ProjectMetadata } from '../../types/floorplan';
import { loadProject } from './projectStorage';

const MAX_RECENT_PROJECTS = 10;
const RECENT_PROJECTS_KEY = 'recent_projects';

// We'll store just the IDs in local storage for speed, but this service will
// return full metadata by fetching from IDB when requested.

export async function addToRecentProjects(id: string): Promise<void> {
  try {
    const recentIds = getRecentProjectIds();

    // Remove if already exists to move to top
    const filtered = recentIds.filter(projectId => projectId !== id);

    // Add to beginning
    const updated = [id, ...filtered].slice(0, MAX_RECENT_PROJECTS);

    saveRecentProjectIds(updated);
  } catch (error) {
    console.error('Failed to update recent projects:', error);
  }
}

export async function getRecentProjects(): Promise<ProjectMetadata[]> {
  try {
    const ids = getRecentProjectIds();
    const projects: ProjectMetadata[] = [];

    for (const id of ids) {
      try {
        const project = await loadProject(id);
        if (project) {
          // Extract metadata
          // TODO: Improve metadata calculation to match listProjects
          const totalArea = project.rooms.reduce((sum, room) => sum + (room.length * room.width), 0);

          projects.push({
            id: project.id,
            name: project.name,
            updatedAt: project.updatedAt,
            roomCount: project.rooms.length,
            totalArea: Number(totalArea.toFixed(2)),
            thumbnailDataUrl: undefined // Thumbnail handling might need update
          });
        } else {
          // Project might have been deleted but still in recent list
          // We'll clean it up lazily
          await removeFromRecentProjects(id);
        }
      } catch (e) {
        console.warn(`Failed to load recent project ${id}`, e);
      }
    }

    return projects;
  } catch (error) {
    console.error('Failed to get recent projects:', error);
    return [];
  }
}

export async function removeFromRecentProjects(id: string): Promise<void> {
  const recentIds = getRecentProjectIds();
  const updated = recentIds.filter(projectId => projectId !== id);
  saveRecentProjectIds(updated);
}

// Helpers for localStorage persistence of IDs
function getRecentProjectIds(): string[] {
  try {
    const json = localStorage.getItem(RECENT_PROJECTS_KEY);
    return json ? JSON.parse(json) : [];
  } catch {
    return [];
  }
}

function saveRecentProjectIds(ids: string[]): void {
  localStorage.setItem(RECENT_PROJECTS_KEY, JSON.stringify(ids));
}
