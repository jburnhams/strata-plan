import * as THREE from 'three';
import { GLTFExporter, GLTFExporterOptions } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { Floorplan } from '../../types/floorplan';
import { GLTFExportOptions } from './types';
import { generateFloorplanGeometry } from '../geometry3d/roomGeometry';

/**
 * Exports a floorplan to a glTF/GLB Blob
 */
export async function exportToGLTF(
  floorplan: Floorplan,
  options: GLTFExportOptions = {}
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      // 1. Generate 3D scene from floorplan
      const scene = new THREE.Scene();
      scene.name = floorplan.name || 'Floorplan';

      // Use existing geometry generation logic
      // Note: generateFloorplanGeometry currently defaults to high detail which includes holes for doors/windows
      const floorplanGroup = generateFloorplanGeometry(floorplan);

      // Add metadata to the root object
      floorplanGroup.userData = {
        ...floorplanGroup.userData,
        name: floorplan.name,
        exportedAt: new Date().toISOString(),
        application: 'StrataPlan',
      };

      scene.add(floorplanGroup);

      // 2. Configure Exporter
      const exporter = new GLTFExporter();

      // Determine binary vs JSON
      const binary = options.binary !== false; // Default to binary (true) if undefined

      const exporterOptions: GLTFExporterOptions = {
        binary: binary,
        maxTextureSize: options.includeTextures ? 4096 : Infinity,
      };

      if (options.includeTextures === false) {
         // Traverse and remove maps if requested
         scene.traverse((child) => {
           if ((child as THREE.Mesh).isMesh) {
             const mesh = child as THREE.Mesh;
             // We must clone the material before modifying it to avoid side effects on the shared materials in the app
             if (Array.isArray(mesh.material)) {
               mesh.material = mesh.material.map(m => {
                 const newMat = m.clone();
                 if ((newMat as THREE.MeshStandardMaterial).map) (newMat as THREE.MeshStandardMaterial).map = null;
                 return newMat;
               });
             } else {
                const m = mesh.material as THREE.MeshStandardMaterial;
                const newMat = m.clone();
                if (newMat.map) newMat.map = null;
                mesh.material = newMat;
             }
           }
         });
      }

      // 3. Parse and Export
      exporter.parse(
        scene,
        (result) => {
          if (result instanceof ArrayBuffer) {
            // Binary (.glb)
            resolve(new Blob([result], { type: 'model/gltf-binary' }));
          } else {
            // JSON (.gltf)
            const output = JSON.stringify(result, null, 2);
            resolve(new Blob([output], { type: 'application/json' }));
          }
        },
        (error) => {
          console.error('An error happened during glTF export', error);
          reject(error);
        },
        exporterOptions
      );

    } catch (error) {
      console.error('Failed to export to glTF', error);
      reject(error);
    }
  });
}
