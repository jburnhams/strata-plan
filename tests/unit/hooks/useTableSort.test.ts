import { renderHook, act } from '@testing-library/react';
import { useTableSort } from '../../../src/hooks/useTableSort';
import { Room } from '../../../src/types';

describe('useTableSort', () => {
  const mockRooms: Room[] = [
    { id: '1', name: 'B Room', length: 5, width: 4, height: 3, type: 'bedroom', position: { x: 0, z: 0 }, rotation: 0, doors: [], windows: [] },
    { id: '2', name: 'A Room', length: 3, width: 3, height: 3, type: 'kitchen', position: { x: 0, z: 0 }, rotation: 0, doors: [], windows: [] },
    { id: '3', name: 'C Room', length: 4, width: 5, height: 3, type: 'living', position: { x: 0, z: 0 }, rotation: 0, doors: [], windows: [] },
  ];

  it('returns original order initially', () => {
    const { result } = renderHook(() => useTableSort(mockRooms));
    expect(result.current.sortedRooms).toEqual(mockRooms);
    expect(result.current.sortColumn).toBeNull();
  });

  it('sorts by name ascending', () => {
    const { result } = renderHook(() => useTableSort(mockRooms));

    act(() => {
      result.current.toggleSort('name');
    });

    expect(result.current.sortedRooms[0].name).toBe('A Room');
    expect(result.current.sortedRooms[1].name).toBe('B Room');
    expect(result.current.sortedRooms[2].name).toBe('C Room');
  });

  it('sorts by name descending', () => {
    const { result } = renderHook(() => useTableSort(mockRooms));

    act(() => {
      result.current.toggleSort('name'); // asc
    });
    act(() => {
      result.current.toggleSort('name'); // desc
    });

    expect(result.current.sortedRooms[0].name).toBe('C Room');
    expect(result.current.sortedRooms[1].name).toBe('B Room');
    expect(result.current.sortedRooms[2].name).toBe('A Room');
  });

  it('sorts by length', () => {
    const { result } = renderHook(() => useTableSort(mockRooms));

    act(() => {
      result.current.toggleSort('length');
    });

    // 3, 4, 5
    expect(result.current.sortedRooms[0].length).toBe(3);
    expect(result.current.sortedRooms[1].length).toBe(4);
    expect(result.current.sortedRooms[2].length).toBe(5);
  });

  it('sorts by area', () => {
    const { result } = renderHook(() => useTableSort(mockRooms));

    act(() => {
      result.current.toggleSort('area');
    });

    // Areas: 20 (5*4), 9 (3*3), 20 (4*5)
    // Order: 9, 20, 20 (stable sort depends on browser implementation, but 9 is definitely first)
    expect(result.current.sortedRooms[0].id).toBe('2'); // Area 9
  });
});
