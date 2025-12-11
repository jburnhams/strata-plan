import React from 'react';
import { render } from '@testing-library/react';
import { ConnectionLines } from '../../../../src/components/editor/ConnectionLines';
import { useFloorplanStore } from '../../../../src/stores/floorplanStore';
import { useUIStore } from '../../../../src/stores/uiStore';
import { Room, RoomConnection } from '../../../../src/types';

// Mock dependencies
jest.mock('../../../../src/stores/floorplanStore');
jest.mock('../../../../src/stores/uiStore');

// Mock geometry services to avoid complex math in tests
jest.mock('../../../../src/services/geometry', () => ({
  getRoomCenter: jest.fn().mockImplementation((room) => ({
    x: room.position.x + room.length / 2,
    z: room.position.z + room.width / 2
  })),
  getRoomWallSegments: jest.fn().mockReturnValue([
    { wallSide: 'north', from: {x:0, z:0}, to: {x:10, z:0} },
    { wallSide: 'east', from: {x:10, z:0}, to: {x:10, z:10} },
    // Add dummy values, real logic tested in service tests
  ]),
}));

jest.mock('../../../../src/services/adjacency/detection', () => ({
  detectAdjacency: jest.fn().mockReturnValue({
    sharedWall: {
      room1Wall: 'north',
      startPosition: 0.2,
      endPosition: 0.8
    }
  })
}));

describe('ConnectionLines', () => {
  const mockRoom1: Room = {
    id: '1',
    name: 'Room 1',
    length: 5,
    width: 5,
    height: 2.4,
    type: 'bedroom',
    position: { x: 0, z: 0 },
    rotation: 0,
    doors: [],
    windows: []
  };

  const mockRoom2: Room = {
    id: '2',
    name: 'Room 2',
    length: 5,
    width: 5,
    height: 2.4,
    type: 'bedroom',
    position: { x: 5, z: 0 },
    rotation: 0,
    doors: [],
    windows: []
  };

  const mockConnection: RoomConnection = {
    id: 'c1',
    room1Id: '1',
    room2Id: '2',
    room1Wall: 'east',
    room2Wall: 'west',
    sharedWallLength: 5,
    doors: []
  };

  beforeEach(() => {
    (useFloorplanStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({
        currentFloorplan: {
          rooms: [mockRoom1, mockRoom2],
          connections: [mockConnection],
          doors: []
        }
      })
    );
  });

  it('should render nothing if showConnections is false', () => {
    (useUIStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({ showConnections: false })
    );

    const { container } = render(<svg><ConnectionLines /></svg>);
    expect(container.querySelector('line')).toBeNull();
  });

  it('should render connection lines when showConnections is true', () => {
    (useUIStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({ showConnections: true })
    );

    const { container } = render(<svg><ConnectionLines /></svg>);

    // Check for main connection line
    const lines = container.querySelectorAll('line');
    expect(lines.length).toBeGreaterThan(0);

    // One line for connection center-to-center, one for shared wall
    expect(lines.length).toBeGreaterThanOrEqual(2);
  });

  it('should render shared wall highlight', () => {
    (useUIStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({ showConnections: true })
    );

    const { container } = render(<svg><ConnectionLines /></svg>);

    // Shared wall highlight has specific color (blue-500 #3B82F6)
    const highlight = container.querySelector('line[stroke="#3B82F6"]');
    expect(highlight).toBeInTheDocument();
  });
});
