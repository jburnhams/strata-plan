import * as THREE from 'three';
import { exportToGLTF } from '../../../../src/services/export/gltfExport';
import { mockFloorplan } from '../../../utils/mockData';

// Mock generateFloorplanGeometry
jest.mock('../../../../src/services/geometry3d/roomGeometry', () => {
  const THREE = require('three');
  return {
    generateFloorplanGeometry: jest.fn().mockImplementation(() => {
      const group = new THREE.Group();
      // Add a dummy mesh with material map for testing texture removal
      const mat = new THREE.MeshStandardMaterial();
      mat.map = new THREE.Texture();
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(), mat);
      group.add(mesh);
      return group;
    })
  };
});

// Mock THREE and GLTFExporter
jest.mock('three/examples/jsm/exporters/GLTFExporter.js', () => ({
  GLTFExporter: jest.fn().mockImplementation(() => ({
    parse: jest.fn((scene, onSuccess, onError, options) => {
        // Simple success mock
        if (options.binary) {
            onSuccess(new ArrayBuffer(8));
        } else {
            onSuccess({ asset: { version: "2.0" } });
        }
    })
  }))
}));

describe('gltfExport coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should remove textures if includeTextures is false', async () => {
    const floorplan = mockFloorplan();

    const cloneSpy = jest.spyOn(THREE.Material.prototype, 'clone');

    await exportToGLTF(floorplan, { includeTextures: false, binary: true });

    // Check if clone was called (it is called when removing textures)
    expect(cloneSpy).toHaveBeenCalled();
  });

  it('should handle array materials for texture removal', async () => {
     // We need to make generateFloorplanGeometry return a mesh with array material
     const { generateFloorplanGeometry } = require('../../../../src/services/geometry3d/roomGeometry');
     generateFloorplanGeometry.mockImplementationOnce(() => {
        const group = new THREE.Group();
        const mat1 = new THREE.MeshStandardMaterial();
        mat1.map = new THREE.Texture();
        const mat2 = new THREE.MeshStandardMaterial();
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(), [mat1, mat2]);
        group.add(mesh);
        return group;
     });

     const cloneSpy = jest.spyOn(THREE.Material.prototype, 'clone');
     await exportToGLTF(mockFloorplan(), { includeTextures: false });
     expect(cloneSpy).toHaveBeenCalled();
  });

  it('should handle export error', async () => {
      const { GLTFExporter } = require('three/examples/jsm/exporters/GLTFExporter.js');
      GLTFExporter.mockImplementationOnce(() => ({
          parse: jest.fn((scene, onSuccess, onError) => {
              onError(new Error('Export failed'));
          })
      }));

      await expect(exportToGLTF(mockFloorplan())).rejects.toThrow('Export failed');
  });

  it('should handle non-binary export (JSON)', async () => {
      const result = await exportToGLTF(mockFloorplan(), { binary: false });
      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe('application/json');
  });
});
