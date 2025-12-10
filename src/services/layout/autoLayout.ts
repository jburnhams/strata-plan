import { Room, Position2D } from '../../types';

export const GAP = 1; // Default gap between rooms in meters

export const calculateAutoLayout = (rooms: Room[]): Map<string, Position2D> => {
  const newPositions = new Map<string, Position2D>();
  let currentX = 0;

  rooms.forEach((room) => {
    newPositions.set(room.id, { x: currentX, z: 0 });
    // Assuming rooms are axis-aligned for now, otherwise we might need bounding boxes
    // For 2D layout, we primarily care about width/length.
    // However, room.length is usually along X axis if rotation is 0.
    // If rotation is 90, width is along X.
    // For simplicity, we assume simple packing along X axis using room.length.
    // If we want to support rotation, we should inspect room.rotation.

    // Using a simpler approach: layout based on current length regardless of rotation
    // assuming they are reset to 0 rotation or we respect the bounding box width.
    // But calculateAutoLayout usually resets positions. Does it reset rotation?
    // The spec says "Positions rooms left-to-right".

    // Let's use room.length as the X-dimension size for simplicity as per MVP spec.
    currentX += room.length + GAP;
  });

  return newPositions;
};
