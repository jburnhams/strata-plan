/**
 * Unit tests for validation utilities
 */

import { describe, it, expect } from '@jest/globals';
import {
  validateRoomDimension,
  validateCeilingHeight,
  validateRoomName,
  validateProjectName,
  validateRoom,
  validateFloorplan,
  hasErrors,
  getErrors,
  getWarnings,
} from '../../../src/utils/validation';
import type { Room, Floorplan } from '../../../src/types';

describe('Validation Utilities', () => {
  describe('validateRoomDimension', () => {
    it('should return error for values less than 0.1', () => {
      const result = validateRoomDimension(0.05, 'Length');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('0.1');
    });

    it('should return error for values greater than 100', () => {
      const result = validateRoomDimension(150, 'Width');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('100');
    });

    it('should return warning for values less than 1', () => {
      const result = validateRoomDimension(0.5, 'Length');
      expect(result.valid).toBe(true);
      expect(result.warning).toBeDefined();
      expect(result.warning).toContain('unusually small');
    });

    it('should return warning for values greater than 50', () => {
      const result = validateRoomDimension(75, 'Width');
      expect(result.valid).toBe(true);
      expect(result.warning).toBeDefined();
      expect(result.warning).toContain('unusually large');
    });

    it('should pass for normal dimensions', () => {
      const result = validateRoomDimension(4.5, 'Length');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
      expect(result.warning).toBeUndefined();
    });
  });

  describe('validateCeilingHeight', () => {
    it('should return error for height less than 1.5', () => {
      const result = validateCeilingHeight(1.2);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should return error for height greater than 4.0', () => {
      const result = validateCeilingHeight(5.0);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should return warning for low ceiling', () => {
      const result = validateCeilingHeight(2.0);
      expect(result.valid).toBe(true);
      expect(result.warning).toBeDefined();
      expect(result.warning).toContain('unusually low');
    });

    it('should return warning for high ceiling', () => {
      const result = validateCeilingHeight(3.8);
      expect(result.valid).toBe(true);
      expect(result.warning).toBeDefined();
      expect(result.warning).toContain('unusually high');
    });

    it('should pass for normal ceiling height', () => {
      const result = validateCeilingHeight(2.7);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
      expect(result.warning).toBeUndefined();
    });
  });

  describe('validateRoomName', () => {
    it('should return error for empty name', () => {
      const result = validateRoomName('');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should return error for whitespace-only name', () => {
      const result = validateRoomName('   ');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should return error for name exceeding 100 characters', () => {
      const longName = 'a'.repeat(101);
      const result = validateRoomName(longName);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should return warning for name exceeding 50 characters', () => {
      const longName = 'a'.repeat(75);
      const result = validateRoomName(longName);
      expect(result.valid).toBe(true);
      expect(result.warning).toBeDefined();
    });

    it('should pass for normal name', () => {
      const result = validateRoomName('Master Bedroom');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
      expect(result.warning).toBeUndefined();
    });
  });

  describe('validateProjectName', () => {
    it('should return error for empty name', () => {
      const result = validateProjectName('');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should return error for name exceeding 100 characters', () => {
      const longName = 'a'.repeat(101);
      const result = validateProjectName(longName);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should return warning for long name', () => {
      const longName = 'a'.repeat(75);
      const result = validateProjectName(longName);
      expect(result.valid).toBe(true);
      expect(result.warning).toBeDefined();
    });

    it('should pass for normal name', () => {
      const result = validateProjectName('My House Plan');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
      expect(result.warning).toBeUndefined();
    });
  });

  describe('validateRoom', () => {
    it('should validate all room fields', () => {
      const room: Room = {
        id: '1',
        name: 'Bedroom',
        length: 4,
        width: 3,
        height: 2.7,
        type: 'bedroom',
        position: { x: 0, z: 0 },
        rotation: 0,
      };

      const results = validateRoom(room);
      expect(results).toBeInstanceOf(Array);
      expect(results.length).toBeGreaterThan(0);
      expect(results.every((r) => r.valid)).toBe(true);
    });

    it('should return errors for invalid room', () => {
      const room: Room = {
        id: '1',
        name: '',
        length: 0.05,
        width: 150,
        height: 5.0,
        type: 'bedroom',
        position: { x: 0, z: 0 },
        rotation: 0,
      };

      const results = validateRoom(room);
      const errors = results.filter((r) => !r.valid);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('validateFloorplan', () => {
    it('should validate project name and all rooms', () => {
      const floorplan: Floorplan = {
        id: '1',
        name: 'Test Plan',
        units: 'meters',
        rooms: [
          {
            id: '1',
            name: 'Room 1',
            length: 4,
            width: 3,
            height: 2.7,
            type: 'bedroom',
            position: { x: 0, z: 0 },
            rotation: 0,
          },
          {
            id: '2',
            name: 'Room 2',
            length: 4,
            width: 3,
            height: 2.7,
            type: 'kitchen',
            position: { x: 10, z: 0 },
            rotation: 0,
          },
        ],
        walls: [],
        doors: [],
        windows: [],
        connections: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0.0',
      };

      const results = validateFloorplan(floorplan);
      expect(results).toBeInstanceOf(Array);
    });

    it('should detect overlapping rooms', () => {
      const floorplan: Floorplan = {
        id: '1',
        name: 'Test Plan',
        units: 'meters',
        rooms: [
          {
            id: '1',
            name: 'Room 1',
            length: 4,
            width: 3,
            height: 2.7,
            type: 'bedroom',
            position: { x: 0, z: 0 },
            rotation: 0,
          },
          {
            id: '2',
            name: 'Room 2',
            length: 4,
            width: 3,
            height: 2.7,
            type: 'kitchen',
            position: { x: 2, z: 1 }, // Overlapping
            rotation: 0,
          },
        ],
        walls: [],
        doors: [],
        windows: [],
        connections: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0.0',
      };

      const results = validateFloorplan(floorplan);
      const overlapErrors = results.filter((r) => r.error?.includes('overlap'));
      expect(overlapErrors.length).toBeGreaterThan(0);
    });
  });

  describe('hasErrors', () => {
    it('should return true if results contain errors', () => {
      const results = [
        { valid: true },
        { valid: false, error: 'Error' },
        { valid: true, warning: 'Warning' },
      ];
      expect(hasErrors(results)).toBe(true);
    });

    it('should return false if no errors', () => {
      const results = [
        { valid: true },
        { valid: true, warning: 'Warning' },
      ];
      expect(hasErrors(results)).toBe(false);
    });
  });

  describe('getErrors', () => {
    it('should extract error messages', () => {
      const results = [
        { valid: true },
        { valid: false, error: 'Error 1' },
        { valid: true, warning: 'Warning' },
        { valid: false, error: 'Error 2' },
      ];
      const errors = getErrors(results);
      expect(errors).toEqual(['Error 1', 'Error 2']);
    });
  });

  describe('getWarnings', () => {
    it('should extract warning messages', () => {
      const results = [
        { valid: true },
        { valid: false, error: 'Error' },
        { valid: true, warning: 'Warning 1' },
        { valid: true, warning: 'Warning 2' },
      ];
      const warnings = getWarnings(results);
      expect(warnings).toEqual(['Warning 1', 'Warning 2']);
    });
  });
});
