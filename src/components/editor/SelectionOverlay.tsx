import React from 'react';
import { useFloorplanStore } from '../../stores/floorplanStore';
import { useUIStore } from '../../stores/uiStore';
import { PIXELS_PER_METER } from '../../constants/defaults';
import { useRoomResize, ResizeHandle } from '../../hooks/useRoomResize';

export const SelectionOverlay: React.FC = () => {
  const selectedRoomIds = useFloorplanStore((state) => state.selectedRoomIds);
  const currentFloorplan = useFloorplanStore((state) => state.currentFloorplan);
  const zoomLevel = useUIStore((state) => state.zoomLevel);
  const { handleResizeStart } = useRoomResize();

  const rooms = currentFloorplan?.rooms || [];
  const selectedRooms = rooms.filter(r => selectedRoomIds.includes(r.id));

  if (selectedRooms.length === 0) return null;

  // Calculate handle size in world units so it stays constant visual size
  // Visual size target: ~10px
  // screen_pixels = world_units * PIXELS_PER_METER * zoomLevel
  // world_units = screen_pixels / (PIXELS_PER_METER * zoomLevel)
  const HANDLE_SIZE_PIXELS = 10;
  const handleSize = HANDLE_SIZE_PIXELS / (PIXELS_PER_METER * zoomLevel);
  const halfHandle = handleSize / 2;

  // Stroke width for selection border
  const STROKE_WIDTH_PIXELS = 2;
  const strokeWidth = STROKE_WIDTH_PIXELS / (PIXELS_PER_METER * zoomLevel);

  const onHandleMouseDown = (e: React.MouseEvent, roomId: string, handle: ResizeHandle) => {
    // Only left click
    if (e.button !== 0) return;
    handleResizeStart(e, roomId, handle);
  };

  const handleHandleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <g data-testid="selection-overlay">
      {selectedRooms.map(room => {
        const cx = room.position.x + room.length / 2;
        const cy = room.position.z + room.width / 2;
        const rotationTransform = room.rotation ? `rotate(${room.rotation}, ${cx}, ${cy})` : undefined;

        return (
          <g key={room.id} transform={rotationTransform}>
            {/* Outline */}
            <rect
              x={room.position.x}
              y={room.position.z}
              width={room.length}
              height={room.width}
              fill="none"
              stroke="#2563eb"
              strokeWidth={strokeWidth}
              pointerEvents="none" // Click through to room/background
            />

            {/* Corner Handles */}
            {/* Top Left */}
            <rect
              x={room.position.x - halfHandle}
              y={room.position.z - halfHandle}
              width={handleSize}
              height={handleSize}
              fill="white"
              stroke="#2563eb"
              strokeWidth={strokeWidth}
              cursor="nw-resize"
              data-testid={`handle-nw-${room.id}`}
              onMouseDown={(e) => onHandleMouseDown(e, room.id, 'nw')}
              onClick={handleHandleClick}
            />
            {/* Top Right */}
            <rect
              x={room.position.x + room.length - halfHandle}
              y={room.position.z - halfHandle}
              width={handleSize}
              height={handleSize}
              fill="white"
              stroke="#2563eb"
              strokeWidth={strokeWidth}
              cursor="ne-resize"
              data-testid={`handle-ne-${room.id}`}
              onMouseDown={(e) => onHandleMouseDown(e, room.id, 'ne')}
              onClick={handleHandleClick}
            />
             {/* Bottom Left */}
             <rect
              x={room.position.x - halfHandle}
              y={room.position.z + room.width - halfHandle}
              width={handleSize}
              height={handleSize}
              fill="white"
              stroke="#2563eb"
              strokeWidth={strokeWidth}
              cursor="sw-resize"
              data-testid={`handle-sw-${room.id}`}
              onMouseDown={(e) => onHandleMouseDown(e, room.id, 'sw')}
              onClick={handleHandleClick}
            />
             {/* Bottom Right */}
             <rect
              x={room.position.x + room.length - halfHandle}
              y={room.position.z + room.width - halfHandle}
              width={handleSize}
              height={handleSize}
              fill="white"
              stroke="#2563eb"
              strokeWidth={strokeWidth}
              cursor="se-resize"
              data-testid={`handle-se-${room.id}`}
              onMouseDown={(e) => onHandleMouseDown(e, room.id, 'se')}
              onClick={handleHandleClick}
            />

            {/* Edge Handles */}
            {/* Top */}
             <rect
              x={cx - halfHandle}
              y={room.position.z - halfHandle}
              width={handleSize}
              height={handleSize}
              fill="white"
              stroke="#2563eb"
              strokeWidth={strokeWidth}
              cursor="n-resize"
              data-testid={`handle-n-${room.id}`}
              onMouseDown={(e) => onHandleMouseDown(e, room.id, 'n')}
              onClick={handleHandleClick}
            />
            {/* Bottom */}
            <rect
              x={cx - halfHandle}
              y={room.position.z + room.width - halfHandle}
              width={handleSize}
              height={handleSize}
              fill="white"
              stroke="#2563eb"
              strokeWidth={strokeWidth}
              cursor="s-resize"
              data-testid={`handle-s-${room.id}`}
              onMouseDown={(e) => onHandleMouseDown(e, room.id, 's')}
              onClick={handleHandleClick}
            />
             {/* Left */}
             <rect
              x={room.position.x - halfHandle}
              y={cy - halfHandle}
              width={handleSize}
              height={handleSize}
              fill="white"
              stroke="#2563eb"
              strokeWidth={strokeWidth}
              cursor="w-resize"
              data-testid={`handle-w-${room.id}`}
              onMouseDown={(e) => onHandleMouseDown(e, room.id, 'w')}
              onClick={handleHandleClick}
            />
            {/* Right */}
            <rect
              x={room.position.x + room.length - halfHandle}
              y={cy - halfHandle}
              width={handleSize}
              height={handleSize}
              fill="white"
              stroke="#2563eb"
              strokeWidth={strokeWidth}
              cursor="e-resize"
              data-testid={`handle-e-${room.id}`}
              onMouseDown={(e) => onHandleMouseDown(e, room.id, 'e')}
              onClick={handleHandleClick}
            />

            {/* Rotation Handle */}
            <line
                x1={cx} y1={room.position.z}
                x2={cx} y2={room.position.z - (30 / (PIXELS_PER_METER * zoomLevel))}
                stroke="#2563eb"
                strokeWidth={strokeWidth}
            />
            <circle
                cx={cx}
                cy={room.position.z - (30 / (PIXELS_PER_METER * zoomLevel))}
                r={handleSize / 1.5}
                fill="white"
                stroke="#2563eb"
                strokeWidth={strokeWidth}
                cursor="grab"
                onClick={handleHandleClick}
            />

          </g>
        );
      })}
    </g>
  );
};
