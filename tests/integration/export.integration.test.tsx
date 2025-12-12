import { exportFloorplan } from '../../src/services/export';
import { mockFloorplan } from '../utils/mockData';
import * as THREE from 'three';

// Polyfills for Node environment
if (typeof Blob === 'undefined') {
  global.Blob = require('buffer').Blob;
}

// Polyfill URL.createObjectURL
if (typeof window !== 'undefined') {
  window.URL.createObjectURL = jest.fn(() => 'mock-url');
  window.URL.revokeObjectURL = jest.fn();
} else {
  (global as any).URL.createObjectURL = jest.fn(() => 'mock-url');
  (global as any).URL.revokeObjectURL = jest.fn();
}

// Polyfill TextEncoder/Decoder for Three.js
if (typeof TextEncoder === 'undefined') {
  global.TextEncoder = require('util').TextEncoder;
  global.TextDecoder = require('util').TextDecoder;
}

// We rely on generic Three.js imports being available in JSDOM via Jest.
// The GLTFExporter might check for HTMLCanvasElement for texture processing.

describe('Export Integration', () => {
  // Mock document.createElement for download helper
  const mockAnchor = {
    href: '',
    download: '',
    click: jest.fn(),
  };

  beforeAll(() => {
    jest.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'a') return mockAnchor as any;
      // Provide a basic canvas mock if GLTFExporter creates one for texture processing
      if (tagName === 'canvas') {
        const canvas = document.createElement('canvas');
        canvas.toDataURL = jest.fn(() => 'data:image/png;base64,');
        return canvas;
      }
      return document.createElement(tagName); // Fallback
    });
    jest.spyOn(document.body, 'appendChild').mockImplementation(() => null as any);
    jest.spyOn(document.body, 'removeChild').mockImplementation(() => null as any);
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should handle GLTF export flow correctly with real Three.js objects', async () => {
    // This tests the full flow including generateFloorplanGeometry and GLTFExporter
    await exportFloorplan(mockFloorplan(), 'gltf');

    expect(window.URL.createObjectURL).toHaveBeenCalled();
    expect(mockAnchor.download).toMatch(/_.*\.glb$/);
    expect(mockAnchor.click).toHaveBeenCalled();

    // Check blob content type if possible, or arguments to createObjectURL
    const blob = (window.URL.createObjectURL as jest.Mock).mock.calls[0][0];
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('model/gltf-binary');
    expect(blob.size).toBeGreaterThan(0);
  });

  it('should handle JSON export flow correctly and verify content', async () => {
    const floorplan = mockFloorplan();
    await exportFloorplan(floorplan, 'json');

    expect(window.URL.createObjectURL).toHaveBeenCalled();
    expect(mockAnchor.download).toMatch(/_.*\.json$/);
    expect(mockAnchor.click).toHaveBeenCalled();

    // Verify JSON content
    // Note: The first call was for GLTF, so we access the second call
    const blob = (window.URL.createObjectURL as jest.Mock).mock.calls[1][0];
    expect(blob.type).toBe('application/json');

    const text = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(blob);
    });
    const json = JSON.parse(text);

    expect(json).toHaveProperty('floorplan');
    expect(json.floorplan.id).toBe(floorplan.id);
    expect(json.exportedFrom).toContain('StrataPlan');
  });
});
