import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { Room } from '../../types';
import { generateRoomGeometry } from '../../services/geometry3d/roomGeometry';
import { createRoomMaterial } from '../../services/geometry3d/materials';
import { useUIStore } from '../../stores/uiStore';

export interface RoomMeshProps {
  room: Room;
  isSelected: boolean;
  onSelect: (roomId: string) => void;
  showLabels?: boolean;
  wallOpacity?: number; // 0.0 to 1.0
}

const RoomMeshComponent: React.FC<RoomMeshProps> = ({
  room,
  isSelected,
  onSelect,
  showLabels = true,
  wallOpacity = 1.0
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const materialQuality = useUIStore((state) => state.materialQuality || 'standard');

  // Generate materials
  const materials = useMemo(() => {
    return createRoomMaterial(room, {
      quality: materialQuality as 'simple' | 'standard' | 'detailed',
      wallOpacity
    });
  }, [room, materialQuality, wallOpacity]);

  // Memoize geometry generation
  const roomGroup = useMemo(() => {
    const group = generateRoomGeometry(room);

    // Apply materials to meshes in the group
    group.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.userData.type === 'floor') {
          mesh.material = materials.floor;
        } else if (mesh.userData.type === 'ceiling') {
          mesh.material = materials.ceiling;
        } else if (mesh.userData.type === 'wall') {
          mesh.material = materials.walls;
        }
      }
    });

    return group;
  }, [room, materials]);

  // Clean up resources when roomGroup changes or component unmounts
  useEffect(() => {
    return () => {
        if (roomGroup) {
            roomGroup.traverse((child) => {
                if ((child as THREE.Mesh).isMesh) {
                    const mesh = child as THREE.Mesh;
                    if (mesh.geometry) {
                        mesh.geometry.dispose();
                    }
                    // Do not dispose materials here as they might be shared/cached if we implemented caching fully
                    // But in current createRoomMaterial they are new instances per room.
                    // For safety, we can dispose them if they are unique.
                    // createRoomMaterial returns new instances currently.
                    if (mesh.material) {
                        if (Array.isArray(mesh.material)) {
                            mesh.material.forEach(m => m.dispose());
                        } else {
                            mesh.material.dispose();
                        }
                    }
                }
            });
        }
    };
  }, [roomGroup]);

  // Pre-allocate color objects to avoid GC in useFrame
  const highlightColor = useMemo(() => new THREE.Color('#4488ff'), []);
  const hoverColor = useMemo(() => new THREE.Color('#aaaaaa'), []);
  const defaultColor = useMemo(() => new THREE.Color('#000000'), []);

  // Highlight effect
  useFrame(() => {
    if (!groupRef.current) return;

    const targetColor = isSelected ? highlightColor : (hovered ? hoverColor : defaultColor);
    const intensity = isSelected ? 0.3 : (hovered ? 0.1 : 0);

    // Traverse and update emissive if StandardMaterial
    groupRef.current.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            const mat = mesh.material;
            // Check if it supports emissive (Standard/Physical)
            if (mat instanceof THREE.MeshStandardMaterial) {
                 // Avoid copying if already set?
                 // copy() is fast.
                 mat.emissive.copy(targetColor);
                 mat.emissiveIntensity = intensity;
            }
        }
    });
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect(room.id);
  };

  return (
    <group>
      <primitive
        object={roomGroup}
        ref={groupRef}
        onClick={handleClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      />

      {showLabels && (
        <Billboard
          position={[room.position.x + (room.rotation === 90 || room.rotation === 270 ? room.width/2 : room.length/2),
                     room.height + 0.5,
                     room.position.z + (room.rotation === 90 || room.rotation === 270 ? room.length/2 : room.width/2)]}
        >
          <Text
            fontSize={0.5}
            color="black"
            anchorX="center"
            anchorY="middle"
          >
            {room.name}
          </Text>
        </Billboard>
      )}
    </group>
  );
};

// Optimization: Prevent re-rendering if props are the same
export const RoomMesh = React.memo(RoomMeshComponent);
