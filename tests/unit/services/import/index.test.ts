import { detectFormat, readFileAsText, readFileAsArrayBuffer, importFloorplan } from '../../../../src/services/import/index';

describe('Import Service', () => {
  describe('detectFormat', () => {
    it('should detect json files', () => {
      const file = new File(['{}'], 'test.json', { type: 'application/json' });
      expect(detectFormat(file)).toBe('json');
    });

    it('should detect gltf files', () => {
      const file = new File([''], 'model.gltf', { type: 'model/gltf+json' });
      expect(detectFormat(file)).toBe('gltf');
    });

    it('should detect glb files as gltf', () => {
      const file = new File([''], 'model.glb', { type: 'model/gltf-binary' });
      expect(detectFormat(file)).toBe('gltf');
    });

    it('should detect case insensitive', () => {
      const file = new File(['{}'], 'TEST.JSON', { type: 'application/json' });
      expect(detectFormat(file)).toBe('json');
    });

    it('should return unknown for unsupported files', () => {
      const file = new File([''], 'image.png', { type: 'image/png' });
      expect(detectFormat(file)).toBe('unknown');
    });
  });

  describe('readFileAsText', () => {
    it('should read file content as text', async () => {
      const content = '{"test": "content"}';
      const file = new File([content], 'test.json', { type: 'application/json' });

      const result = await readFileAsText(file);
      expect(result).toBe(content);
    });

    it('should handle empty files', async () => {
      const file = new File([''], 'empty.txt', { type: 'text/plain' });
      const result = await readFileAsText(file);
      expect(result).toBe('');
    });
  });

  describe('readFileAsArrayBuffer', () => {
    it('should read file content as ArrayBuffer', async () => {
      const content = 'test buffer';
      const file = new File([content], 'test.bin', { type: 'application/octet-stream' });

      const result = await readFileAsArrayBuffer(file);
      expect(result).toBeInstanceOf(ArrayBuffer);
      expect(result.byteLength).toBe(content.length);

      const decoder = new TextDecoder();
      expect(decoder.decode(result)).toBe(content);
    });
  });

  describe('importFloorplan', () => {
    it('should return error for unknown format', async () => {
      const file = new File([''], 'test.png', { type: 'image/png' });
      const result = await importFloorplan(file);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Unsupported file format: test.png');
    });

    it('should return error for invalid json content', async () => {
      // Empty object is invalid because it's missing required fields
      const file = new File(['{}'], 'test.json', { type: 'application/json' });
      const result = await importFloorplan(file);

      expect(result.success).toBe(false);
      // It should now return validation errors instead of "not implemented"
      expect(result.errors).toContain('Missing or invalid floorplan ID');
    });

    it('should return not implemented for gltf', async () => {
      const file = new File([''], 'test.gltf', { type: 'model/gltf+json' });
      const result = await importFloorplan(file);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('GLTF import not yet implemented');
    });
  });
});
