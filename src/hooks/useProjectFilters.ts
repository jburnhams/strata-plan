import { useState, useMemo } from 'react';
import { ProjectMetadata } from '../types/floorplan';

export type SortOption = 'newest' | 'oldest' | 'name-asc' | 'name-desc' | 'area-desc' | 'area-asc';

export function useProjectFilters(projects: ProjectMetadata[]) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  const filteredProjects = useMemo(() => {
    let result = [...projects];

    // Filter by name
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((p) =>
        p.name.toLowerCase().includes(query)
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'oldest':
          return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'area-desc':
          return (b.totalArea || 0) - (a.totalArea || 0);
        case 'area-asc':
          return (a.totalArea || 0) - (b.totalArea || 0);
        default:
          return 0;
      }
    });

    return result;
  }, [projects, searchQuery, sortBy]);

  return {
    filteredProjects,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
  };
}
