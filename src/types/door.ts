import { WallSide } from './geometry';

export type DoorType = 'single' | 'double' | 'sliding' | 'pocket' | 'bifold';
export type DoorSwing = 'inward' | 'outward';
export type HandleSide = 'left' | 'right';

export interface Door {
  id: string;
  roomId: string; // Room this door belongs to
  connectionId?: string; // Link to RoomConnection (for interior doors)
  wallSide: WallSide; // Which wall of the room
  position: number; // 0.0-1.0 along wall (from left/top)
  width: number; // Default 0.9m
  height: number; // Default 2.1m
  type: DoorType;
  swing: DoorSwing;
  handleSide: HandleSide;
  isExterior: boolean; // Exterior doors (no connection)
}

export const DOOR_DEFAULTS = {
  width: 0.9,
  height: 2.1,
  type: 'single' as DoorType,
  swing: 'inward' as DoorSwing,
  handleSide: 'left' as HandleSide,
  isExterior: false,
};

export const validateDoor = (
  door: Partial<Door> & { width: number; height: number; position: number }
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Width validation
  if (door.type === 'single') {
    if (door.width < 0.5 || door.width > 1.5) {
      errors.push('Single door width must be between 0.5m and 1.5m');
    }
  } else if (door.type === 'double') {
    if (door.width < 1.0 || door.width > 2.5) {
      errors.push('Double door width must be between 1.0m and 2.5m');
    }
  } else {
    // Other types default range (sliding, pocket, bifold)
    if (door.width < 0.5 || door.width > 3.0) {
      errors.push('Door width must be between 0.5m and 3.0m');
    }
  }

  // Height validation
  if (door.height < 1.8 || door.height > 2.5) {
    errors.push('Door height must be between 1.8m and 2.5m');
  }

  // Position validation
  if (door.position < 0 || door.position > 1) {
    errors.push('Door position must be between 0.0 and 1.0');
  }

  // We can't validate "position must keep door within wall bounds" here without wall length
  // That validation should happen at the service/hook level or passed as context

  return {
    isValid: errors.length === 0,
    errors,
  };
};
