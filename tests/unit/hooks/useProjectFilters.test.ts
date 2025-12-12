import { renderHook, act } from '@testing-library/react';
import { useProjectFilters, SortOption } from '../../../src/hooks/useProjectFilters';
import { ProjectMetadata } from '../../../src/types/floorplan';

const mockProjects: ProjectMetadata[] = [
  { id: '1', name: 'Project A', updatedAt: new Date('2023-01-01'), totalArea: 50, roomCount: 2 },
  { id: '2', name: 'Project B', updatedAt: new Date('2023-01-02'), totalArea: 100, roomCount: 3 },
  { id: '3', name: 'Project C', updatedAt: new Date('2023-01-03'), totalArea: 25, roomCount: 1 },
];

describe('useProjectFilters', () => {
  it('filters projects by name', () => {
    const { result } = renderHook(() => useProjectFilters(mockProjects));

    act(() => {
      result.current.setSearchQuery('Project A');
    });

    expect(result.current.filteredProjects).toHaveLength(1);
    expect(result.current.filteredProjects[0].id).toBe('1');
  });

  it('filters projects by name case-insensitive', () => {
    const { result } = renderHook(() => useProjectFilters(mockProjects));

    act(() => {
      result.current.setSearchQuery('project b');
    });

    expect(result.current.filteredProjects).toHaveLength(1);
    expect(result.current.filteredProjects[0].id).toBe('2');
  });

  it('sorts by newest first (default)', () => {
    const { result } = renderHook(() => useProjectFilters(mockProjects));
    // Default is 'newest'
    expect(result.current.filteredProjects[0].id).toBe('3');
    expect(result.current.filteredProjects[1].id).toBe('2');
    expect(result.current.filteredProjects[2].id).toBe('1');
  });

  it('sorts by oldest first', () => {
    const { result } = renderHook(() => useProjectFilters(mockProjects));
    act(() => {
      result.current.setSortBy('oldest');
    });
    expect(result.current.filteredProjects[0].id).toBe('1');
    expect(result.current.filteredProjects[1].id).toBe('2');
    expect(result.current.filteredProjects[2].id).toBe('3');
  });

  it('sorts by area descending', () => {
    const { result } = renderHook(() => useProjectFilters(mockProjects));
    act(() => {
      result.current.setSortBy('area-desc');
    });
    expect(result.current.filteredProjects[0].id).toBe('2'); // 100
    expect(result.current.filteredProjects[1].id).toBe('1'); // 50
    expect(result.current.filteredProjects[2].id).toBe('3'); // 25
  });

  it('sorts by name ascending', () => {
    const projects: ProjectMetadata[] = [
      { id: '1', name: 'Zebra', updatedAt: new Date(), totalArea: 0, roomCount: 0 },
      { id: '2', name: 'Apple', updatedAt: new Date(), totalArea: 0, roomCount: 0 },
    ];
    const { result } = renderHook(() => useProjectFilters(projects));

    act(() => {
      result.current.setSortBy('name-asc');
    });

    expect(result.current.filteredProjects[0].name).toBe('Apple');
    expect(result.current.filteredProjects[1].name).toBe('Zebra');
  });
});
