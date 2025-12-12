import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { Text, Billboard, Detailed } from '@react-three/drei';
import * as THREE from 'three';
import { Room, Door, Window } from '../../types';
import { generateRoomGeometry } from '../../services/geometry3d/roomGeometry';

export interface RoomMeshProps {
  room: Room;
  doors?: Door[];
  windows?: Window[];
  isSelected: boolean;
  onSelect: (roomId: string) => void;
  showLabels?: boolean;
  wallOpacity?: number; // 0.0 to 1.0
  quality?: 'low' | 'medium' | 'high';
}

const RoomMeshComponent: React.FC<RoomMeshProps> = ({
  room,
  doors = [],
  windows = [],
  isSelected,
  onSelect,
  showLabels = true,
  wallOpacity = 1.0,
  quality = 'medium'
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  // Memoize geometry generation - High Detail
  const highDetailGroup = useMemo(() => {
    if (quality === 'low') return null;
    const group = generateRoomGeometry(room, doors, windows, { wallOpacity, detailLevel: 'high' });
    applyOpacity(group, wallOpacity);
    return group;
  }, [room, doors, windows, wallOpacity, quality]);

  // Memoize geometry generation - Low Detail
  const lowDetailGroup = useMemo(() => {
    const group = generateRoomGeometry(room, doors, windows, { wallOpacity, detailLevel: 'low' });
    applyOpacity(group, wallOpacity);
    return group;
  }, [room, doors, windows, wallOpacity]);

  function applyOpacity(group: THREE.Group, opacity: number) {
     if (opacity < 1.0) {
       group.traverse((child) => {
         if ((child as THREE.Mesh).isMesh && child.userData.type === 'wall') {
            const mesh = child as THREE.Mesh;
            const mat = mesh.material;
            if (Array.isArray(mat)) {
                mat.forEach(m => {
                    m.transparent = true;
                    m.opacity = opacity;
                    m.needsUpdate = true;
                });
            } else {
                mat.transparent = true;
                mat.opacity = opacity;
                mat.needsUpdate = true;
            }
         }
       });
    }
  }

  // Clean up resources when roomGroup changes or component unmounts
  useEffect(() => {
    return () => {
        [highDetailGroup, lowDetailGroup].forEach(group => {
            if (group) {
                group.traverse((child) => {
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
        });
    };
  }, [highDetailGroup, lowDetailGroup]);

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

  const renderGeometry = () => {
    if (quality === 'low') {
      return (
        <primitive
          object={lowDetailGroup}
          ref={groupRef}
          onClick={handleClick}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        />
      );
    }

    return (
      <Detailed distances={[0, 20]} ref={groupRef as any} onClick={handleClick} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
        <primitive object={highDetailGroup!} />
        <primitive object={lowDetailGroup} />
      </Detailed>
    );
  };

  return (
    <group>
      {renderGeometry()}

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
