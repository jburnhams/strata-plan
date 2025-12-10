import React, { useEffect, useRef } from 'react';
import { useFloorplanStore } from '../../stores/floorplanStore';
import { RoomTableRow } from './RoomTableRow';
import { useTableNavigation } from '../../hooks/useTableNavigation';
import { useAddRoom } from '../../hooks/useAddRoom';
import { AddRoomButton } from './AddRoomButton';
import { TableTotals } from './TableTotals';
import { useToast } from '../../hooks/use-toast';
import { useTableSort, SortColumn } from '../../hooks/useTableSort';
import { useTableFilter } from '../../hooks/useTableFilter';
import { calculateAutoLayout } from '../../services/layout/autoLayout';
import { TableControls } from './TableControls';
import { validateRoom } from '../../utils/validation';

export const RoomTable: React.FC = () => {
  const currentFloorplan = useFloorplanStore((state) => state.currentFloorplan);
  const selectedRoomId = useFloorplanStore((state) => state.selectedRoomId);
  const updateRoom = useFloorplanStore((state) => state.updateRoom);
  const deleteRoom = useFloorplanStore((state) => state.deleteRoom);
  const selectRoom = useFloorplanStore((state) => state.selectRoom);
  const { toast } = useToast();

  const { addRoom, addRoomWithDefaults } = useAddRoom();

  const rooms = currentFloorplan?.rooms || [];
  const units = currentFloorplan?.units || 'meters';

  const {
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    filteredRooms
  } = useTableFilter(rooms);

  const {
    sortColumn,
    sortDirection,
    sortedRooms,
    toggleSort
  } = useTableSort(filteredRooms);

  const validationSummary = React.useMemo(() => {
    let errors = 0;
    let warnings = 0;

    rooms.forEach((room) => {
      const otherNames = rooms.filter((r) => r.id !== room.id).map((r) => r.name);
      const validations = validateRoom(room, otherNames);

      validations.forEach((v) => {
        if (!v.valid) {
          errors++;
        } else if (v.warning) {
          warnings++;
        }
      });
    });

    return { errors, warnings };
  }, [rooms]);

  const handleValidationClick = () => {
    const firstInvalidRoom = sortedRooms.find((room) => {
      const otherNames = rooms.filter((r) => r.id !== room.id).map((r) => r.name);
      const validations = validateRoom(room, otherNames);
      return validations.some((v) => !v.valid || v.warning);
    });

    if (firstInvalidRoom) {
      const row = document.querySelector(`[data-testid="room-row-${firstInvalidRoom.id}"]`);
      if (row) {
        row.scrollIntoView({ behavior: 'smooth', block: 'center' });
        selectRoom(firstInvalidRoom.id);
      }
    }
  };

  const handleDeleteRoom = (id: string) => {
    deleteRoom(id);
    toast({
      title: "Room deleted",
      description: "The room has been removed from the floorplan.",
    });
  };

  const handleAutoLayout = () => {
    if (window.confirm('This will reset all room positions. Continue?')) {
       // We use sortedRooms to determine the order of layout
       const newPositions = calculateAutoLayout(sortedRooms);

       newPositions.forEach((pos, roomId) => {
           updateRoom(roomId, { position: pos });
       });

       toast({
         title: "Layout Updated",
         description: "Rooms have been re-arranged linearly."
       });
    }
  };

  const { focusedCell, setFocusedCell } = useTableNavigation({
    rooms: sortedRooms, // Use sorted rooms for navigation
    onAddRoom: addRoomWithDefaults,
    onDeleteRoom: handleDeleteRoom
  });

  // Effect to focus new room when added
  const prevRoomCountRef = useRef(rooms.length);
  useEffect(() => {
    if (rooms.length > prevRoomCountRef.current) {
        // Room added
        // Note: sortedRooms might re-order, so finding the "last added" might be tricky if we don't know which one it is.
        // But usually added room is appended. If sorted, it might be anywhere.
        // However, we can track the new room by comparing IDs or assuming store adds it to end of 'rooms' array.
        const newRoom = rooms[rooms.length - 1]; // Use original rooms array to find latest

        // Focus its first cell (Name)
        setFocusedCell({ roomId: newRoom.id, colIndex: 0 });
        // Select it too
        selectRoom(newRoom.id);

        // Show toast
        toast({
          title: "Room added",
          description: `${newRoom.name} created.`,
        });
    }
    prevRoomCountRef.current = rooms.length;
  }, [rooms.length, setFocusedCell, selectRoom, rooms, toast]);

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

  const renderHeader = (label: string, column: SortColumn, width: string) => (
    <th
      className="p-2 text-left cursor-pointer hover:bg-gray-100 select-none group"
      style={{ width }}
      onClick={() => toggleSort(column)}
    >
      <div className="flex items-center gap-1">
        {label}
        {sortColumn === column && (
          <span className="text-xs text-gray-500">
            {sortDirection === 'asc' ? '▲' : '▼'}
          </span>
        )}
        {sortColumn !== column && (
          <span className="text-xs text-gray-300 opacity-0 group-hover:opacity-100">
            ▲
          </span>
        )}
      </div>
    </th>
  );

  return (
    <div className="room-table-container flex flex-col">
      <TableControls
        onAutoLayout={handleAutoLayout}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterType={filterType}
        onFilterTypeChange={setFilterType}
        validationSummary={validationSummary}
        onValidationClick={handleValidationClick}
      />
      <table className="room-table w-full border-collapse">
        <thead className="sticky top-0 z-10 bg-white shadow-sm">
          <tr className="bg-gray-50 border-b border-gray-300">
            {renderHeader('Room Name', 'name', '150px')}
            {renderHeader('Length', 'length', '80px')}
            {renderHeader('Width', 'width', '80px')}
            {renderHeader('Height', 'height', '80px')}
            {renderHeader('Type', 'type', '120px')}
            {renderHeader('Area', 'area', '80px')}
            <th className="p-2 text-left" style={{ width: '60px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedRooms.map((room) => (
            <RoomTableRow
              key={room.id}
              room={room}
              isSelected={selectedRoomId === room.id}
              onSelect={() => selectRoom(room.id)}
              onUpdate={(updates) => updateRoom(room.id, updates)}
              onDelete={() => handleDeleteRoom(room.id)}
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
            <TableTotals rooms={rooms} units={units} />
        </tfoot>
      </table>
    </div>
  );
};
