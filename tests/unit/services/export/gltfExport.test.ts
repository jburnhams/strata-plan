import { exportToGLTF } from '../../../../src/services/export/gltfExport';
import { generateFloorplanGeometry } from '../../../../src/services/geometry3d/roomGeometry';
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { mockFloorplan } from '../../../utils/mockData';

// Mock dependencies
jest.mock('three', () => {
  const originalThree = jest.requireActual('three');
  return {
    ...originalThree,
    Scene: jest.fn().mockImplementation(() => ({
      name: '',
      add: jest.fn(),
      traverse: jest.fn(),
      userData: {},
    })),
  };
});

jest.mock('three/examples/jsm/exporters/GLTFExporter.js', () => ({
  GLTFExporter: jest.fn().mockImplementation(() => ({
    parse: jest.fn(),
  })),
}));

jest.mock('../../../../src/services/geometry3d/roomGeometry', () => ({
  generateFloorplanGeometry: jest.fn(),
}));

describe('gltfExport', () => {
  const mockParse = jest.fn();
  const mockSceneAdd = jest.fn();
  const mockSceneTraverse = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mocks
    (GLTFExporter as unknown as jest.Mock).mockImplementation(() => ({
      parse: mockParse,
    }));

    (THREE.Scene as unknown as jest.Mock).mockImplementation(() => ({
      name: '',
      add: mockSceneAdd,
      traverse: mockSceneTraverse,
      userData: {},
    }));

    (generateFloorplanGeometry as jest.Mock).mockReturnValue({
      userData: {},
    });
  });

  it('should export binary GLB by default', async () => {
    // Setup success callback
    mockParse.mockImplementation((scene, onSuccess, onError, options) => {
      // Simulate binary output
      onSuccess(new ArrayBuffer(8));
    });

    const blob = await exportToGLTF(mockFloorplan());

    expect(generateFloorplanGeometry).toHaveBeenCalledWith(expect.anything());
    expect(mockParse).toHaveBeenCalledWith(
      expect.anything(),
      expect.any(Function),
      expect.any(Function),
      expect.objectContaining({ binary: true })
    );
    expect(blob.type).toBe('model/gltf-binary');
  });

  it('should export JSON GLTF when binary is false', async () => {
    // Setup success callback
    mockParse.mockImplementation((scene, onSuccess, onError, options) => {
      // Simulate JSON output
      onSuccess({ asset: { version: '2.0' } });
    });

    const blob = await exportToGLTF(mockFloorplan(), { binary: false });

    expect(mockParse).toHaveBeenCalledWith(
      expect.anything(),
      expect.any(Function),
      expect.any(Function),
      expect.objectContaining({ binary: false })
    );
    expect(blob.type).toBe('application/json');
  });

  it('should remove textures when includeTextures is false', async () => {
    mockParse.mockImplementation((scene, onSuccess) => onSuccess(new ArrayBuffer(8)));

    // Setup traverse to simulate finding a mesh with material map
    const mockClonedMaterial = { map: {} };
    const mockMaterial = {
      map: {},
      clone: jest.fn().mockReturnValue(mockClonedMaterial)
    };
    const mockMesh = {
      isMesh: true,
      material: mockMaterial
    };

    mockSceneTraverse.mockImplementation((callback) => {
      callback(mockMesh);
    });

    await exportToGLTF(mockFloorplan(), { includeTextures: false });

    expect(mockSceneTraverse).toHaveBeenCalled();
    expect(mockMaterial.clone).toHaveBeenCalled();
    // The *cloned* material map should be nullified
    expect(mockClonedMaterial.map).toBeNull();
    // The original material should be untouched (in this mock setup we can't easily check 'untouched'
    // without deep comparison, but we check clone was called and used)
    expect(mockMesh.material).toBe(mockClonedMaterial);
  });

  it('should handle export errors', async () => {
    const error = new Error('Export failed');
    mockParse.mockImplementation((scene, onSuccess, onError) => {
      onError(error);
    });

    await expect(exportToGLTF(mockFloorplan())).rejects.toThrow('Export failed');
  });
});
