import {
  FLOOR_MATERIALS,
  WALL_MATERIALS,
  CEILING_MATERIALS,
} from '../../../src/constants/materialConfigs';
import {
  FloorMaterialConfig,
  WallMaterialConfig,
  CeilingMaterialConfig,
} from '../../../src/types/materials';

describe('Material Configurations', () => {
  describe('FLOOR_MATERIALS', () => {
    it('should have valid configs for all floor materials', () => {
      Object.values(FLOOR_MATERIALS).forEach((config) => {
        expect(config.id).toBeDefined();
        expect(config.name).toBeDefined();
        expect(config.category).toBeDefined();
        expect(config.defaultColor).toMatch(/^#[0-9a-fA-F]{6}$/);
        expect(config.roughness).toBeGreaterThanOrEqual(0);
        expect(config.roughness).toBeLessThanOrEqual(1);
        expect(config.reflectivity).toBeGreaterThanOrEqual(0);
        expect(config.reflectivity).toBeLessThanOrEqual(1);
      });
    });

    it('should match keys with ids', () => {
      Object.entries(FLOOR_MATERIALS).forEach(([key, config]) => {
        expect(key).toBe(config.id);
      });
    });
  });

  describe('WALL_MATERIALS', () => {
    it('should have valid configs for all wall materials', () => {
      Object.values(WALL_MATERIALS).forEach((config) => {
        expect(config.id).toBeDefined();
        expect(config.name).toBeDefined();
        expect(config.defaultColor).toMatch(/^#[0-9a-fA-F]{6}$/);
        expect(config.roughness).toBeGreaterThanOrEqual(0);
        expect(config.roughness).toBeLessThanOrEqual(1);
      });
    });

    it('should match keys with ids', () => {
      Object.entries(WALL_MATERIALS).forEach(([key, config]) => {
        expect(key).toBe(config.id);
      });
    });
  });

  describe('CEILING_MATERIALS', () => {
    it('should have valid configs for all ceiling materials', () => {
      Object.values(CEILING_MATERIALS).forEach((config) => {
        expect(config.id).toBeDefined();
        expect(config.name).toBeDefined();
        expect(config.defaultColor).toMatch(/^#[0-9a-fA-F]{6}$/);
      });
    });

    it('should match keys with ids', () => {
      Object.entries(CEILING_MATERIALS).forEach(([key, config]) => {
        expect(key).toBe(config.id);
      });
    });
  });
});
