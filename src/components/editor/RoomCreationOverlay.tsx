import React, { useMemo, useState } from 'react';
import { useFloorplanStore } from '../../stores/floorplanStore';
import { findEnclosedAreas, createRoomFromPolygon, DetectedPolygon } from '../../services/roomDetection';

export const RoomCreationOverlay = () => {
  const walls = useFloorplanStore(state => state.currentFloorplan?.walls || []);
  const rooms = useFloorplanStore(state => state.currentFloorplan?.rooms || []);
  const addRoom = useFloorplanStore(state => state.addRoom);

  const polygons = useMemo(() => {
     const candidates = findEnclosedAreas(walls);
     // Filter out candidates that are already rooms
     return candidates.filter(poly => {
         const potentialRoomData = createRoomFromPolygon(poly);

         const pCenter = {
             x: potentialRoomData.position.x + potentialRoomData.length/2,
             z: potentialRoomData.position.z + potentialRoomData.width/2
         };

         return !rooms.some(room => {
             const rCenter = {
                 x: room.position.x + room.length/2,
                 z: room.position.z + room.width/2
             };
             const dist = Math.sqrt(Math.pow(pCenter.x - rCenter.x, 2) + Math.pow(pCenter.z - rCenter.z, 2));
             // If centers are very close (< 0.5m) and areas are similar
             return dist < 0.5 && Math.abs( (room.length * room.width) - poly.area ) < 1.0;
         });
     });
  }, [walls, rooms]);

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (polygons.length === 0) return null;

  const handlePolygonClick = (polygon: DetectedPolygon, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent deselection or other clicks

    const roomData = createRoomFromPolygon(polygon);
    addRoom({
        name: 'New Room',
        type: 'other',
        length: roomData.length,
        width: roomData.width,
        height: 2.4,
        position: roomData.position,
        rotation: 0
    });
    setHoveredIndex(null);
  };

  return (
    <g className="room-creation-layer" data-testid="room-creation-overlay">
      {polygons.map((polygon, index) => {
        const pathData = polygon.vertices.map((v, i) =>
            `${i === 0 ? 'M' : 'L'} ${v.x} ${v.z}`
        ).join(' ') + ' Z';

        const isHovered = hoveredIndex === index;
        const center = {
            x: createRoomFromPolygon(polygon).position.x + createRoomFromPolygon(polygon).length / 2,
            z: createRoomFromPolygon(polygon).position.z + createRoomFromPolygon(polygon).width / 2
        };

        return (
            <g key={index} onClick={(e) => handlePolygonClick(polygon, e)}>
                <path
                    d={pathData}
                    fill={isHovered ? 'rgba(59, 130, 246, 0.2)' : 'transparent'}
                    stroke={isHovered ? 'rgba(59, 130, 246, 0.5)' : 'transparent'}
                    strokeWidth={0.05}
                    vectorEffect="non-scaling-stroke"
                    className="cursor-pointer pointer-events-auto transition-all duration-200"
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                />
                {isHovered && (
                   <text
                      x={center.x}
                      y={center.z}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#3b82f6"
                      fontSize="0.3"
                      className="pointer-events-none select-none font-bold"
                   >
                     Click to Create Room
                   </text>
                )}
            </g>
        );
      })}
    </g>
  );
};
