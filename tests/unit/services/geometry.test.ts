/**
 * Unit tests for geometry utility functions
 */

import { describe, it, expect } from '@jest/globals';
import {
  calculateArea,
  calculateVolume,
  calculatePerimeter,
  getRoomCenter,
  getRoomBounds,
  getRoomCorners,
  doRoomsOverlap,
  getWallLength,
  snapToGrid,
  clamp,
  worldToLocal,
  localToWorld,
} from '../../../src/services/geometry';
import type { Room } from '../../../src/types';

describe('Geometry Utilities', () => {
  describe('calculateArea', () => {
    it('should calculate area correctly', () => {
      expect(calculateArea(4, 3)).toBe(12);
      expect(calculateArea(5.5, 2.5)).toBe(13.75);
      expect(calculateArea(1, 1)).toBe(1);
    });
  });

  describe('calculateVolume', () => {
    it('should calculate volume correctly', () => {
      expect(calculateVolume(4, 3, 2.7)).toBeCloseTo(32.4, 5);
      expect(calculateVolume(5, 5, 3)).toBe(75);
      expect(calculateVolume(1, 1, 1)).toBe(1);
    });
  });

  describe('calculatePerimeter', () => {
    it('should calculate perimeter correctly', () => {
      expect(calculatePerimeter(4, 3)).toBe(14);
      expect(calculatePerimeter(5, 5)).toBe(20);
      expect(calculatePerimeter(2.5, 1.5)).toBe(8);
    });
  });

  describe('getRoomCenter', () => {
    it('should calculate center for non-rotated room', () => {
      const room: Room = {
        id: '1',
        name: 'Test',
        length: 4,
        width: 3,
        height: 2.7,
        type: 'bedroom',
        position: { x: 0, z: 0 },
        rotation: 0,
      };

      const center = getRoomCenter(room);
      expect(center.x).toBe(2);
      expect(center.z).toBe(1.5);
    });

    it('should calculate center for positioned room', () => {
      const room: Room = {
        id: '1',
        name: 'Test',
        length: 4,
        width: 3,
        height: 2.7,
        type: 'bedroom',
        position: { x: 10, z: 5 },
        rotation: 0,
      };

      const center = getRoomCenter(room);
      expect(center.x).toBe(12);
      expect(center.z).toBe(6.5);
    });

    it('should calculate center for rotated room', () => {
      const room: Room = {
        id: '1',
        name: 'Test',
        length: 4,
        width: 3,
        height: 2.7,
        type: 'bedroom',
        position: { x: 0, z: 0 },
        rotation: 90,
      };

      const center = getRoomCenter(room);
      expect(center.x).toBe(1.5);
      expect(center.z).toBe(2);
    });
  });

  describe('getRoomBounds', () => {
    it('should get bounds for non-rotated room', () => {
      const room: Room = {
        id: '1',
        name: 'Test',
        length: 4,
        width: 3,
        height: 2.7,
        type: 'bedroom',
        position: { x: 0, z: 0 },
        rotation: 0,
      };

      const bounds = getRoomBounds(room);
      expect(bounds.minX).toBe(0);
      expect(bounds.maxX).toBe(4);
      expect(bounds.minZ).toBe(0);
      expect(bounds.maxZ).toBe(3);
    });

    it('should get bounds for rotated room (90 degrees)', () => {
      const room: Room = {
        id: '1',
        name: 'Test',
        length: 4,
        width: 3,
        height: 2.7,
        type: 'bedroom',
        position: { x: 0, z: 0 },
        rotation: 90,
      };

      const bounds = getRoomBounds(room);
      expect(bounds.minX).toBe(0);
      expect(bounds.maxX).toBe(3); // width becomes length
      expect(bounds.minZ).toBe(0);
      expect(bounds.maxZ).toBe(4); // length becomes width
    });

    it('should get bounds for positioned and rotated room', () => {
      const room: Room = {
        id: '1',
        name: 'Test',
        length: 4,
        width: 3,
        height: 2.7,
        type: 'bedroom',
        position: { x: 10, z: 5 },
        rotation: 270,
      };

      const bounds = getRoomBounds(room);
      expect(bounds.minX).toBe(10);
      expect(bounds.maxX).toBe(13);
      expect(bounds.minZ).toBe(5);
      expect(bounds.maxZ).toBe(9);
    });
  });

  describe('getRoomCorners', () => {
    it('should return four corners in clockwise order', () => {
      const room: Room = {
        id: '1',
        name: 'Test',
        length: 4,
        width: 3,
        height: 2.7,
        type: 'bedroom',
        position: { x: 0, z: 0 },
        rotation: 0,
      };

      const corners = getRoomCorners(room);
      expect(corners).toHaveLength(4);
      expect(corners[0]).toEqual({ x: 0, z: 0 }); // Top-left
      expect(corners[1]).toEqual({ x: 4, z: 0 }); // Top-right
      expect(corners[2]).toEqual({ x: 4, z: 3 }); // Bottom-right
      expect(corners[3]).toEqual({ x: 0, z: 3 }); // Bottom-left
    });

    it('should handle rotated rooms correctly', () => {
      const room: Room = {
        id: '1',
        name: 'Test',
        length: 4,
        width: 3,
        height: 2.7,
        type: 'bedroom',
        position: { x: 0, z: 0 },
        rotation: 90,
      };

      const corners = getRoomCorners(room);
      expect(corners).toHaveLength(4);
      // For 90° rotation, dimensions swap
      expect(corners[1].x).toBe(3);
      expect(corners[2].z).toBe(4);
    });
  });

  describe('doRoomsOverlap', () => {
    it('should detect overlapping rooms', () => {
      const room1: Room = {
        id: '1',
        name: 'Room 1',
        length: 4,
        width: 3,
        height: 2.7,
        type: 'bedroom',
        position: { x: 0, z: 0 },
        rotation: 0,
      };

      const room2: Room = {
        id: '2',
        name: 'Room 2',
        length: 4,
        width: 3,
        height: 2.7,
        type: 'bedroom',
        position: { x: 2, z: 1 },
        rotation: 0,
      };

      expect(doRoomsOverlap(room1, room2)).toBe(true);
    });

    it('should return false for adjacent (touching) rooms', () => {
      const room1: Room = {
        id: '1',
        name: 'Room 1',
        length: 4,
        width: 3,
        height: 2.7,
        type: 'bedroom',
        position: { x: 0, z: 0 },
        rotation: 0,
      };

      const room2: Room = {
        id: '2',
        name: 'Room 2',
        length: 4,
        width: 3,
        height: 2.7,
        type: 'bedroom',
        position: { x: 4, z: 0 }, // Touching on the edge
        rotation: 0,
      };

      expect(doRoomsOverlap(room1, room2)).toBe(false);
    });

    it('should return false for separated rooms', () => {
      const room1: Room = {
        id: '1',
        name: 'Room 1',
        length: 4,
        width: 3,
        height: 2.7,
        type: 'bedroom',
        position: { x: 0, z: 0 },
        rotation: 0,
      };

      const room2: Room = {
        id: '2',
        name: 'Room 2',
        length: 4,
        width: 3,
        height: 2.7,
        type: 'bedroom',
        position: { x: 10, z: 10 },
        rotation: 0,
      };

      expect(doRoomsOverlap(room1, room2)).toBe(false);
    });
  });

  describe('getWallLength', () => {
    it('should return correct wall length for non-rotated room', () => {
      const room: Room = {
        id: '1',
        name: 'Test',
        length: 4,
        width: 3,
        height: 2.7,
        type: 'bedroom',
        position: { x: 0, z: 0 },
        rotation: 0,
      };

      expect(getWallLength(room, 'north')).toBe(4);
      expect(getWallLength(room, 'south')).toBe(4);
      expect(getWallLength(room, 'east')).toBe(3);
      expect(getWallLength(room, 'west')).toBe(3);
    });

    it('should return correct wall length for 90-degree rotated room', () => {
      const room: Room = {
        id: '1',
        name: 'Test',
        length: 4,
        width: 3,
        height: 2.7,
        type: 'bedroom',
        position: { x: 0, z: 0 },
        rotation: 90,
      };

      expect(getWallLength(room, 'north')).toBe(3);
      expect(getWallLength(room, 'south')).toBe(3);
      expect(getWallLength(room, 'east')).toBe(4);
      expect(getWallLength(room, 'west')).toBe(4);
    });
  });

  describe('snapToGrid', () => {
    it('should snap to 0.1m grid', () => {
      expect(snapToGrid(1.23, 0.1)).toBeCloseTo(1.2, 5);
      expect(snapToGrid(1.27, 0.1)).toBeCloseTo(1.3, 5);
      expect(snapToGrid(1.25, 0.1)).toBeCloseTo(1.3, 5);
    });

    it('should snap to 0.5m grid', () => {
      expect(snapToGrid(1.2, 0.5)).toBeCloseTo(1.0, 5);
      expect(snapToGrid(1.3, 0.5)).toBeCloseTo(1.5, 5);
      expect(snapToGrid(2.7, 0.5)).toBeCloseTo(2.5, 5);
    });

    it('should snap to 1m grid', () => {
      expect(snapToGrid(1.4, 1.0)).toBeCloseTo(1.0, 5);
      expect(snapToGrid(1.6, 1.0)).toBeCloseTo(2.0, 5);
      expect(snapToGrid(2.5, 1.0)).toBeCloseTo(3.0, 5);
    });
  });

  describe('clamp', () => {
    it('should clamp value within range', () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
    });

    it('should handle edge cases', () => {
      expect(clamp(0, 0, 10)).toBe(0);
      expect(clamp(10, 0, 10)).toBe(10);
    });
  });

  describe('worldToLocal and localToWorld', () => {
    it('should convert between coordinate systems for non-rotated room', () => {
      const room: Room = {
        id: '1',
        name: 'Test',
        length: 4,
        width: 3,
        height: 2.7,
        type: 'bedroom',
        position: { x: 10, z: 5 },
        rotation: 0,
      };

      const worldPoint = { x: 12, z: 7 };
      const local = worldToLocal(worldPoint, room);
      expect(local.x).toBe(2);
      expect(local.z).toBe(2);

      const backToWorld = localToWorld(local, room);
      expect(backToWorld.x).toBe(12);
      expect(backToWorld.z).toBe(7);
    });

    it('should maintain consistency for round-trip conversion', () => {
      const room: Room = {
        id: '1',
        name: 'Test',
        length: 4,
        width: 3,
        height: 2.7,
        type: 'bedroom',
        position: { x: 5, z: 5 },
        rotation: 0,
      };

      const localPoint = { x: 2, z: 1.5 };
      const world = localToWorld(localPoint, room);
      const backToLocal = worldToLocal(world, room);

      expect(backToLocal.x).toBeCloseTo(localPoint.x, 10);
      expect(backToLocal.z).toBeCloseTo(localPoint.z, 10);
    });
  });
});
