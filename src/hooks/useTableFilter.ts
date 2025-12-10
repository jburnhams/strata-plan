import { useState, useMemo } from 'react';
import { Room, RoomType } from '../types';
import { useDebounce } from './useDebounce';

interface UseTableFilterReturn {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterType: RoomType | 'all';
  setFilterType: (type: RoomType | 'all') => void;
  filteredRooms: Room[];
}

export const useTableFilter = (rooms: Room[]): UseTableFilterReturn => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<RoomType | 'all'>('all');

  // Debounce search term to avoid excessive filtering on every keystroke
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      // Name filter (case insensitive)
      if (debouncedSearchTerm) {
        if (!room.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())) {
          return false;
        }
      }

      // Type filter
      if (filterType !== 'all') {
        if (room.type !== filterType) {
          return false;
        }
      }

      return true;
    });
  }, [rooms, debouncedSearchTerm, filterType]);

  return {
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    filteredRooms,
  };
};
