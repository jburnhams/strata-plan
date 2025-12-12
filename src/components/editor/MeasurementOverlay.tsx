import React from 'react';
import { useFloorplanStore } from '../../stores/floorplanStore';
import { useUIStore } from '../../stores/uiStore';
import { PIXELS_PER_METER } from '../../constants/defaults';
import { MeasurementUnit } from '../../types/floorplan';

const formatDimension = (valueMeters: number, unit: MeasurementUnit = 'meters'): string => {
  if (unit === 'feet') {
    return `${(valueMeters * 3.28084).toFixed(2)} ft`;
  }
  return `${valueMeters.toFixed(2)} m`;
};

export const MeasurementOverlay: React.FC = () => {
  const selectedRoomIds = useFloorplanStore((state) => state.selectedRoomIds);
  const currentFloorplan = useFloorplanStore((state) => state.currentFloorplan);
  const zoomLevel = useUIStore((state) => state.zoomLevel);

  const rooms = currentFloorplan?.rooms || [];
  const selectedRooms = rooms.filter(r => selectedRoomIds.includes(r.id));

  if (selectedRooms.length === 0) return null;

  // Font size calculation to remain constant on screen
  // Target: 12px
  const FONT_SIZE_PIXELS = 12;
  const fontSize = FONT_SIZE_PIXELS / (PIXELS_PER_METER * zoomLevel);
  // Offset from the room edge
  const offset = 20 / (PIXELS_PER_METER * zoomLevel);

  // Padding for the background pill
  const paddingX = 4 / (PIXELS_PER_METER * zoomLevel);
  const paddingY = 2 / (PIXELS_PER_METER * zoomLevel);

  return (
    <g data-testid="measurement-overlay">
      {selectedRooms.map(room => {
        const cx = room.position.x + room.length / 2;
        const cy = room.position.z + room.width / 2;
        const rotationTransform = room.rotation ? `rotate(${room.rotation}, ${cx}, ${cy})` : undefined;

        const units = currentFloorplan?.units || 'meters';
        const lengthText = formatDimension(room.length, units);
        const widthText = formatDimension(room.width, units);

        // Approx text width/height for background rect calculation
        // This is a rough estimation since we don't have measureText in SVG without DOM
        // Assuming ~0.6em width per char is a standard approximation for sans-serif fonts
        const charWidth = fontSize * 0.6;
        const lengthTextWidth = lengthText.length * charWidth;
        const widthTextWidth = widthText.length * charWidth;
        const textHeight = fontSize;

        return (
          <g key={room.id} transform={rotationTransform}>
             {/* Length Dimension (Top Edge) */}
             <g>
               <rect
                 x={room.position.x + room.length / 2 - lengthTextWidth / 2 - paddingX}
                 y={room.position.z - offset - textHeight / 2 - paddingY}
                 width={lengthTextWidth + paddingX * 2}
                 height={textHeight + paddingY * 2}
                 fill="white"
                 fillOpacity={0.8}
                 rx={paddingY * 2}
               />
               <text
                  x={room.position.x + room.length / 2}
                  y={room.position.z - offset}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={fontSize}
                  fill="#2563eb"
                  style={{ userSelect: 'none', pointerEvents: 'none' }}
               >
                  {lengthText}
               </text>
             </g>

             {/* Width Dimension (Left Edge) */}
             <g>
               <rect
                 x={room.position.x - offset - widthTextWidth - paddingX}
                 y={room.position.z + room.width / 2 - textHeight / 2 - paddingY}
                 width={widthTextWidth + paddingX * 2}
                 height={textHeight + paddingY * 2}
                 fill="white"
                 fillOpacity={0.8}
                 rx={paddingY * 2}
               />
               <text
                  x={room.position.x - offset}
                  y={room.position.z + room.width / 2}
                  textAnchor="end"
                  dominantBaseline="middle"
                  fontSize={fontSize}
                  fill="#2563eb"
                  style={{ userSelect: 'none', pointerEvents: 'none' }}
               >
                  {widthText}
               </text>
             </g>
          </g>
        );
      })}
    </g>
  );
};
