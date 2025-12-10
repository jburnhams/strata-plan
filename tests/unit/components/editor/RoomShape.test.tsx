import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { RoomShape } from '../../../../src/components/editor/RoomShape';
import { Room, RoomType } from '../../../../src/types';

describe('RoomShape', () => {
  const mockRoom: Room = {
    id: 'room-1',
    name: 'Living Room',
    type: 'living',
    length: 5,
    width: 4,
    height: 2.4,
    position: { x: 0, z: 0 },
    rotation: 0,
  };

  const defaultProps = {
    room: mockRoom,
    isSelected: false,
    isHovered: false,
    onClick: jest.fn(),
    onMouseEnter: jest.fn(),
    onMouseLeave: jest.fn(),
  };

  it('renders room with correct dimensions', () => {
    render(
      <svg>
        <RoomShape {...defaultProps} />
      </svg>
    );

    // Note: rect is not direct child of svg in test, it's inside g inside RoomShape
    // We can query by role or just internal rect attributes if we can find it.
    // RoomShape doesn't have a role, but rect inside does if we give it one, or we use container.
    // The component has data-testid="room-shape-{id}" on the group.

    const group = screen.getByTestId('room-shape-room-1');
    const rect = group.querySelector('rect');

    expect(rect).toHaveAttribute('width', '5');
    expect(rect).toHaveAttribute('height', '4');
    expect(rect).toHaveAttribute('x', '0');
    expect(rect).toHaveAttribute('y', '0');
  });

  it('renders label with name and area', () => {
    render(
        <svg>
          <RoomShape {...defaultProps} />
        </svg>
      );

      expect(screen.getByText('Living Room')).toBeInTheDocument();
      expect(screen.getByText('20.0 m²')).toBeInTheDocument();
  });

  it('hides label for small rooms', () => {
    const smallRoom = { ...mockRoom, length: 0.5, width: 0.5 };
    render(
        <svg>
          <RoomShape {...defaultProps} room={smallRoom} />
        </svg>
      );

      expect(screen.queryByText('Living Room')).not.toBeInTheDocument();
  });

  it('shows selection handles when selected', () => {
    render(
        <svg>
          <RoomShape {...defaultProps} isSelected={true} />
        </svg>
      );

      // We expect 4 handle rects + 1 main rect = 5 rects
      const group = screen.getByTestId('room-shape-room-1');
      const rects = group.querySelectorAll('rect');
      expect(rects.length).toBeGreaterThan(1);
  });

  it('calls onClick handler', () => {
    render(
        <svg>
          <RoomShape {...defaultProps} />
        </svg>
      );

      const group = screen.getByTestId('room-shape-room-1');
      fireEvent.click(group);

      expect(defaultProps.onClick).toHaveBeenCalledWith(expect.any(Object), 'room-1');
  });

  it('handles rotation transform', () => {
    const rotatedRoom = { ...mockRoom, rotation: 45 };
    render(
        <svg>
          <RoomShape {...defaultProps} room={rotatedRoom} />
        </svg>
      );

      const group = screen.getByTestId('room-shape-room-1');
      // Center should be 2.5, 2.0
      expect(group).toHaveAttribute('transform', 'rotate(45, 2.5, 2)');
  });
});
