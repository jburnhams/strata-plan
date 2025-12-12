import { useState, useEffect, useCallback } from 'react';
import { loadProject } from '@/services/storage/projectStorage';
import { Floorplan } from '@/types/floorplan';

interface UseProjectResult {
  project: Floorplan | null;
  loading: boolean;
  error: Error | null;
  reload: () => Promise<void>;
}

export function useProject(id: string | null): UseProjectResult {
  const [project, setProject] = useState<Floorplan | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchProject = useCallback(async () => {
    if (!id) {
        setProject(null);
        setLoading(false);
        return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await loadProject(id);
      setProject(data);
    } catch (err) {
      console.error('Error loading project:', err);
      setError(err instanceof Error ? err : new Error('Unknown error loading project'));
      setProject(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let isActive = true;

    const load = async () => {
        if (!id) {
            if (isActive) {
                setProject(null);
                setLoading(false);
            }
            return;
        }

        if (isActive) setLoading(true);
        if (isActive) setError(null);

        try {
            const data = await loadProject(id);
            if (isActive) {
                setProject(data);
            }
        } catch (err) {
            if (isActive) {
                console.error('Error loading project:', err);
                setError(err instanceof Error ? err : new Error('Unknown error loading project'));
                setProject(null);
            }
        } finally {
            if (isActive) {
                setLoading(false);
            }
        }
    };

    load();

    return () => {
        isActive = false;
    };
  }, [id]);

  return { project, loading, error, reload: fetchProject };
}
