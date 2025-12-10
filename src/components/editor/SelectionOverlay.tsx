import React from 'react';
import { useFloorplanStore } from '../../stores/floorplanStore';
import { getRoomCorners, localToWorld } from '../../services/geometry/room';
import { BoundingBox } from '../../types';

interface SelectionOverlayProps {
  selectionBox: BoundingBox | null;
}

export const SelectionOverlay: React.FC<SelectionOverlayProps> = ({ selectionBox }) => {
  const { getSelectedRooms } = useFloorplanStore();
  const selectedRooms = getSelectedRooms();

  return (
    <g className="selection-overlay" pointerEvents="none" data-testid="selection-overlay">
       {/* Selection Box (Drag) */}
       {selectionBox && (
         <rect
           x={selectionBox.minX}
           y={selectionBox.minZ}
           width={selectionBox.maxX - selectionBox.minX}
           height={selectionBox.maxZ - selectionBox.minZ}
           fill="rgba(37, 99, 235, 0.1)"
           stroke="#2563eb"
           strokeDasharray="0.2 0.2"
           vectorEffect="non-scaling-stroke"
           data-testid="selection-box"
         />
       )}

       {/* Handles for selected rooms */}
       {selectedRooms.map(room => {
           const corners = getRoomCorners(room);
           const handleRadius = 0.15;
           const strokeWidth = 0.05;

           // Calculate Rotation Handle Position (above top/north edge)
           // Local (width/2, -0.5)
           // Width corresponds to X in local?
           // Room dimensions: length (x), width (z).
           // Center x = length/2.
           // Top edge z = 0.
           // Handle at (length/2, -0.8).
           const rotationHandlePos = localToWorld({ x: room.length / 2, z: -0.8 }, room);
           // Line to handle
           const rotationLineStart = localToWorld({ x: room.length / 2, z: 0 }, room);

           // Edge handles (midpoints)
           const topEdge = localToWorld({ x: room.length / 2, z: 0 }, room);
           const bottomEdge = localToWorld({ x: room.length / 2, z: room.width }, room);
           const leftEdge = localToWorld({ x: 0, z: room.width / 2 }, room);
           const rightEdge = localToWorld({ x: room.length, z: room.width / 2 }, room);

           return (
               <g key={room.id} pointerEvents="all">
                   {/* Rotation Handle */}
                   <line
                        x1={rotationLineStart.x}
                        y1={rotationLineStart.z}
                        x2={rotationHandlePos.x}
                        y2={rotationHandlePos.z}
                        stroke="#2563eb"
                        strokeWidth={0.05}
                   />
                   <circle
                        cx={rotationHandlePos.x}
                        cy={rotationHandlePos.z}
                        r={handleRadius}
                        fill="white"
                        stroke="#2563eb"
                        strokeWidth={strokeWidth}
                        className="cursor-pointer" // TODO: proper cursor
                        data-testid="handle-rotation"
                   />

                   {/* Corner Handles */}
                   {corners.map((corner, i) => (
                       <circle
                           key={`corner-${i}`}
                           cx={corner.x}
                           cy={corner.z}
                           r={handleRadius}
                           fill="#2563eb"
                           stroke="white"
                           strokeWidth={strokeWidth}
                           className="cursor-pointer" // TODO: proper resize cursors
                           data-testid={`handle-corner-${i}`}
                       />
                   ))}

                   {/* Edge Handles */}
                   {[topEdge, rightEdge, bottomEdge, leftEdge].map((pos, i) => (
                       <circle
                           key={`edge-${i}`}
                           cx={pos.x}
                           cy={pos.z}
                           r={handleRadius * 0.8}
                           fill="white"
                           stroke="#2563eb"
                           strokeWidth={strokeWidth}
                           className="cursor-pointer" // TODO: proper resize cursors
                           data-testid={`handle-edge-${i}`}
                       />
                   ))}
               </g>
           );
       })}
    </g>
  );
};
