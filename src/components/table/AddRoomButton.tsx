import React from 'react';
import { RoomType } from '../../types';
import { ROOM_TYPE_COLORS } from '../../constants/colors';

interface AddRoomButtonProps {
  onAdd: (type?: RoomType) => void;
  className?: string;
}

export const AddRoomButton: React.FC<AddRoomButtonProps> = ({ onAdd, className }) => {
  const quickTypes: RoomType[] = ['bedroom', 'kitchen', 'bathroom', 'living'];

  return (
    <div className={`flex flex-col gap-2 ${className || ''}`}>
      <div className="flex gap-2 justify-center mb-1">
        {quickTypes.map((type) => (
          <button
            key={type}
            onClick={() => onAdd(type)}
            className="flex items-center gap-1 px-2 py-1 text-xs rounded border hover:bg-gray-50 transition-colors"
            style={{ borderColor: ROOM_TYPE_COLORS[type] }}
            title={`Add ${type}`}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: ROOM_TYPE_COLORS[type] }}
            />
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>
      <button
        className="add-room-button-footer w-full p-2 border-2 border-dashed border-gray-300 rounded hover:bg-gray-50 text-gray-500 font-medium transition-colors"
        onClick={() => onAdd()}
      >
        + Add Room
      </button>
    </div>
  );
};
