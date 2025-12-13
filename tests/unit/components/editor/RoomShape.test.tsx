import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { RoomShape } from '../../../../src/components/editor/RoomShape';
import { Room } from '../../../../src/types';
import { DEFAULT_WALL_THICKNESS } from '../../../../src/constants/defaults';

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
    onDoubleClick: jest.fn(),
    onMouseDown: jest.fn(),
    onMouseEnter: jest.fn(),
    onMouseLeave: jest.fn(),
  };

  it('renders room with correct dimensions', () => {
    render(
      <svg>
        <RoomShape {...defaultProps} />
      </svg>
    );

    const group = screen.getByTestId('room-shape-room-1');
    const rect = group.querySelector('rect');

    expect(rect).toHaveAttribute('width', '5');
    expect(rect).toHaveAttribute('height', '4');
    expect(rect).toHaveAttribute('x', '0');
    expect(rect).toHaveAttribute('y', '0');
    // Should use default wall thickness for stroke width
    expect(rect).toHaveAttribute('stroke-width', String(DEFAULT_WALL_THICKNESS));
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

  it('does NOT show selection handles when selected (moved to SelectionOverlay)', () => {
    render(
        <svg>
          <RoomShape {...defaultProps} isSelected={true} />
        </svg>
      );

      const group = screen.getByTestId('room-shape-room-1');
      const rects = group.querySelectorAll('rect');
      // Should ONLY have the main rect
      expect(rects.length).toBe(1);
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

  it('calls onDoubleClick handler', () => {
    render(
        <svg>
          <RoomShape {...defaultProps} />
        </svg>
      );

      const group = screen.getByTestId('room-shape-room-1');
      fireEvent.doubleClick(group);

      expect(defaultProps.onDoubleClick).toHaveBeenCalledWith(expect.any(Object), 'room-1');
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

  it('renders polygon for non-rectangular rooms', () => {
    // L-shaped room vertices relative to position (0,0)
    // 0,0 -> 4,0 -> 4,2 -> 2,2 -> 2,4 -> 0,4 -> 0,0
    // Total area: 4*2 + 2*2 = 8 + 4 = 12 m^2
    const polygonRoom: Room = {
      ...mockRoom,
      vertices: [
        { x: 0, z: 0 },
        { x: 4, z: 0 },
        { x: 4, z: 2 },
        { x: 2, z: 2 },
        { x: 2, z: 4 },
        { x: 0, z: 4 },
      ],
      length: 4,
      width: 4,
    };

    render(
      <svg>
        <RoomShape {...defaultProps} room={polygonRoom} />
      </svg>
    );

    const group = screen.getByTestId('room-shape-room-1');
    const polygon = group.querySelector('polygon');
    const rect = group.querySelector('rect');

    expect(polygon).toBeInTheDocument();
    expect(rect).not.toBeInTheDocument();

    const expectedPoints = "0,0 4,0 4,2 2,2 2,4 0,4";
    expect(polygon).toHaveAttribute('points', expectedPoints);

    // Verify area calculation
    expect(screen.getByText('12.0 m²')).toBeInTheDocument();
  });
});
