import React from 'react';
import { render } from '@testing-library/react';
import { WindowShape } from '@/components/editor/WindowShape';
import { Window } from '@/types/window';
import { Room } from '@/types/room';

describe('WindowShape', () => {
  const mockRoom: Room = {
    id: 'room-1',
    name: 'Test Room',
    length: 5,
    width: 4,
    height: 2.5,
    type: 'bedroom',
    position: { x: 10, z: 10 },
    rotation: 0
  };

  const mockWindow: Window = {
    id: 'window-1',
    roomId: 'room-1',
    wallSide: 'north',
    position: 0.5,
    width: 1.2,
    height: 1.2,
    sillHeight: 0.9,
    frameType: 'double',
    material: 'pvc',
    openingType: 'casement'
  };

  const renderComponent = (window: Window, room: Room) => {
    return render(
      <svg>
        <WindowShape window={window} room={room} />
      </svg>
    );
  };

  it('renders without crashing', () => {
    renderComponent(mockWindow, mockRoom);
  });

  it('positions correctly for north wall', () => {
    const { container } = renderComponent(mockWindow, mockRoom);
    // North wall: y = 0, x = width * position
    // x = 4 * 0.5 = 2 relative + 10 = 12.
    // y = 0 + 10 = 10
    const group = container.querySelector('g');
    expect(group).toHaveAttribute('transform', expect.stringContaining('translate(12, 10)'));
    expect(group).toHaveAttribute('transform', expect.stringContaining('rotate(0)'));
  });

  it('renders double frame type', () => {
    const { container } = renderComponent(mockWindow, mockRoom);
    // Should have mullion line
    const lines = container.querySelectorAll('line');
    expect(lines.length).toBeGreaterThan(0);
  });
});
