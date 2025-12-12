import { FLOOR_MATERIALS, WALL_MATERIALS, CEILING_MATERIALS } from '@/constants/materialConfigs';

describe('Material Configurations', () => {
  describe('FLOOR_MATERIALS', () => {
    it('should have valid configs for all floor materials', () => {
      Object.values(FLOOR_MATERIALS).forEach(material => {
        expect(material.id).toBeDefined();
        expect(material.name).toBeDefined();
        expect(material.category).toBeDefined();
        expect(material.defaultColor).toMatch(/^#[0-9A-F]{6}$/i);
        expect(material.roughness).toBeGreaterThanOrEqual(0);
        expect(material.roughness).toBeLessThanOrEqual(1);
        expect(material.reflectivity).toBeGreaterThanOrEqual(0);
        expect(material.reflectivity).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('WALL_MATERIALS', () => {
    it('should have valid configs for all wall materials', () => {
      Object.values(WALL_MATERIALS).forEach(material => {
        expect(material.id).toBeDefined();
        expect(material.name).toBeDefined();
        expect(material.defaultColor).toMatch(/^#[0-9A-F]{6}$/i);
        expect(material.roughness).toBeGreaterThanOrEqual(0);
        expect(material.roughness).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('CEILING_MATERIALS', () => {
    it('should have valid configs for all ceiling materials', () => {
      Object.values(CEILING_MATERIALS).forEach(material => {
        expect(material.id).toBeDefined();
        expect(material.name).toBeDefined();
        expect(material.defaultColor).toMatch(/^#[0-9A-F]{6}$/i);
      });
    });
  });
});
