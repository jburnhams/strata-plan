import React, { useState, useRef, useEffect } from 'react';
import { RoomType } from '../../../types';
import { ROOM_TYPE_COLORS } from '../../../constants/colors';

interface SelectCellProps {
  value: RoomType;
  onCommit: (value: RoomType) => void;
  options: RoomType[];
  className?: string;
  isFocused?: boolean;
}

export const SelectCell: React.FC<SelectCellProps> = ({
  value,
  onCommit,
  options,
  className,
  isFocused = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const selectRef = useRef<HTMLSelectElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing && selectRef.current) {
      selectRef.current.focus();
    }
  }, [isEditing]);

  useEffect(() => {
    if (isFocused && !isEditing && containerRef.current) {
      containerRef.current.focus();
    }
  }, [isFocused, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value as RoomType;
    onCommit(newValue);
    setIsEditing(false);
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsEditing(false);
    } else if (e.key === 'Enter') {
        // Typically select captures enter, but just in case
        setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <select
        ref={selectRef}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`w-full p-1 border rounded ${className || ''}`}
        aria-label="Select room type"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }

  return (
    <div
      ref={containerRef}
      onClick={() => setIsEditing(true)}
      className={`cursor-pointer p-1 min-h-[1.5em] hover:bg-gray-100 rounded flex items-center gap-2 ${isFocused ? 'ring-2 ring-blue-400' : ''} ${className || ''}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') setIsEditing(true);
      }}
    >
      <span
        className="w-3 h-3 rounded-full border border-gray-300"
        style={{ backgroundColor: ROOM_TYPE_COLORS[value] }}
      />
      {value}
    </div>
  );
};
