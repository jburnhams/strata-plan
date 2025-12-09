import { generateThumbnail } from '../../../../src/services/storage/thumbnails';
import { Floorplan, Room } from '../../../../src/types';

describe('generateThumbnail', () => {
  let mockContext: any;
  let mockCanvas: any;

  beforeEach(() => {
    // Mock Canvas and Context
    mockContext = {
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 0,
      fillRect: jest.fn(),
      beginPath: jest.fn(),
      rect: jest.fn(),
      fill: jest.fn(),
      stroke: jest.fn(),
    };

    mockCanvas = {
      width: 0,
      height: 0,
      getContext: jest.fn().mockReturnValue(mockContext),
      toDataURL: jest.fn().mockReturnValue('data:image/jpeg;base64,mockdata'),
    };

    // Mock document.createElement
    jest.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'canvas') {
        return mockCanvas;
      }
      return document.createElement(tagName);
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('generates a thumbnail for a floorplan with rooms', async () => {
    const mockRoom: Room = {
      id: 'room1',
      name: 'Bedroom',
      length: 10,
      width: 10,
      height: 3,
      type: 'bedroom',
      position: { x: 0, z: 0 },
      rotation: 0,
    };

    const mockFloorplan: Floorplan = {
      id: 'fp1',
      name: 'Test Plan',
      rooms: [mockRoom],
      connections: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      units: 'meters',
    };

    const result = await generateThumbnail(mockFloorplan);

    expect(result).toBe('data:image/jpeg;base64,mockdata');
    expect(mockCanvas.width).toBe(200);
    expect(mockCanvas.height).toBe(150);
    expect(mockContext.fillRect).toHaveBeenCalledWith(0, 0, 200, 150); // Background clear
    expect(mockContext.rect).toHaveBeenCalled(); // Room drawing
    expect(mockContext.fill).toHaveBeenCalled();
    expect(mockContext.stroke).toHaveBeenCalled();
  });

  it('handles empty floorplan', async () => {
    const mockFloorplan: Floorplan = {
      id: 'fp1',
      name: 'Empty Plan',
      rooms: [],
      connections: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      units: 'meters',
    };

    const result = await generateThumbnail(mockFloorplan);

    expect(result).toBe('data:image/jpeg;base64,mockdata');
    expect(mockContext.fillRect).toHaveBeenCalled(); // Background still cleared
    expect(mockContext.rect).not.toHaveBeenCalled(); // No rooms drawn
  });

  it('handles rotated rooms correctly', async () => {
    const mockRoom: Room = {
      id: 'room1',
      name: 'Bedroom',
      length: 10,
      width: 5,
      height: 3,
      type: 'bedroom',
      position: { x: 0, z: 0 },
      rotation: 90, // Rotated
    };

    const mockFloorplan: Floorplan = {
      id: 'fp1',
      name: 'Rotated Plan',
      rooms: [mockRoom],
      connections: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      units: 'meters',
    };

    await generateThumbnail(mockFloorplan);

    // Bounding box calculation should consider rotation
    // With 90 deg rotation, effective width is 5, effective height is 10
    // This test primarily ensures no crash and drawing happens
    expect(mockContext.rect).toHaveBeenCalled();
  });

  it('throws error if context creation fails', async () => {
      mockCanvas.getContext.mockReturnValue(null);

      const mockFloorplan: Floorplan = {
        id: 'fp1',
        name: 'Test Plan',
        rooms: [],
        connections: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        units: 'meters',
      };

      await expect(generateThumbnail(mockFloorplan)).rejects.toThrow('Failed to get 2D context');
  });
});
