import React from 'react';
import { render, screen } from '@testing-library/react';
import { RoomShape } from '../../../../src/components/editor/RoomShape';
import { Room } from '../../../../src/types';

const mockRoom: Room = {
  id: 'room-1',
  name: 'Living Room',
  length: 5,
  width: 4,
  height: 2.7,
  type: 'living',
  position: { x: 0, z: 0 },
  rotation: 0,
  doors: [],
  windows: []
};

describe('RoomShape', () => {
  const props = {
    room: mockRoom,
    isSelected: false,
    isHovered: false,
    onMouseDown: jest.fn(),
    onDoubleClick: jest.fn(),
    onPointerEnter: jest.fn(),
    onPointerLeave: jest.fn(),
  };

  it('renders room rectangle', () => {
    render(
      <svg>
        <RoomShape {...props} />
      </svg>
    );
    const roomGroup = screen.getByTestId('room-room-1');
    expect(roomGroup).toBeInTheDocument();

    // Check rect
    const rect = roomGroup.querySelector('rect');
    expect(rect).toHaveAttribute('width', '5');
    expect(rect).toHaveAttribute('height', '4');
  });

  it('renders label', () => {
    render(
      <svg>
        <RoomShape {...props} />
      </svg>
    );
    expect(screen.getByText('Living Room')).toBeInTheDocument();
    expect(screen.getByText(/20.0 m²/)).toBeInTheDocument();
  });

  it('does NOT render selection handles internally (moved to overlay)', () => {
    render(
      <svg>
        <RoomShape {...props} isSelected={true} />
      </svg>
    );
    const roomGroup = screen.getByTestId('room-room-1');
    const circles = roomGroup.querySelectorAll('circle');
    expect(circles.length).toBe(0);
  });

  it('applies rotation transform', () => {
    const rotatedRoom: Room = { ...mockRoom, rotation: 90 };
    render(
      <svg>
        <RoomShape {...props} room={rotatedRoom} />
      </svg>
    );
    const roomGroup = screen.getByTestId('room-room-1');
    expect(roomGroup.getAttribute('transform')).toContain('rotate(90');
  });
});
