import React from 'react';
import { Room, MeasurementUnit, RoomType } from '../../types';
import { calculateArea } from '../../services/geometry/room';
import { ROOM_TYPE_COLORS } from '../../constants/colors';
import { TextCell } from './cells/TextCell';
import { NumberCell } from './cells/NumberCell';
import { SelectCell } from './cells/SelectCell';
import { DisplayCell } from './cells/DisplayCell';
import { ActionCell } from './cells/ActionCell';
import {
  validateRoomName,
  validateRoomDimension,
  validateCeilingHeight,
  ValidationResult
} from '../../utils/validation';
import { ValidationState } from './ValidationIndicator';

interface RoomTableRowProps {
  room: Room;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<Room>) => void;
  onDelete: () => void;
  units: MeasurementUnit;
  focusedColIndex?: number | null;
  otherNames?: string[];
}

export const RoomTableRow: React.FC<RoomTableRowProps> = ({
  room,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  units,
  focusedColIndex,
  otherNames = []
}) => {
  // We manage local state for inputs to allow smooth typing,
  // but commit to store via onUpdate (which can be debounced or immediate)

  const handleNameChange = (name: string) => {
    onUpdate({ name });
  };

  const handleLengthChange = (length: number) => {
    onUpdate({ length });
  };

  const handleWidthChange = (width: number) => {
    onUpdate({ width });
  };

  const handleHeightChange = (height: number) => {
    onUpdate({ height });
  };

  const handleTypeChange = (type: RoomType) => {
    onUpdate({ type });
  };

  const area = calculateArea(room.length, room.width);
  const formattedArea = area.toFixed(1);

  const roomTypes: RoomType[] = [
    'bedroom', 'kitchen', 'bathroom', 'living', 'dining',
    'office', 'hallway', 'closet', 'garage', 'other'
  ];

  // Validation
  const nameValidation = validateRoomName(room.name, otherNames);
  const lengthValidation = validateRoomDimension(room.length, 'Length');
  const widthValidation = validateRoomDimension(room.width, 'Width');
  const heightValidation = validateCeilingHeight(room.height);

  const getValidationState = (res: ValidationResult): ValidationState => {
      if (!res.valid) return 'error';
      if (res.warning) return 'warning';
      return 'valid';
  };

  const getValidationMessage = (res: ValidationResult): string | undefined => {
      if (!res.valid) return res.error;
      return res.warning;
  };

  const validations = [nameValidation, lengthValidation, widthValidation, heightValidation];
  const hasError = validations.some(v => !v.valid);
  const hasWarning = validations.some(v => v.warning);

  const validationSummary = validations
    .flatMap(v => [v.error, v.warning])
    .filter((msg): msg is string => !!msg)
    .join('\n');

  return (
    <tr
      onClick={onSelect}
      title={validationSummary}
      className={`
        group
        ${isSelected ? 'bg-blue-50 ring-2 ring-blue-400 z-10 relative' : ''}
        ${hasError ? 'border-l-4 border-l-red-500' : hasWarning ? 'border-l-4 border-l-yellow-500' : 'border-l-4 border-l-transparent'}
        hover:bg-opacity-80
        transition-colors
      `}
      style={{
        backgroundColor: !isSelected ? `${ROOM_TYPE_COLORS[room.type]}20` : undefined
      }}
      data-testid={`room-row-${room.id}`}
    >
      <td className="p-0 border-b border-gray-200">
        <TextCell
          value={room.name}
          onCommit={handleNameChange}
          isFocused={focusedColIndex === 0}
          validationState={getValidationState(nameValidation)}
          validationMessage={getValidationMessage(nameValidation)}
        />
      </td>
      <td className="p-0 border-b border-gray-200">
        <NumberCell
          value={room.length}
          unit={units}
          onCommit={handleLengthChange}
          min={0.1}
          isFocused={focusedColIndex === 1}
          validationState={getValidationState(lengthValidation)}
          validationMessage={getValidationMessage(lengthValidation)}
        />
      </td>
      <td className="p-0 border-b border-gray-200">
        <NumberCell
          value={room.width}
          unit={units}
          onCommit={handleWidthChange}
          min={0.1}
          isFocused={focusedColIndex === 2}
          validationState={getValidationState(widthValidation)}
          validationMessage={getValidationMessage(widthValidation)}
        />
      </td>
      <td className="p-0 border-b border-gray-200">
        <NumberCell
          value={room.height}
          unit={units}
          onCommit={handleHeightChange}
          min={1.5}
          max={4.0}
          isFocused={focusedColIndex === 3}
          validationState={getValidationState(heightValidation)}
          validationMessage={getValidationMessage(heightValidation)}
        />
      </td>
      <td className="p-0 border-b border-gray-200">
        <SelectCell value={room.type} options={roomTypes} onCommit={handleTypeChange} isFocused={focusedColIndex === 4} />
      </td>
      <td className="p-0 border-b border-gray-200">
        <DisplayCell value={formattedArea} unit={units === 'meters' ? 'm²' : 'ft²'} />
      </td>
      <td className="p-0 border-b border-gray-200">
        <ActionCell onDelete={onDelete} className="opacity-0 group-hover:opacity-100 focus-within:opacity-100" />
      </td>
    </tr>
  );
};
