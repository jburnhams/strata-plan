import React from 'react';
import { render, screen } from '@testing-library/react';
import { DoorShape } from '@/components/editor/DoorShape';
import { Door } from '@/types/door';
import { Room } from '@/types/room';

describe('DoorShape', () => {
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

  const mockDoor: Door = {
    id: 'door-1',
    roomId: 'room-1',
    wallSide: 'north',
    position: 0.5,
    width: 0.9,
    height: 2.1,
    type: 'single',
    swing: 'inward',
    handleSide: 'left',
    isExterior: false
  };

  const renderComponent = (door: Door, room: Room) => {
    return render(
      <svg>
        <DoorShape door={door} room={room} />
      </svg>
    );
  };

  it('renders without crashing', () => {
    renderComponent(mockDoor, mockRoom);
  });

  it('positions correctly for north wall', () => {
    const { container } = renderComponent(mockDoor, mockRoom);
    // North wall: y = 0, x = length * position
    // Room position (10, 10). Length 5. Position 0.5 -> x = 2.5 relative + 10 = 12.5.
    // y = 0 relative + 10 = 10.
    const group = container.querySelector('g');
    expect(group).toHaveAttribute('transform', expect.stringContaining('translate(12.5, 10)'));
    expect(group).toHaveAttribute('transform', expect.stringContaining('rotate(0)'));
  });

  it('positions correctly for south wall', () => {
    const southDoor = { ...mockDoor, wallSide: 'south' as const };
    const { container } = renderComponent(southDoor, mockRoom);
    // South wall: y = width, x = length * position
    // y = 4 relative + 10 = 14.
    // x = 2.5 relative + 10 = 12.5.
    const group = container.querySelector('g');
    expect(group).toHaveAttribute('transform', expect.stringContaining('translate(12.5, 14)'));
    expect(group).toHaveAttribute('transform', expect.stringContaining('rotate(180)'));
  });

  it('positions correctly for east wall', () => {
    const eastDoor = { ...mockDoor, wallSide: 'east' as const };
    const { container } = renderComponent(eastDoor, mockRoom);
    // East wall: x = length, y = width * position
    // x = 5 relative + 10 = 15.
    // y = 4 * 0.5 = 2 relative + 10 = 12.
    const group = container.querySelector('g');
    expect(group).toHaveAttribute('transform', expect.stringContaining('translate(15, 12)'));
    expect(group).toHaveAttribute('transform', expect.stringContaining('rotate(90)'));
  });

  it('positions correctly for west wall', () => {
    const westDoor = { ...mockDoor, wallSide: 'west' as const };
    const { container } = renderComponent(westDoor, mockRoom);
    // West wall: x = 0, y = width * position
    // x = 0 relative + 10 = 10.
    // y = 2 relative + 10 = 12.
    const group = container.querySelector('g');
    expect(group).toHaveAttribute('transform', expect.stringContaining('translate(10, 12)'));
    expect(group).toHaveAttribute('transform', expect.stringContaining('rotate(270)'));
  });

  it('renders sliding door type', () => {
    const slidingDoor = { ...mockDoor, type: 'sliding' as const };
    const { container } = renderComponent(slidingDoor, mockRoom);
    // Check for some characteristic of sliding door if possible, or just that it renders
    expect(container.innerHTML).toContain('line');
  });
});
