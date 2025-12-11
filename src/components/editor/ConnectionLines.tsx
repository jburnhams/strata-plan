import React from 'react';
import { useFloorplanStore } from '../../stores/floorplanStore';
import { useUIStore } from '../../stores/uiStore';
import { getRoomCenter, getRoomWallSegments } from '../../services/geometry';
import { detectAdjacency } from '../../services/adjacency/detection';
import { Position2D, Room, WallSide } from '../../types';

export const ConnectionLines: React.FC = () => {
  const showConnections = useUIStore((state) => state.showConnections);
  const connections = useFloorplanStore((state) => state.currentFloorplan?.connections || []);
  const rooms = useFloorplanStore((state) => state.currentFloorplan?.rooms || []);
  const doors = useFloorplanStore((state) => state.currentFloorplan?.doors || []);

  if (!showConnections) {
    return null;
  }

  const getRoom = (id: string) => rooms.find((r) => r.id === id);

  return (
    <g className="pointer-events-none z-20">
      {connections.map((connection) => {
        const room1 = getRoom(connection.room1Id);
        const room2 = getRoom(connection.room2Id);

        if (!room1 || !room2) return null;

        const center1 = getRoomCenter(room1);
        const center2 = getRoomCenter(room2);

        // Calculate shared segment for visualization
        const adjacency = detectAdjacency(room1, room2);
        let sharedSegmentPoints: { start: Position2D, end: Position2D } | null = null;

        if (adjacency) {
            const { sharedWall } = adjacency;
            const segments = getRoomWallSegments(room1);
            const wallSegment = segments.find(s => s.wallSide === sharedWall.room1Wall);

            if (wallSegment) {
                // Interpolate using startPosition and endPosition
                const dx = wallSegment.to.x - wallSegment.from.x;
                const dz = wallSegment.to.z - wallSegment.from.z;

                sharedSegmentPoints = {
                    start: {
                        x: wallSegment.from.x + dx * sharedWall.startPosition,
                        z: wallSegment.from.z + dz * sharedWall.startPosition
                    },
                    end: {
                        x: wallSegment.from.x + dx * sharedWall.endPosition,
                        z: wallSegment.from.z + dz * sharedWall.endPosition
                    }
                };
            }
        }

        // Doors on this connection
        const connectionDoors = doors.filter(d => d.connectionId === connection.id);
        const isManual = connection.isManual;

        return (
          <g key={connection.id}>
             <title>{`${room1.name} ↔ ${room2.name} (${isManual ? 'Manual Link' : `${connection.sharedWallLength.toFixed(2)}m shared`})`}</title>

            {/* Connection Line (Room Center to Room Center) */}
            <line
              x1={center1.x}
              y1={center1.z}
              x2={center2.x}
              y2={center2.z}
              stroke={isManual ? "#A855F7" : "#9CA3AF"} // Purple for manual, Gray for auto
              strokeWidth={isManual ? 2 : 1}
              vectorEffect="non-scaling-stroke"
              strokeDasharray={isManual ? "4,2" : "5,5"}
              opacity={0.6}
            />

            {/* Shared Wall Highlight */}
            {sharedSegmentPoints && (
                 <line
                 x1={sharedSegmentPoints.start.x}
                 y1={sharedSegmentPoints.start.z}
                 x2={sharedSegmentPoints.end.x}
                 y2={sharedSegmentPoints.end.z}
                 stroke="#3B82F6" // Blue-500
                 strokeWidth={4}
                 vectorEffect="non-scaling-stroke"
                 opacity={0.8}
               />
            )}

            {/* Connection Dots */}
            <circle
                cx={center1.x}
                cy={center1.z}
                r={3}
                vectorEffect="non-scaling-stroke"
                fill="#9CA3AF"
                opacity={0.6}
            />
             <circle
                cx={center2.x}
                cy={center2.z}
                r={3}
                vectorEffect="non-scaling-stroke"
                fill="#9CA3AF"
                opacity={0.6}
            />

             {/* Door Indicators */}
             {sharedSegmentPoints && connectionDoors.map(door => {
                // Calculate door position in world space
                // It should be along the shared wall segment
                // door.position is relative to the room wall, but we want it relative to the shared segment?
                // Actually door.position is 0-1 along the *room's* wall.
                // We can use the same interpolation logic as sharedSegmentPoints but using door.position.

                // Note: This assumes door.position is along the same wall side as detected in adjacency.
                // If the door is stored on room1, we use room1's wall.

                const segments = getRoomWallSegments(room1);
                const wallSegment = segments.find(s => s.wallSide === door.wallSide);

                if (wallSegment && door.roomId === room1.id) {
                     const dx = wallSegment.to.x - wallSegment.from.x;
                     const dz = wallSegment.to.z - wallSegment.from.z;
                     const doorX = wallSegment.from.x + dx * door.position;
                     const doorZ = wallSegment.from.z + dz * door.position;

                     return (
                         <g key={door.id}>
                            <circle
                                cx={doorX}
                                cy={doorZ}
                                r={2}
                                vectorEffect="non-scaling-stroke"
                                fill="white"
                                stroke="#EF4444"
                                strokeWidth={2}
                            />
                         </g>
                     );
                } else if (door.roomId === room2.id) {
                    // Similar logic if door is stored on room2 side
                    const segments2 = getRoomWallSegments(room2);
                    const wallSegment2 = segments2.find(s => s.wallSide === door.wallSide);
                     if (wallSegment2) {
                         const dx = wallSegment2.to.x - wallSegment2.from.x;
                         const dz = wallSegment2.to.z - wallSegment2.from.z;
                         const doorX = wallSegment2.from.x + dx * door.position;
                         const doorZ = wallSegment2.from.z + dz * door.position;

                         return (
                            <g key={door.id}>
                               <circle
                                   cx={doorX}
                                   cy={doorZ}
                                   r={2}
                                   vectorEffect="non-scaling-stroke"
                                   fill="white"
                                   stroke="#EF4444"
                                   strokeWidth={2}
                               />
                            </g>
                        );
                     }
                }
                return null;
             })}
          </g>
        );
      })}
    </g>
  );
};
