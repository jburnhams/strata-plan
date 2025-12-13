import * as THREE from 'three';
import { generateRoomGeometry, generateFloorplanGeometry } from '../../../../src/services/geometry3d/roomGeometry';
import { mockRoom, mockDoor, mockFloorplan } from '../../../utils/mockData';
import { WallSide } from '../../../../src/types/geometry';

// Mock dependencies
jest.mock('three', () => {
  const actualThree = jest.requireActual('three');
  return {
    ...actualThree,
    Shape: jest.fn().mockImplementation(() => ({
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      holes: [],
    })),
    Path: jest.fn().mockImplementation(() => ({
      moveTo: jest.fn(),
      lineTo: jest.fn(),
    })),
    ShapeGeometry: jest.fn().mockImplementation(() => ({
      rotateX: jest.fn(),
      rotateY: jest.fn(),
      translate: jest.fn(),
      dispose: jest.fn(),
    })),
    Mesh: jest.fn().mockImplementation(() => ({
      userData: {},
      receiveShadow: false,
      castShadow: false,
    })),
    Group: jest.fn().mockImplementation(() => ({
      add: jest.fn(),
      position: { set: jest.fn() },
      userData: {},
    })),
  };
});

jest.mock('three/examples/jsm/utils/BufferGeometryUtils.js', () => ({
  mergeGeometries: jest.fn().mockImplementation(() => ({
    computeBoundingSphere: jest.fn(),
  })),
}));

jest.mock('../../../../src/services/geometry3d/materials', () => ({
  createRoomMaterial: jest.fn().mockReturnValue({
    floor: {},
    ceiling: {},
    walls: {},
  }),
}));

describe('roomGeometry coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const rotations = [0, 90, 180, 270];
  const sides: WallSide[] = ['north', 'south', 'east', 'west'];

  rotations.forEach((rotation) => {
    sides.forEach((side) => {
      it(`should add holes for door on ${side} side with rotation ${rotation}`, () => {
        const room = {
          ...mockRoom(),
          rotation,
          width: 10,
          length: 10,
          height: 3,
        };

        const door = {
          ...mockDoor(),
          roomId: room.id,
          wallSide: side,
          position: 0.5,
          width: 1,
          height: 2,
        };

        generateRoomGeometry(room, [door], [], { detailLevel: 'high' });

        const shapes = (THREE.Shape as unknown as jest.Mock).mock.results.map(r => r.value);
        const shapesWithHoles = shapes.filter(s => s.holes.length > 0);

        expect(shapesWithHoles.length).toBeGreaterThan(0);
      });
    });
  });

  it('should handle windows with holes', () => {
      const room = { ...mockRoom(), width: 10, length: 10 };
      const window = {
          id: 'w1',
          roomId: room.id,
          wallSide: 'north',
          position: 0.5,
          width: 1,
          height: 1,
          sillHeight: 1,
          frameType: 'single',
          material: 'pvc',
          openingType: 'fixed'
      };

      generateRoomGeometry(room, [], [window as any], { detailLevel: 'high' });

      const shapes = (THREE.Shape as unknown as jest.Mock).mock.results.map(r => r.value);
      const shapesWithHoles = shapes.filter(s => s.holes.length > 0);
      expect(shapesWithHoles.length).toBeGreaterThan(0);
  });

  it('should skip holes if detailLevel is low', () => {
      const room = { ...mockRoom() };
      const door = { ...mockDoor(), roomId: room.id };

      generateRoomGeometry(room, [door], [], { detailLevel: 'low' });

      const shapes = (THREE.Shape as unknown as jest.Mock).mock.results.map(r => r.value);
      const shapesWithHoles = shapes.filter(s => s.holes.length > 0);
      expect(shapesWithHoles.length).toBe(0);
  });

  it('should generate floorplan geometry', () => {
      const floorplan = mockFloorplan();
      // Add a room
      floorplan.rooms = [mockRoom()];

      const group = generateFloorplanGeometry(floorplan);

      expect(group).toBeDefined();
      expect(THREE.Group).toHaveBeenCalled();
  });
});
