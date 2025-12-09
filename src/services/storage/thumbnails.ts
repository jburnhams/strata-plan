import { Floorplan, Room } from '@/types';
import { ROOM_TYPE_COLORS } from '@/constants/colors';

const THUMBNAIL_WIDTH = 200;
const THUMBNAIL_HEIGHT = 150;
const PADDING = 10;
const BACKGROUND_COLOR = '#ffffff';
const STROKE_COLOR = '#000000';
const STROKE_WIDTH = 2;

/**
 * Generates a base64 data URL thumbnail for a floorplan
 * Renders a simplified 2D view of the rooms
 */
export async function generateThumbnail(floorplan: Floorplan): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = THUMBNAIL_WIDTH;
  canvas.height = THUMBNAIL_HEIGHT;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to get 2D context for thumbnail generation');
  }

  // Clear background
  ctx.fillStyle = BACKGROUND_COLOR;
  ctx.fillRect(0, 0, THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT);

  const rooms = floorplan.rooms;
  if (!rooms || rooms.length === 0) {
    // Return empty placeholder if no rooms
    return canvas.toDataURL('image/jpeg', 0.8);
  }

  // Calculate bounding box
  let minX = Infinity;
  let maxX = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;

  rooms.forEach((room) => {
    // Determine effective dimensions based on rotation
    let effectiveWidth = room.length;
    let effectiveHeight = room.width;

    if (room.rotation === 90 || room.rotation === 270) {
      effectiveWidth = room.width;
      effectiveHeight = room.length;
    }

    minX = Math.min(minX, room.position.x);
    maxX = Math.max(maxX, room.position.x + effectiveWidth);
    minZ = Math.min(minZ, room.position.z);
    maxZ = Math.max(maxZ, room.position.z + effectiveHeight);
  });

  const contentWidth = maxX - minX;
  const contentHeight = maxZ - minZ;

  // Calculate scaling factor to fit in thumbnail (preserving aspect ratio)
  // Available space minus padding
  const availWidth = THUMBNAIL_WIDTH - 2 * PADDING;
  const availHeight = THUMBNAIL_HEIGHT - 2 * PADDING;

  const scaleX = availWidth / contentWidth;
  const scaleY = availHeight / contentHeight;
  const scale = Math.min(scaleX, scaleY);

  // Center content
  const offsetX = (THUMBNAIL_WIDTH - contentWidth * scale) / 2;
  const offsetY = (THUMBNAIL_HEIGHT - contentHeight * scale) / 2;

  // Draw rooms
  rooms.forEach((room) => {
    let effectiveWidth = room.length;
    let effectiveHeight = room.width;

    if (room.rotation === 90 || room.rotation === 270) {
      effectiveWidth = room.width;
      effectiveHeight = room.length;
    }

    const x = offsetX + (room.position.x - minX) * scale;
    const y = offsetY + (room.position.z - minZ) * scale;
    const w = effectiveWidth * scale;
    const h = effectiveHeight * scale;

    ctx.fillStyle = room.color || ROOM_TYPE_COLORS[room.type] || '#cccccc';
    ctx.strokeStyle = STROKE_COLOR;
    ctx.lineWidth = STROKE_WIDTH;

    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.fill();
    ctx.stroke();
  });

  return canvas.toDataURL('image/jpeg', 0.8);
}
