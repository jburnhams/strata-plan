/**
 * Unit tests for room factory functions
 */

import { describe, it, expect } from '@jest/globals';
import {
  createRoom,
  createDefaultRoom,
  cloneRoom,
  createDoor,
  createWindow,
} from '../../../src/services/room/factory';
import type { RoomType } from '../../../src/types';

describe('Room Factory', () => {
  describe('createRoom', () => {
    it('should create a room with provided parameters', () => {
      const room = createRoom({
        name: 'Master Bedroom',
        length: 5,
        width: 4,
        type: 'bedroom',
      });

      expect(room.id).toBeDefined();
      expect(room.name).toBe('Master Bedroom');
      expect(room.length).toBe(5);
      expect(room.width).toBe(4);
      expect(room.type).toBe('bedroom');
      expect(room.height).toBe(2.7); // Default
      expect(room.position).toEqual({ x: 0, z: 0 }); // Default
      expect(room.rotation).toBe(0); // Default
    });

    it('should apply custom optional parameters', () => {
      const room = createRoom({
        name: 'Living Room',
        length: 6,
        width: 5,
        type: 'living',
        height: 3.0,
        position: { x: 10, z: 5 },
        rotation: 90,
        color: '#ff0000',
      });

      expect(room.height).toBe(3.0);
      expect(room.position).toEqual({ x: 10, z: 5 });
      expect(room.rotation).toBe(90);
      expect(room.color).toBe('#ff0000');
    });

    it('should generate unique IDs for each room', () => {
      const room1 = createRoom({
        name: 'Room 1',
        length: 4,
        width: 3,
        type: 'bedroom',
      });

      const room2 = createRoom({
        name: 'Room 2',
        length: 4,
        width: 3,
        type: 'bedroom',
      });

      expect(room1.id).not.toBe(room2.id);
    });
  });

  describe('createDefaultRoom', () => {
    it('should create bedroom with appropriate dimensions', () => {
      const room = createDefaultRoom('bedroom');
      expect(room.type).toBe('bedroom');
      expect(room.name).toBe('Bedroom');
      expect(room.length).toBe(4);
      expect(room.width).toBe(4);
    });

    it('should create kitchen with appropriate dimensions', () => {
      const room = createDefaultRoom('kitchen');
      expect(room.type).toBe('kitchen');
      expect(room.name).toBe('Kitchen');
      expect(room.length).toBe(4);
      expect(room.width).toBe(3);
    });

    it('should create bathroom with appropriate dimensions', () => {
      const room = createDefaultRoom('bathroom');
      expect(room.type).toBe('bathroom');
      expect(room.name).toBe('Bathroom');
      expect(room.length).toBe(2.5);
      expect(room.width).toBe(2);
    });

    it('should create living room with appropriate dimensions', () => {
      const room = createDefaultRoom('living');
      expect(room.type).toBe('living');
      expect(room.name).toBe('Living');
      expect(room.length).toBe(5);
      expect(room.width).toBe(4);
    });

    it('should handle all room types', () => {
      const roomTypes: RoomType[] = [
        'bedroom',
        'kitchen',
        'bathroom',
        'living',
        'dining',
        'office',
        'hallway',
        'closet',
        'garage',
        'other',
      ];

      roomTypes.forEach((type) => {
        const room = createDefaultRoom(type);
        expect(room.type).toBe(type);
        expect(room.length).toBeGreaterThan(0);
        expect(room.width).toBeGreaterThan(0);
      });
    });
  });

  describe('cloneRoom', () => {
    it('should create an independent copy with new ID', () => {
      const original = createRoom({
        name: 'Original',
        length: 4,
        width: 3,
        type: 'bedroom',
      });

      const clone = cloneRoom(original);

      expect(clone.id).not.toBe(original.id);
      expect(clone.name).toBe('Original (copy)');
      expect(clone.length).toBe(original.length);
      expect(clone.width).toBe(original.width);
      expect(clone.type).toBe(original.type);
    });

    it('should append "(copy)" to name', () => {
      const original = createRoom({
        name: 'Master Bedroom',
        length: 4,
        width: 3,
        type: 'bedroom',
      });

      const clone = cloneRoom(original);
      expect(clone.name).toBe('Master Bedroom (copy)');
    });

    it('should apply position offset when provided', () => {
      const original = createRoom({
        name: 'Original',
        length: 4,
        width: 3,
        type: 'bedroom',
        position: { x: 10, z: 5 },
      });

      const clone = cloneRoom(original, { x: 5, z: 2 });

      expect(clone.position.x).toBe(15);
      expect(clone.position.z).toBe(7);
    });

    it('should preserve position without offset', () => {
      const original = createRoom({
        name: 'Original',
        length: 4,
        width: 3,
        type: 'bedroom',
        position: { x: 10, z: 5 },
      });

      const clone = cloneRoom(original);

      expect(clone.position.x).toBe(10);
      expect(clone.position.z).toBe(5);
    });
  });

  describe('createDoor', () => {
    it('should create door with provided parameters', () => {
      const door = createDoor({
        roomId: 'room-1',
        wallSide: 'north',
      });

      expect(door.id).toBeDefined();
      expect(door.roomId).toBe('room-1');
      expect(door.wallSide).toBe('north');
      expect(door.position).toBe(0.5); // Default
      expect(door.width).toBe(0.9); // Default
      expect(door.height).toBe(2.1); // Default
      expect(door.type).toBe('single'); // Default
      expect(door.swing).toBe('inward'); // Default
      expect(door.handleSide).toBe('right'); // Default
    });

    it('should apply custom optional parameters', () => {
      const door = createDoor({
        roomId: 'room-1',
        wallSide: 'south',
        position: 0.3,
        width: 1.2,
        height: 2.2,
        type: 'double',
        swing: 'outward',
        handleSide: 'left',
        connectionId: 'conn-1',
      });

      expect(door.position).toBe(0.3);
      expect(door.width).toBe(1.2);
      expect(door.height).toBe(2.2);
      expect(door.type).toBe('double');
      expect(door.swing).toBe('outward');
      expect(door.handleSide).toBe('left');
      expect(door.connectionId).toBe('conn-1');
    });

    it('should generate unique IDs', () => {
      const door1 = createDoor({ roomId: 'room-1', wallSide: 'north' });
      const door2 = createDoor({ roomId: 'room-1', wallSide: 'south' });
      expect(door1.id).not.toBe(door2.id);
    });
  });

  describe('createWindow', () => {
    it('should create window with provided parameters', () => {
      const window = createWindow({
        roomId: 'room-1',
        wallSide: 'east',
      });

      expect(window.id).toBeDefined();
      expect(window.roomId).toBe('room-1');
      expect(window.wallSide).toBe('east');
      expect(window.position).toBe(0.5); // Default
      expect(window.width).toBe(1.2); // Default
      expect(window.height).toBe(1.2); // Default
      expect(window.sillHeight).toBe(0.9); // Default
      expect(window.frameType).toBe('double'); // Default
    });

    it('should apply custom optional parameters', () => {
      const window = createWindow({
        roomId: 'room-1',
        wallSide: 'west',
        position: 0.7,
        width: 1.5,
        height: 1.4,
        sillHeight: 1.0,
        frameType: 'triple',
      });

      expect(window.position).toBe(0.7);
      expect(window.width).toBe(1.5);
      expect(window.height).toBe(1.4);
      expect(window.sillHeight).toBe(1.0);
      expect(window.frameType).toBe('triple');
    });

    it('should generate unique IDs', () => {
      const window1 = createWindow({ roomId: 'room-1', wallSide: 'north' });
      const window2 = createWindow({ roomId: 'room-1', wallSide: 'south' });
      expect(window1.id).not.toBe(window2.id);
    });
  });
});
