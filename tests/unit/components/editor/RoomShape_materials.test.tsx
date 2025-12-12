import React from 'react';
import { render, screen } from '@testing-library/react';
import { RoomShape } from '@/components/editor/RoomShape';
import { Room } from '@/types';
import { FLOOR_MATERIALS } from '@/constants/materialConfigs';

describe('RoomShape Material Representation', () => {
  const mockRoom: Room = {
    id: 'room-1',
    name: 'Bedroom',
    type: 'bedroom',
    length: 5,
    width: 4,
    height: 3,
    position: { x: 0, z: 0 },
    rotation: 0,
    floorMaterial: 'hardwood',
    wallMaterial: 'drywall-painted',
  } as Room;

  const defaultProps = {
    room: mockRoom,
    isSelected: false,
    isHovered: false,
    isOverlapping: false,
    onClick: jest.fn(),
    onDoubleClick: jest.fn(),
    onMouseDown: jest.fn(),
    onMouseEnter: jest.fn(),
    onMouseLeave: jest.fn(),
  };

  it('renders with floor material color', () => {
    render(
      <svg>
        <RoomShape {...defaultProps} />
      </svg>
    );

    const rect = screen.getByTestId('room-shape-room-1').querySelector('rect');
    const expectedColor = FLOOR_MATERIALS['hardwood'].defaultColor;
    expect(rect).toHaveAttribute('fill', expectedColor);
  });

  it('renders with custom floor color if provided', () => {
    const customRoom = { ...mockRoom, customFloorColor: '#123456' };
    render(
      <svg>
        <RoomShape {...defaultProps} room={customRoom} />
      </svg>
    );

    const rect = screen.getByTestId('room-shape-room-1').querySelector('rect');
    expect(rect).toHaveAttribute('fill', '#123456');
  });

  it('falls back to room type color if no material or custom color', () => {
    // Note: The store usually sets a default material, but if we clear it manually:
    const noMatRoom = { ...mockRoom, floorMaterial: undefined, customFloorColor: undefined };
    render(
      <svg>
        <RoomShape {...defaultProps} room={noMatRoom} />
      </svg>
    );

    const rect = screen.getByTestId('room-shape-room-1').querySelector('rect');
    // We expect it to be not the material color. We can just check it's defined.
    // In our implementation, it falls back to ROOM_TYPE_COLORS['bedroom']
    expect(rect).toHaveAttribute('fill');
    expect(rect?.getAttribute('fill')).not.toBe(FLOOR_MATERIALS['hardwood'].defaultColor);
  });
});
