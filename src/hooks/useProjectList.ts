import { useState, useEffect, useCallback } from 'react';
import { listProjects, ProjectMetadata } from '@/services/storage/projectStorage';

interface UseProjectListResult {
  projects: ProjectMetadata[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useProjectList(): UseProjectListResult {
  const [projects, setProjects] = useState<ProjectMetadata[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listProjects();
      setProjects(data);
    } catch (err) {
      console.error('Error listing projects:', err);
      setError(err instanceof Error ? err : new Error('Unknown error listing projects'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return { projects, loading, error, refresh: fetchProjects };
}
