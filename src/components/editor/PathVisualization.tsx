import React from 'react';
import { useFloorplanStore } from '../../stores/floorplanStore';
import { useUIStore } from '../../stores/uiStore';
import { findPath } from '../../services/adjacency/pathfinding';
import { getRoomCenter } from '../../services/geometry';
import { Room } from '../../types';

export const PathVisualization: React.FC = () => {
  const showPath = useUIStore((state) => state.showPath);
  const pathStartRoomId = useUIStore((state) => state.pathStartRoomId);
  const pathEndRoomId = useUIStore((state) => state.pathEndRoomId);
  const rooms = useFloorplanStore((state) => state.currentFloorplan?.rooms || []);
  const connections = useFloorplanStore((state) => state.currentFloorplan?.connections || []);

  if (!showPath || !pathStartRoomId || !pathEndRoomId) return null;

  const path = findPath(pathStartRoomId, pathEndRoomId, connections);

  if (path.length < 2) return null;

  const getRoom = (id: string) => rooms.find(r => r.id === id);

  // Generate path points (room centers)
  const points = path.map(id => {
    const room = getRoom(id);
    return room ? getRoomCenter(room) : null;
  }).filter((p): p is ReturnType<typeof getRoomCenter> => p !== null);

  if (points.length < 2) return null;

  // Create SVG path string
  const pathD = points.map((p, i) =>
    i === 0 ? `M ${p.x} ${p.z}` : `L ${p.x} ${p.z}`
  ).join(' ');

  return (
    <g className="pointer-events-none z-30 animate-pulse">
      {/* Halo effect */}
      <path
        d={pathD}
        fill="none"
        stroke="#10B981" // emerald-500
        strokeWidth={4}
        strokeOpacity={0.3}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      {/* Main path line */}
      <path
        d={pathD}
        fill="none"
        stroke="#10B981" // emerald-500
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="4,4"
        vectorEffect="non-scaling-stroke"
      />

      {/* Arrows (markers) */}
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#10B981" />
        </marker>
      </defs>

      {/* Draw arrows between segments? Or just one at end? */}
      {/* SVG markers work well on paths. Let's apply it to the main line. */}
      {/* But vector-effect non-scaling-stroke might mess with markers. */}
      {/* Let's manually draw arrowheads at midpoints if needed, but end marker is simpler. */}

      {/* Start Point */}
      <circle
        cx={points[0].x}
        cy={points[0].z}
        r={4}
        fill="#10B981"
        vectorEffect="non-scaling-stroke"
      />

      {/* End Point */}
      <circle
        cx={points[points.length - 1].x}
        cy={points[points.length - 1].z}
        r={4}
        fill="#10B981"
        vectorEffect="non-scaling-stroke"
      />
    </g>
  );
};
