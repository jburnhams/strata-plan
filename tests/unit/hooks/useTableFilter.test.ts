import { renderHook, act, waitFor } from '@testing-library/react';
import { useTableFilter } from '../../../src/hooks/useTableFilter';
import { Room } from '../../../src/types';

describe('useTableFilter', () => {
  const mockRooms: Room[] = [
    { id: '1', name: 'Master Bedroom', length: 5, width: 4, height: 3, type: 'bedroom', position: { x: 0, z: 0 }, rotation: 0, doors: [], windows: [] },
    { id: '2', name: 'Kitchen', length: 3, width: 3, height: 3, type: 'kitchen', position: { x: 0, z: 0 }, rotation: 0, doors: [], windows: [] },
    { id: '3', name: 'Living Room', length: 4, width: 5, height: 3, type: 'living', position: { x: 0, z: 0 }, rotation: 0, doors: [], windows: [] },
    { id: '4', name: 'Guest Bedroom', length: 3, width: 3, height: 3, type: 'bedroom', position: { x: 0, z: 0 }, rotation: 0, doors: [], windows: [] },
  ];

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns all rooms initially', () => {
    const { result } = renderHook(() => useTableFilter(mockRooms));
    expect(result.current.filteredRooms).toEqual(mockRooms);
    expect(result.current.searchTerm).toBe('');
    expect(result.current.filterType).toBe('all');
  });

  it('filters by name', async () => {
    const { result } = renderHook(() => useTableFilter(mockRooms));

    act(() => {
      result.current.setSearchTerm('Bedroom');
    });

    // Advance timers for debounce
    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current.filteredRooms).toHaveLength(2);
    expect(result.current.filteredRooms.map(r => r.name)).toEqual(['Master Bedroom', 'Guest Bedroom']);
  });

  it('filters by type', () => {
    const { result } = renderHook(() => useTableFilter(mockRooms));

    act(() => {
      result.current.setFilterType('kitchen');
    });

    expect(result.current.filteredRooms).toHaveLength(1);
    expect(result.current.filteredRooms[0].name).toBe('Kitchen');
  });

  it('filters by name and type combined', () => {
    const { result } = renderHook(() => useTableFilter(mockRooms));

    act(() => {
      result.current.setSearchTerm('Master');
      result.current.setFilterType('bedroom');
    });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current.filteredRooms).toHaveLength(1);
    expect(result.current.filteredRooms[0].name).toBe('Master Bedroom');
  });

  it('returns empty array when no matches', () => {
    const { result } = renderHook(() => useTableFilter(mockRooms));

    act(() => {
      result.current.setSearchTerm('Pool');
    });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current.filteredRooms).toHaveLength(0);
  });
});
