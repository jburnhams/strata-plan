
import { generateThumbnail } from '../../src/services/storage/thumbnails';
import { Floorplan, Room } from '../../src/types';
import { createCanvas } from '@napi-rs/canvas';

describe('Thumbnail Generation Integration', () => {
  let createElementSpy: jest.SpyInstance;

  beforeAll(() => {
    // Spy on document.createElement to return a real canvas from @napi-rs/canvas
    createElementSpy = jest.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'canvas') {
        const canvas = createCanvas(200, 150);
        // We need to cast it to any or HTMLCanvasElement because the types don't perfectly overlap
        // but at runtime, the methods we use (getContext, toDataURL) are compatible.
        return canvas as unknown as HTMLCanvasElement;
      }
      // For other elements, use the original implementation (provided by JSDOM)
      return (jest.requireActual('jsdom').JSDOM.fragment(`<${tagName}></${tagName}>`).firstChild) as HTMLElement;
    });
  });

  afterAll(() => {
    if (createElementSpy) {
      createElementSpy.mockRestore();
    }
  });

  it('should generate a valid data URL using real canvas implementation', async () => {
    const mockRoom: Room = {
      id: 'room1',
      name: 'Bedroom',
      length: 5, // 5 meters
      width: 4,  // 4 meters
      height: 3,
      type: 'bedroom',
      position: { x: 0, z: 0 },
      rotation: 0,
      color: '#ff0000'
    };

    const mockFloorplan: Floorplan = {
      id: 'fp1',
      name: 'Integration Test Plan',
      rooms: [mockRoom],
      connections: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      units: 'meters',
    };

    const dataUrl = await generateThumbnail(mockFloorplan);

    // Basic validation of the output
    expect(dataUrl).toBeDefined();
    expect(typeof dataUrl).toBe('string');
    expect(dataUrl.startsWith('data:image/jpeg;base64,')).toBeTruthy();

    // Ensure it's not empty (base64 part has length)
    const base64Data = dataUrl.split(',')[1];
    expect(base64Data.length).toBeGreaterThan(100);
  });

  it('should handle complex floorplan layout without errors', async () => {
      const room1: Room = {
          id: 'r1', name: 'R1', length: 10, width: 10, height: 3, type: 'living', position: {x: 0, z: 0}, rotation: 0
      };
      const room2: Room = {
          id: 'r2', name: 'R2', length: 5, width: 5, height: 3, type: 'kitchen', position: {x: 10, z: 0}, rotation: 90
      };

      const floorplan: Floorplan = {
          id: 'fp-complex',
          name: 'Complex Plan',
          rooms: [room1, room2],
          connections: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          units: 'meters'
      };

      const dataUrl = await generateThumbnail(floorplan);
      expect(dataUrl).toContain('data:image/jpeg;base64,');
  });
});
