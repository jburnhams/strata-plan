import React from 'react';
import { useFloorplanStore } from '../../stores/floorplanStore';
import { useUIStore } from '../../stores/uiStore';
import { useMeasurementStore } from '../../stores/measurementStore';
import { PIXELS_PER_METER } from '../../constants/defaults';
import { MeasurementUnit } from '../../types/floorplan';
import { Position2D } from '../../types';

const formatDimension = (valueMeters: number, unit: MeasurementUnit = 'meters'): string => {
  if (unit === 'feet') {
    return `${(valueMeters * 3.28084).toFixed(2)} ft`;
  }
  return `${valueMeters.toFixed(2)} m`;
};

// Helper component for a single measurement line
const MeasurementLine: React.FC<{
  start: Position2D;
  end: Position2D;
  distance: number;
  unit: MeasurementUnit;
  fontSize: number;
  color?: string;
}> = ({ start, end, distance, unit, fontSize, color = '#2563eb' }) => {
  const midX = (start.x + end.x) / 2;
  const midZ = (start.z + end.z) / 2;
  const text = formatDimension(distance, unit);

  // Background rect calculation
  const paddingX = fontSize * 0.4;
  const paddingY = fontSize * 0.2;
  const textWidth = text.length * fontSize * 0.6; // approx
  const textHeight = fontSize;

  return (
    <g>
      {/* Line */}
      <line
        x1={start.x}
        y1={start.z}
        x2={end.x}
        y2={end.z}
        stroke={color}
        strokeWidth={0.05} // Fixed meter width or scale? 0.05m is 5cm.
        strokeDasharray="0.1 0.1"
      />

      {/* Endpoints */}
      <circle cx={start.x} cy={start.z} r={0.08} fill={color} />
      <circle cx={end.x} cy={end.z} r={0.08} fill={color} />

      {/* Label */}
      <rect
        x={midX - textWidth / 2 - paddingX}
        y={midZ - textHeight / 2 - paddingY}
        width={textWidth + paddingX * 2}
        height={textHeight + paddingY * 2}
        fill="white"
        fillOpacity={0.9}
        rx={paddingY}
        stroke={color}
        strokeWidth={0.02}
      />
      <text
        x={midX}
        y={midZ}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={fontSize}
        fill={color}
        style={{ userSelect: 'none', pointerEvents: 'none', fontWeight: 'bold' }}
      >
        {text}
      </text>
    </g>
  );
};

export const MeasurementOverlay: React.FC = () => {
  const selectedRoomIds = useFloorplanStore((state) => state.selectedRoomIds);
  const currentFloorplan = useFloorplanStore((state) => state.currentFloorplan);
  const zoomLevel = useUIStore((state) => state.zoomLevel);
  const { activeMeasurement, measurements } = useMeasurementStore();

  const units = currentFloorplan?.units || 'meters';
  const rooms = currentFloorplan?.rooms || [];
  const selectedRooms = rooms.filter(r => selectedRoomIds.includes(r.id));

  const hasContent = selectedRooms.length > 0 || activeMeasurement || measurements.length > 0;

  if (!hasContent) return null;

  // Font size calculation to remain constant on screen
  const FONT_SIZE_PIXELS = 12;
  const fontSize = FONT_SIZE_PIXELS / (PIXELS_PER_METER * zoomLevel);
  const offset = 20 / (PIXELS_PER_METER * zoomLevel);
  const paddingX = 4 / (PIXELS_PER_METER * zoomLevel);
  const paddingY = 2 / (PIXELS_PER_METER * zoomLevel);

  return (
    <g data-testid="measurement-overlay">
      {/* Selected Room Dimensions */}
      {selectedRooms.map(room => {
        const cx = room.position.x + room.length / 2;
        const cy = room.position.z + room.width / 2;
        const rotationTransform = room.rotation ? `rotate(${room.rotation}, ${cx}, ${cy})` : undefined;

        const lengthText = formatDimension(room.length, units);
        const widthText = formatDimension(room.width, units);

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

      {/* Active Tool Measurement */}
      {activeMeasurement && activeMeasurement.startPoint && activeMeasurement.endPoint && (
        <MeasurementLine
            start={activeMeasurement.startPoint}
            end={activeMeasurement.endPoint}
            distance={activeMeasurement.distance || 0}
            unit={units}
            fontSize={fontSize}
            color="#ec4899" // pink-500
        />
      )}

      {/* Persisted Measurements */}
      {measurements.map(m => (
          <MeasurementLine
            key={m.id}
            start={m.startPoint}
            end={m.endPoint}
            distance={m.distance}
            unit={units}
            fontSize={fontSize}
            color="#ec4899" // pink-500
        />
      ))}
    </g>
  );
};
