import React from 'react';
import { Room, MeasurementUnit } from '../../types';
import { calculateArea } from '../../services/geometry/room';

interface TableTotalsProps {
  rooms: Room[];
  units: MeasurementUnit;
}

export const TableTotals: React.FC<TableTotalsProps> = ({ rooms, units }) => {
  const totalArea = rooms.reduce((acc, room) => acc + calculateArea(room.length, room.width), 0);
  const totalVolume = rooms.reduce((acc, room) => acc + room.length * room.width * room.height, 0);

  return (
    <tr className="totals-row bg-gray-100 font-medium border-t-2 border-gray-200">
      <td colSpan={5} className="p-2 text-right font-bold text-gray-700">Totals</td>
      <td colSpan={2} className="p-2">
        <div className="flex flex-col gap-1">
          <div className="text-sm font-semibold text-gray-900">
            Area: {totalArea.toFixed(1)} {units === 'meters' ? 'm²' : 'ft²'}
          </div>
          <div className="text-xs text-gray-500">
            Vol: {totalVolume.toFixed(1)} {units === 'meters' ? 'm³' : 'ft³'}
          </div>
          <div className="text-xs text-gray-500 italic">
            {rooms.length} {rooms.length === 1 ? 'room' : 'rooms'}
          </div>
        </div>
      </td>
    </tr>
  );
};
