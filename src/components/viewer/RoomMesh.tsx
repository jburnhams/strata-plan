import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { Room } from '../../types';
import { generateRoomGeometry } from '../../services/geometry3d/roomGeometry';

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

  // Memoize geometry generation
  const roomGroup = useMemo(() => {
    const group = generateRoomGeometry(room);

    // Apply opacity settings immediately after generation
    if (wallOpacity < 1.0) {
       group.traverse((child) => {
         if ((child as THREE.Mesh).isMesh && child.userData.type === 'wall') {
            const mesh = child as THREE.Mesh;
            const mat = mesh.material;
            if (Array.isArray(mat)) {
                mat.forEach(m => {
                    m.transparent = true;
                    m.opacity = wallOpacity;
                    m.needsUpdate = true;
                });
            } else {
                mat.transparent = true;
                mat.opacity = wallOpacity;
                mat.needsUpdate = true;
            }
         }
       });
    }

    return group;
  }, [room, wallOpacity]);

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
