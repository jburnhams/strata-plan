import React from 'react';
import { useFloorplanStore } from '../../stores/floorplanStore';
import { useUIStore } from '../../stores/uiStore';
import { PIXELS_PER_METER } from '../../constants/defaults';

export const WallOverlay: React.FC = () => {
    const walls = useFloorplanStore((state) => state.currentFloorplan?.walls || []);
    const selectedWallId = useFloorplanStore((state) => state.selectedWallId);
    const selectWall = useFloorplanStore((state) => state.selectWall);
    const zoomLevel = useUIStore((state) => state.zoomLevel);

    // Dynamic stroke width based on zoom to maintain visibility but not get too thin
    // But walls represent physical thickness (0.2m usually).
    // So we should render them with their physical thickness in meters converted to pixels.
    // HOWEVER, for selection or thin walls, we might want a minimum pixel width.

    // We should render the physical wall.
    // scale = PIXELS_PER_METER * zoomLevel.
    // strokeWidth = wall.thickness (meters).

    // For selection highlight, we can render a thicker line underneath or a color change.

    const handleWallClick = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        selectWall(id);
    };

    return (
        <g data-testid="wall-overlay">
            {walls.map(wall => {
                const isSelected = selectedWallId === wall.id;
                const strokeColor = isSelected ? '#2563eb' : '#333';
                const strokeWidth = wall.thickness;

                return (
                    <React.Fragment key={wall.id}>
                        {/* Selection Halo (invisible target area or visible halo) */}
                        {isSelected && (
                             <line
                                x1={wall.from.x}
                                y1={wall.from.z}
                                x2={wall.to.x}
                                y2={wall.to.z}
                                stroke="#3b82f6"
                                strokeWidth={wall.thickness + (0.2 / zoomLevel)} // Add 0.2m visual padding? No, pixels.
                                // If we want 4px padding: 4 / (PIXELS_PER_METER * zoomLevel)
                                opacity={0.3}
                             />
                        )}

                        {/* The Wall Itself */}
                        <line
                            x1={wall.from.x}
                            y1={wall.from.z}
                            x2={wall.to.x}
                            y2={wall.to.z}
                            stroke={strokeColor}
                            strokeWidth={strokeWidth}
                            strokeLinecap="butt" // Walls are usually butt capped?
                            onClick={(e) => handleWallClick(e, wall.id)}
                            style={{ cursor: 'pointer' }}
                            data-testid={`wall-${wall.id}`}
                        />
                    </React.Fragment>
                );
            })}
        </g>
    );
};

interface WallPreviewProps {
    isDrawing: boolean;
    startPoint: { x: number; z: number } | null;
    currentPoint: { x: number; z: number } | null;
}

export const WallPreview: React.FC<WallPreviewProps> = ({ isDrawing, startPoint, currentPoint }) => {
    if (!isDrawing || !startPoint || !currentPoint) return null;

    return (
        <g data-testid="wall-preview">
            <line
                x1={startPoint.x}
                y1={startPoint.z}
                x2={currentPoint.x}
                y2={currentPoint.z}
                stroke="#666"
                strokeWidth={0.2}
                strokeDasharray="0.1, 0.1" // 0.1m dash
                opacity={0.7}
            />
             {/* Length Label */}
             <text
                x={(startPoint.x + currentPoint.x) / 2}
                y={(startPoint.z + currentPoint.z) / 2}
                textAnchor="middle"
                fill="#666"
                fontSize={0.3} // 0.3m height
             >
                {Math.sqrt(Math.pow(currentPoint.x - startPoint.x, 2) + Math.pow(currentPoint.z - startPoint.z, 2)).toFixed(2)}m
             </text>
        </g>
    );
};
