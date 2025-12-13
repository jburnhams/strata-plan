import { Floorplan, Room } from '@/types';
import { Door, DOOR_DEFAULTS } from '@/types/door';
import { Window, WINDOW_DEFAULTS } from '@/types/window';

export const mockRoom = (
  id: string = 'room-1',
  position: { x: number; z: number } = { x: 0, z: 0 },
  length = 5,
  width = 4
): Room => ({
  id,
  name: 'Test Room',
  length,
  width,
  height: 3,
  type: 'bedroom',
  position,
  rotation: 0,
});

export const mockDoor = (
  id: string = 'door-1',
  roomId: string = 'room-1'
): Door => ({
  id,
  roomId,
  ...DOOR_DEFAULTS,
  wallSide: 'front',
  position: 0.5,
});

export const mockWindow = (
  id: string = 'window-1',
  roomId: string = 'room-1'
): Window => ({
  id,
  roomId,
  ...WINDOW_DEFAULTS,
  wallSide: 'front',
  position: 0.5,
});

export const mockFloorplan = (): Floorplan => ({
  id: 'fp-1',
  name: 'Test Floorplan',
  units: 'meters',
  rooms: [],
  walls: [],
  doors: [],
  windows: [],
  connections: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  version: '1.0.0',
});
