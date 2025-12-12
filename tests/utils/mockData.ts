import { Floorplan, Room } from '@/types';

export const mockRoom = (
  id: string,
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
  doors: [],
  windows: [],
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
