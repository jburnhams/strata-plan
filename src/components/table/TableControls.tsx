import React from 'react';
import { RoomType } from '../../types';
import { Search, Filter } from 'lucide-react';

interface TableControlsProps {
  onAutoLayout: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterType: RoomType | 'all';
  onFilterTypeChange: (value: RoomType | 'all') => void;
}

const ROOM_TYPES: (RoomType | 'all')[] = [
  'all',
  'bedroom',
  'kitchen',
  'bathroom',
  'living',
  'dining',
  'office',
  'hallway',
  'closet',
  'garage',
  'other',
];

export const TableControls: React.FC<TableControlsProps> = ({
  onAutoLayout,
  searchTerm,
  onSearchChange,
  filterType,
  onFilterTypeChange,
}) => {
  return (
    <div className="flex justify-between items-center p-2 bg-white border-b border-gray-200">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold text-gray-700 mr-2">Rooms</h3>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search rooms..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 pr-3 py-1 text-sm border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 w-48"
          />
        </div>

        {/* Filter Type */}
        <div className="relative">
          <Filter className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <select
            value={filterType}
            onChange={(e) => onFilterTypeChange(e.target.value as RoomType | 'all')}
            className="pl-8 pr-3 py-1 text-sm border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
          >
            {ROOM_TYPES.map((type) => (
              <option key={type} value={type}>
                {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onAutoLayout}
          className="px-3 py-1 text-sm text-gray-700 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 transition-colors"
          title="Reset room positions to a linear layout"
        >
          Re-layout
        </button>
      </div>
    </div>
  );
};
