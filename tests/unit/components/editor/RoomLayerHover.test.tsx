
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { RoomLayer } from '../../../../src/components/editor/RoomLayer';
import { useFloorplanStore } from '../../../../src/stores/floorplanStore';
import { useUIStore } from '../../../../src/stores/uiStore';
import { useRoomDrag } from '../../../../src/hooks/useRoomDrag';
import { Room } from '../../../../src/types';

// Mock dependencies
jest.mock('../../../../src/stores/floorplanStore');
jest.mock('../../../../src/stores/uiStore');
jest.mock('../../../../src/hooks/useRoomDrag');

// Manually mock the component that is imported
jest.mock('../../../../src/components/editor/RoomShape', () => {
    return {
        RoomShape: (props: any) => {
            return (
                <rect
                    data-testid={`room-mock-${props.room.id}`}
                    onMouseEnter={() => props.onMouseEnter(props.room.id)}
                    onMouseLeave={props.onMouseLeave}
                />
            );
        }
    };
});

describe('RoomLayer Hover States', () => {
    const mockSetHoveredRoom = jest.fn();
    const mockRooms = [
        { id: 'room1', type: 'bedroom', position: { x: 0, z: 0 }, length: 5, width: 5 }
    ] as Room[];

    beforeEach(() => {
        // Mock implementation to handle selectors
        (useFloorplanStore as unknown as jest.Mock).mockImplementation((selector) => {
            const state = {
                currentFloorplan: { rooms: mockRooms },
                selectedRoomIds: [],
                selectRoom: jest.fn(),
                setRoomSelection: jest.fn(),
            };
            return selector ? selector(state) : state;
        });

        (useUIStore as unknown as jest.Mock).mockImplementation((selector) => {
            const state = {
                hoveredRoomId: null,
                setHoveredRoom: mockSetHoveredRoom,
            };
            return selector ? selector(state) : state;
        });

        (useRoomDrag as unknown as jest.Mock).mockReturnValue({
            handleDragStart: jest.fn(),
            isDragging: false,
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('sets hovered room on mouse enter', () => {
        render(<svg><RoomLayer /></svg>);

        const room = screen.getByTestId('room-mock-room1');
        fireEvent.mouseEnter(room);

        expect(mockSetHoveredRoom).toHaveBeenCalledWith('room1');
    });

    it('clears hovered room on mouse leave', () => {
        render(<svg><RoomLayer /></svg>);

        const room = screen.getByTestId('room-mock-room1');
        fireEvent.mouseLeave(room);

        expect(mockSetHoveredRoom).toHaveBeenCalledWith(null);
    });
});
