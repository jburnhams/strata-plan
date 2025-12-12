import React from 'react';
import { render, screen } from '@testing-library/react';
import { RoomShape } from '@/components/editor/RoomShape';
import { Room } from '@/types/room';
import { FLOOR_MATERIALS } from '@/constants/materialConfigs';

describe('RoomShape Materials', () => {
  const mockProps = {
    room: {
      id: 'room-1',
      name: 'Test Room',
      type: 'bedroom',
      length: 4,
      width: 4,
      height: 2.7,
      position: { x: 0, z: 0 },
      rotation: 0,
      floorMaterial: 'hardwood',
      wallMaterial: 'drywall-white',
      ceilingMaterial: 'drywall',
    } as Room,
    isSelected: false,
    isHovered: false,
    isOverlapping: false,
    onClick: jest.fn(),
    onDoubleClick: jest.fn(),
    onMouseDown: jest.fn(),
    onMouseEnter: jest.fn(),
    onMouseLeave: jest.fn(),
  };

  it('uses floor material default color when no custom color is set', () => {
    render(<svg><RoomShape {...mockProps} /></svg>);

    // We need to check the fill attribute of the rect
    // The RoomShape renders a group <g>, and the <rect> is inside it
    const roomGroup = screen.getByTestId('room-shape-room-1');
    const rect = roomGroup.querySelector('rect');

    // Hardwood default color is defined in FLOOR_MATERIALS
    expect(rect).toHaveAttribute('fill', FLOOR_MATERIALS.hardwood.defaultColor);
  });

  it('uses custom floor color when set, overriding material', () => {
    const customColor = '#123456';
    const propsWithCustomColor = {
      ...mockProps,
      room: {
        ...mockProps.room,
        customFloorColor: customColor,
      } as Room
    };

    render(<svg><RoomShape {...propsWithCustomColor} /></svg>);

    const roomGroup = screen.getByTestId('room-shape-room-1');
    const rect = roomGroup.querySelector('rect');

    expect(rect).toHaveAttribute('fill', customColor);
  });

  it('falls back to room type color if no material or custom color', () => {
    const propsNoMaterial = {
      ...mockProps,
      room: {
        ...mockProps.room,
        floorMaterial: undefined,
        customFloorColor: undefined,
      } as Room
    };

    render(<svg><RoomShape {...propsNoMaterial} /></svg>);

    const roomGroup = screen.getByTestId('room-shape-room-1');
    const rect = roomGroup.querySelector('rect');

    // It should not be the hardwood color, but the bedroom type default color
    expect(rect).not.toHaveAttribute('fill', FLOOR_MATERIALS.hardwood.defaultColor);
    // It should have some fill
    expect(rect).toHaveAttribute('fill');
  });
});
