import React, { useEffect, useRef } from 'react';
import { useFloorplanStore } from '../../stores/floorplanStore';
import { calculateArea } from '../../services/geometry/room';
import { RoomTableRow } from './RoomTableRow';
import { useTableNavigation } from '../../hooks/useTableNavigation';
import { useAddRoom } from '../../hooks/useAddRoom';
import { AddRoomButton } from './AddRoomButton';

export const RoomTable: React.FC = () => {
  const currentFloorplan = useFloorplanStore((state) => state.currentFloorplan);
  const selectedRoomId = useFloorplanStore((state) => state.selectedRoomId);
  const updateRoom = useFloorplanStore((state) => state.updateRoom);
  const deleteRoom = useFloorplanStore((state) => state.deleteRoom);
  const selectRoom = useFloorplanStore((state) => state.selectRoom);

  const { addRoom, addRoomWithDefaults } = useAddRoom();

  const rooms = currentFloorplan?.rooms || [];
  const units = currentFloorplan?.units || 'meters';

  const { focusedCell, setFocusedCell } = useTableNavigation({
    rooms,
    onAddRoom: addRoomWithDefaults,
    onDeleteRoom: deleteRoom
  });

  // Effect to focus new room when added
  const prevRoomCountRef = useRef(rooms.length);
  useEffect(() => {
    if (rooms.length > prevRoomCountRef.current) {
        // Room added
        const newRoom = rooms[rooms.length - 1];
        // Focus its first cell (Name)
        setFocusedCell({ roomId: newRoom.id, colIndex: 0 });
        // Select it too
        selectRoom(newRoom.id);
    }
    prevRoomCountRef.current = rooms.length;
  }, [rooms.length, setFocusedCell, selectRoom, rooms]);

  if (!currentFloorplan) {
    return <div>No floorplan loaded</div>;
  }

  if (rooms.length === 0) {
    return (
      <div className="empty-state" data-testid="empty-state">
        <p>No rooms yet. Add your first room to get started.</p>
        <AddRoomButton onAdd={addRoom} />
      </div>
    );
  }

  const totalArea = rooms.reduce((acc, room) => acc + calculateArea(room.length, room.width), 0);
  const totalVolume = rooms.reduce((acc, room) => acc + room.length * room.width * room.height, 0);

  return (
    <div className="room-table-container">
      <table className="room-table w-full border-collapse">
        <thead className="sticky top-0 z-10 bg-white shadow-sm">
          <tr className="bg-gray-50 border-b border-gray-300">
            <th className="p-2 text-left" style={{ width: '150px' }}>Room Name</th>
            <th className="p-2 text-left" style={{ width: '80px' }}>Length</th>
            <th className="p-2 text-left" style={{ width: '80px' }}>Width</th>
            <th className="p-2 text-left" style={{ width: '80px' }}>Height</th>
            <th className="p-2 text-left" style={{ width: '120px' }}>Type</th>
            <th className="p-2 text-left" style={{ width: '80px' }}>Area</th>
            <th className="p-2 text-left" style={{ width: '60px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map((room) => (
            <RoomTableRow
              key={room.id}
              room={room}
              isSelected={selectedRoomId === room.id}
              onSelect={() => selectRoom(room.id)}
              onUpdate={(updates) => updateRoom(room.id, updates)}
              onDelete={() => deleteRoom(room.id)}
              units={units}
              focusedColIndex={focusedCell?.roomId === room.id ? focusedCell.colIndex : undefined}
              otherNames={rooms.filter(r => r.id !== room.id).map(r => r.name)}
            />
          ))}
        </tbody>
        <tfoot>
            <tr>
                <td colSpan={7} className="p-2">
                    <AddRoomButton onAdd={addRoom} />
                </td>
            </tr>
            <tr className="totals-row bg-gray-100 font-medium">
                <td colSpan={5} className="p-2 text-right">Totals</td>
                <td colSpan={2} className="p-2">
                    <div>Area: {totalArea.toFixed(1)} {units === 'meters' ? 'm²' : 'ft²'}</div>
                    <div className="text-xs text-gray-500">Vol: {totalVolume.toFixed(1)} {units === 'meters' ? 'm³' : 'ft³'}</div>
                    <div className="text-xs text-gray-500">{rooms.length} {rooms.length === 1 ? 'room' : 'rooms'}</div>
                </td>
            </tr>
        </tfoot>
      </table>
    </div>
  );
};
