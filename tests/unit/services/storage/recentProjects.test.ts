import { addToRecentProjects, getRecentProjects, removeFromRecentProjects } from '../../../../src/services/storage/recentProjects';
import { loadProject } from '../../../../src/services/storage/projectStorage';

// Mock dependencies
jest.mock('../../../../src/services/storage/projectStorage');

describe('recentProjects Service', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('adds a project ID to local storage', async () => {
    await addToRecentProjects('proj-1');
    expect(JSON.parse(localStorage.getItem('recent_projects') || '[]')).toEqual(['proj-1']);
  });

  it('moves existing project to top when added again', async () => {
    await addToRecentProjects('proj-1');
    await addToRecentProjects('proj-2');
    await addToRecentProjects('proj-1'); // Re-add proj-1

    const recent = JSON.parse(localStorage.getItem('recent_projects') || '[]');
    expect(recent).toEqual(['proj-1', 'proj-2']);
  });

  it('limits recent projects to 10', async () => {
    for (let i = 1; i <= 15; i++) {
      await addToRecentProjects(`proj-${i}`);
    }

    const recent = JSON.parse(localStorage.getItem('recent_projects') || '[]');
    expect(recent.length).toBe(10);
    expect(recent[0]).toBe('proj-15'); // Most recent
    expect(recent[9]).toBe('proj-6');  // Oldest allowed
  });

  it('retrieves project metadata for recent IDs', async () => {
    // Setup mock data
    (loadProject as jest.Mock).mockImplementation(async (id) => ({
      id,
      name: `Project ${id}`,
      updatedAt: new Date(),
      rooms: [],
    }));

    await addToRecentProjects('proj-1');
    await addToRecentProjects('proj-2');

    const projects = await getRecentProjects();

    expect(projects).toHaveLength(2);
    expect(projects[0].id).toBe('proj-2');
    expect(projects[1].id).toBe('proj-1');
    expect(projects[0].name).toBe('Project proj-2');
  });

  it('removes deleted projects from recent list lazily', async () => {
    // proj-1 exists, proj-2 does not
    (loadProject as jest.Mock).mockImplementation(async (id) => {
      if (id === 'proj-1') {
        return {
            id,
            name: `Project ${id}`,
            updatedAt: new Date(),
            rooms: [],
        };
      }
      return null;
    });

    await addToRecentProjects('proj-1');
    await addToRecentProjects('proj-2');

    const projects = await getRecentProjects();

    expect(projects).toHaveLength(1);
    expect(projects[0].id).toBe('proj-1');

    // Verify proj-2 was removed from storage
    const stored = JSON.parse(localStorage.getItem('recent_projects') || '[]');
    expect(stored).toEqual(['proj-1']);
  });

  it('removes a project manually', async () => {
    await addToRecentProjects('proj-1');
    await addToRecentProjects('proj-2');

    await removeFromRecentProjects('proj-1');

    const stored = JSON.parse(localStorage.getItem('recent_projects') || '[]');
    expect(stored).toEqual(['proj-2']);
  });
});
