import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { Text, Billboard, Detailed } from '@react-three/drei';
import * as THREE from 'three';
import { Room, Door, Window, WallSide } from '../../types';
import { generateRoomGeometry } from '../../services/geometry3d/roomGeometry';
import { DoorMesh } from './DoorMesh';
import { WindowMesh } from './WindowMesh';

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

  // Filter doors and windows for this room
  const roomDoors = useMemo(() => doors.filter(d => d.roomId === room.id), [doors, room.id]);
  const roomWindows = useMemo(() => windows.filter(w => w.roomId === room.id), [windows, room.id]);

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
                if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshBasicMaterial) {
                    mat.depthWrite = false; // Helps with transparency sorting
                }
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

  // Helper to calculate transform for openings
  const getOpeningTransform = (item: Door | Window) => {
    const isRotated = room.rotation === 90 || room.rotation === 270;
    const widthX = isRotated ? room.width : room.length;
    const depthZ = isRotated ? room.length : room.width;

    // Map logical side to physical geometry side (matches roomGeometry.ts logic)
    // Actually, we need to map LOGICAL side (from item) to PHYSICAL position
    // The room geometry generation logic mapped PHYSICAL side to LOGICAL to find items.
    // Here we have the item with a LOGICAL side, and we need to find where that is PHYSICALLY.

    // Inverse mapping of rotation:
    // Rot 0: North -> North (-Z)
    // Rot 90: North -> East (+X)
    // Rot 180: North -> South (+Z)
    // Rot 270: North -> West (-X)

    let physicalSide: WallSide = item.wallSide;

    // Apply room rotation to find physical side
    // Logic: If room is rotated 90 deg (CW), then the logical North wall is now facing East.
    const sides: WallSide[] = ['north', 'east', 'south', 'west'];
    const sideIndex = sides.indexOf(item.wallSide);
    // room.rotation is 0, 90, 180, 270
    const rotIndex = (room.rotation / 90) % 4;
    const physicalSideIndex = (sideIndex + rotIndex) % 4;
    physicalSide = sides[physicalSideIndex];

    let position = new THREE.Vector3();
    let rotation = new THREE.Euler();

    // Determine position based on physical side
    // Note: Geometry generation uses inverted position (1 - pos) for outward normals.
    // We must match that.
    const correctedPos = 1 - item.position;

    // Physical dimensions (widthX = X axis length, depthZ = Z axis length)
    switch (physicalSide) {
        case 'north': // Back, -Z direction, spans X
            position.x = correctedPos * widthX;
            position.z = 0;
            // North wall faces -Z (outward).
            // Geometry was rotated Y 180.
            rotation.y = Math.PI;
            // Wait, wall geometry logic:
            // North (Back): Min Z. Normal -Z.
            // Shape 0->widthX.
            // Geo Rotate Y 180. Translate X widthX.
            // If pos=0 (Right end looking from inside, Left looking from outside), x = 1 * widthX.
            // If pos=1 (Left end looking from inside), x = 0.
            // Wait, 1-pos means:
            // If item.position = 0 (Left), corrected = 1. x = widthX.
            // If item.position = 1 (Right), corrected = 0. x = 0.
            // Let's re-verify "Left" convention.
            // Usually position 0 is left, 1 is right.
            // roomGeometry.ts: "We invert the position (1-pos) because we generate walls with 'Outward' normals"

            // So for North Wall (facing -Z):
            // It's at Z=0 relative to room origin?
            // roomGeometry: `group.position.set(room.position.x, 0, room.position.z)`
            // North Wall Geo: `northWallGeo.translate(widthX, 0, 0);` (after rot Y 180).
            // Rot Y 180 flips X and Z.
            // Shape (0,0) -> (w,0).
            // Rot 180: (0,0) -> (0,0), (w,0) -> (-w, 0).
            // Translate X widthX: (0,0) -> (widthX, 0), (-w,0) -> (0,0).
            // So the wall spans X from 0 to widthX.
            // Normal is -Z.

            // Hole logic: x = correctedRel * w.
            // If pos=0, corrected=1, x=w.
            // If pos=1, corrected=0, x=0.
            // So pos=0 is at X=widthX (Right side of wall if facing -Z).
            // But wait, if I face -Z (North), X axis goes Right.
            // So X=widthX is Right. X=0 is Left.
            // So pos=0 corresponds to Right? That seems inverted for "Left-to-Right".

            // Let's stick to the coordinate calc:
            position.x = correctedPos * widthX;
            position.z = 0; // At Z=0 (North edge of room AABB)
            rotation.y = Math.PI; // Face -Z
            break;

        case 'south': // Front, +Z direction, spans X
            position.x = correctedPos * widthX;
            position.z = depthZ;
            // South wall faces +Z.
            // Geo Translate Z depthZ. No rotation.
            // Shape 0->w.
            // If pos=0, corrected=1, x=w.
            // If pos=1, corrected=0, x=0.
            // Facing +Z: X axis goes Left. (Wait, standard right-handed: X is Right).
            // So X=w is Right. X=0 is Left.
            // So pos=0 is at Right.

            rotation.y = 0;
            break;

        case 'east': // Right, +X direction, spans Z
            // East Wall Geo: Rotate Y 90. Translate X widthX, Z depthZ.
            // Shape (spans Z? No, createWallShape(depthZ, ...) spans X in local shape space).
            // Local shape X maps to World Z.
            // Rot Y 90: X->Z, Z->X.
            // (0,0) -> (0,0). (depthZ, 0) -> (0, -depthZ)? No.
            // Rot Y 90: (x,z) -> (z, -x)? No. (x,0,z) -> (z, 0, -x).
            // Shape point (d, 0, 0). Rot -> (0, 0, -d).
            // Translate (widthX, 0, depthZ).
            // Point (0,0,0) -> (widthX, 0, depthZ).
            // Point (d,0,0) -> (widthX, 0, 0).
            // So wall spans Z from 0 to depthZ at X=widthX.
            // Normal +X.

            // Hole x = correctedRel * depthZ.
            // If pos=0, corrected=1, x=depthZ. Point -> (widthX, 0, 0). (Min Z)
            // If pos=1, corrected=0, x=0. Point -> (widthX, 0, depthZ). (Max Z)
            // So pos=0 is at Z=0 (North). pos=1 is at Z=depthZ (South).
            // Facing +X (East): Left is North (Z=0). Right is South (Z=depthZ).
            // So pos=0 is Left. Matches!

            // Wait, for North/South walls, pos=0 resulted in Right?
            // North: pos=0 -> X=widthX. Facing -Z. Left is X=widthX?
            // Facing -Z (looking into screen). X is Right.
            // So X=widthX is Right.
            // So pos=0 is Right.

            // Standard convention is usually Left-to-Right from *Inside* or *Outside*?
            // "from left/top" usually implies coordinate sort order or looking at the face.
            // If the code works consistently, I should just replicate the coordinate math.

            // Mapping shape local X (which is hole center) to world space.
            // shape X = correctedPos * depthZ.
            // World X = widthX.
            // World Z = depthZ - shape X (due to rotation logic above: (0)->depthZ, (d)->0).
            position.x = widthX;
            position.z = depthZ - (correctedPos * depthZ);

            rotation.y = Math.PI / 2;
            break;

        case 'west': // Left, -X direction, spans Z
            // West Wall Geo: Rotate Y -90.
            // Shape spans depthZ.
            // Rot -90: (x,0,z) -> (-z, 0, x).
            // Shape (d, 0, 0) -> (0, 0, d).
            // Shape (0, 0, 0) -> (0, 0, 0).
            // Wall spans Z from 0 to depthZ at X=0.
            // Normal -X.

            // Hole x = correctedPos * depthZ.
            // If pos=0, corrected=1, x=depthZ. Point -> (0, 0, depthZ). (Max Z)
            // If pos=1, corrected=0, x=0. Point -> (0, 0, 0). (Min Z)

            // Facing -X (West): Left is South (Max Z). Right is North (Min Z).
            // pos=0 is Max Z (Left).
            // So this seems consistent with "Left to Right" when facing the wall from OUTSIDE?
            // Or Inside?
            // Normal is Outward (-X).
            // Facing -X means looking towards West.
            // Left is South (Z+). Right is North (Z-).
            // So pos=0 (Z+) is Left.

            // Mapping shape local X to world space.
            // shape X = correctedPos * depthZ.
            // World X = 0.
            // World Z = shape X.

            position.x = 0;
            position.z = correctedPos * depthZ;

            rotation.y = -Math.PI / 2;
            break;
    }

    return { position, rotation };
  };

  return (
    <group>
      {/* Base Room Geometry */}
      {renderGeometry()}

      {/* Door Meshes */}
      {quality !== 'low' && roomDoors.map(door => {
        const { position, rotation } = getOpeningTransform(door);
        return (
            <group key={door.id} position={[room.position.x, 0, room.position.z]}>
                <group position={position} rotation={rotation}>
                    <DoorMesh door={door} />
                </group>
            </group>
        );
      })}

      {/* Window Meshes */}
      {quality !== 'low' && roomWindows.map(window => {
        const { position, rotation } = getOpeningTransform(window);
        const windowPos = position.clone();
        windowPos.y += window.sillHeight; // Add sill height

        return (
            <group key={window.id} position={[room.position.x, 0, room.position.z]}>
                <group position={windowPos} rotation={rotation}>
                    <WindowMesh window={window} />
                </group>
            </group>
        );
      })}

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
