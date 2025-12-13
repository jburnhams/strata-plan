import { exportToGLTF } from '../../../../src/services/export/gltfExport';
import { Floorplan } from '../../../../src/types';
import * as THREE from 'three';

// Mock generateFloorplanGeometry
jest.mock('../../../../src/services/geometry3d/roomGeometry', () => {
    const { Group } = require('three');
    return {
        generateFloorplanGeometry: jest.fn(() => new Group())
    };
});

// Mock GLTFExporter
const mockParse = jest.fn();
jest.mock('three/examples/jsm/exporters/GLTFExporter.js', () => {
    return {
        GLTFExporter: jest.fn().mockImplementation(() => {
            return {
                parse: mockParse
            };
        })
    };
});


describe('exportToGLTF Extra Coverage', () => {
    const mockFloorplan: Floorplan = {
        id: 'fp-1',
        name: 'Test',
        units: 'meters',
        rooms: [],
        connections: [],
        walls: [],
        createdAt: new Date(),
        updatedAt: new Date()
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('handles JSON export (binary: false)', async () => {
        mockParse.mockImplementation((scene, onSuccess, onError, options) => {
            // Simulate JSON result
            const result = { asset: { version: '2.0' } };
            onSuccess(result);
        });

        const blob = await exportToGLTF(mockFloorplan, { binary: false });
        expect(blob.type).toBe('application/json');

        // Verify exporter was called with binary: false
        expect(mockParse).toHaveBeenCalledWith(
            expect.anything(),
            expect.anything(),
            expect.anything(),
            expect.objectContaining({ binary: false })
        );
    });

    it('handles Binary export (default)', async () => {
        mockParse.mockImplementation((scene, onSuccess, onError, options) => {
            // Simulate ArrayBuffer result
            const result = new ArrayBuffer(8);
            onSuccess(result);
        });

        const blob = await exportToGLTF(mockFloorplan);
        expect(blob.type).toBe('model/gltf-binary');

        // Verify exporter was called with binary: true
        expect(mockParse).toHaveBeenCalledWith(
            expect.anything(),
            expect.anything(),
            expect.anything(),
            expect.objectContaining({ binary: true })
        );
    });

    it('handles export errors from GLTFExporter', async () => {
        mockParse.mockImplementation((scene, onSuccess, onError, options) => {
             onError(new Error('Export failed'));
        });

        await expect(exportToGLTF(mockFloorplan)).rejects.toThrow('Export failed');
    });

    it('handles synchronous errors during setup', async () => {
        // Force an error by making scene creation fail (simulated by throwing in mock above not practical,
        // so we mock GLTFExporter constructor to throw)
        const { GLTFExporter } = require('three/examples/jsm/exporters/GLTFExporter.js');
        GLTFExporter.mockImplementationOnce(() => {
            throw new Error('Constructor failed');
        });

        await expect(exportToGLTF(mockFloorplan)).rejects.toThrow('Constructor failed');
    });

    it('removes textures if includeTextures is false', async () => {
        // We need to verify that scene traversal happened and materials were cloned/cleared.
        // We can inspect the scene passed to parse.
        let parsedScene: THREE.Scene | null = null;

        mockParse.mockImplementation((scene, onSuccess, onError, options) => {
            parsedScene = scene;
            onSuccess(new ArrayBuffer(8));
        });

        // Setup mock geometry with a mesh and material with a map
        const { generateFloorplanGeometry } = require('../../../../src/services/geometry3d/roomGeometry');
        const group = new THREE.Group();
        const mesh = new THREE.Mesh();
        const material = new THREE.MeshStandardMaterial();
        material.map = new THREE.Texture();
        mesh.material = material;
        group.add(mesh);

        generateFloorplanGeometry.mockReturnValueOnce(group);

        await exportToGLTF(mockFloorplan, { includeTextures: false });

        expect(parsedScene).toBeDefined();
        // Traverse parsed scene to find the mesh
        let processedMesh: THREE.Mesh | null = null;
        parsedScene?.traverse((child: any) => {
             if (child.isMesh) processedMesh = child;
        });

        expect(processedMesh).toBeDefined();
        // Check if map is null on the material
        const processedMat = processedMesh!.material as THREE.MeshStandardMaterial;
        expect(processedMat.map).toBeNull();

        // Ensure original material was not modified (it was cloned)
        expect(material.map).toBeDefined();
    });
});
