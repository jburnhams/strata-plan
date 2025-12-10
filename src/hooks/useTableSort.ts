import { useState, useMemo, useCallback } from 'react';
import { Room } from '../types';

export type SortDirection = 'asc' | 'desc';
export type SortColumn = 'name' | 'length' | 'width' | 'height' | 'type' | 'area';

interface UseTableSortReturn {
  sortColumn: SortColumn | null;
  sortDirection: SortDirection;
  sortedRooms: Room[];
  toggleSort: (column: SortColumn) => void;
}

export const useTableSort = (rooms: Room[]): UseTableSortReturn => {
  const [sortColumn, setSortColumn] = useState<SortColumn | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const toggleSort = useCallback((column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  }, [sortColumn]);

  const sortedRooms = useMemo(() => {
    if (!sortColumn) return rooms;

    return [...rooms].sort((a, b) => {
      let valueA: any;
      let valueB: any;

      switch (sortColumn) {
        case 'name':
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
          break;
        case 'length':
          valueA = a.length;
          valueB = b.length;
          break;
        case 'width':
          valueA = a.width;
          valueB = b.width;
          break;
        case 'height':
          valueA = a.height;
          valueB = b.height;
          break;
        case 'type':
          valueA = a.type;
          valueB = b.type;
          break;
        case 'area':
          valueA = a.length * a.width;
          valueB = b.length * b.width;
          break;
        default:
          return 0;
      }

      if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [rooms, sortColumn, sortDirection]);

  return {
    sortColumn,
    sortDirection,
    sortedRooms,
    toggleSort,
  };
};
