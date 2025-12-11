import React from 'react';
import { render } from '@testing-library/react';
import { PathVisualization } from '../../../../src/components/editor/PathVisualization';
import { useFloorplanStore } from '../../../../src/stores/floorplanStore';
import { useUIStore } from '../../../../src/stores/uiStore';
import { Room, RoomConnection } from '../../../../src/types';

// Mock dependencies
jest.mock('../../../../src/stores/floorplanStore');
jest.mock('../../../../src/stores/uiStore');

jest.mock('../../../../src/services/geometry', () => ({
  getRoomCenter: jest.fn().mockImplementation((room) => ({
    x: room.position.x + room.length / 2,
    z: room.position.z + room.width / 2
  })),
}));

jest.mock('../../../../src/services/adjacency/pathfinding', () => ({
  findPath: jest.fn(),
}));
import { findPath } from '../../../../src/services/adjacency/pathfinding';

describe('PathVisualization', () => {
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

  const mockRoom3: Room = {
    id: '3',
    name: 'Room 3',
    length: 5,
    width: 5,
    height: 2.4,
    type: 'bedroom',
    position: { x: 10, z: 0 },
    rotation: 0,
    doors: [],
    windows: []
  };

  beforeEach(() => {
    (useFloorplanStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({
        currentFloorplan: {
          rooms: [mockRoom1, mockRoom2, mockRoom3],
          connections: [],
          doors: []
        }
      })
    );
  });

  it('should render nothing if showPath is false', () => {
    (useUIStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({ showPath: false })
    );

    const { container } = render(<svg><PathVisualization /></svg>);
    expect(container.querySelector('path')).toBeNull();
  });

  it('should render nothing if path start/end not set', () => {
    (useUIStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({ showPath: true, pathStartRoomId: null, pathEndRoomId: '2' })
    );

    const { container } = render(<svg><PathVisualization /></svg>);
    expect(container.querySelector('path')).toBeNull();
  });

  it('should render path when configured correctly', () => {
    (useUIStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({ showPath: true, pathStartRoomId: '1', pathEndRoomId: '3' })
    );

    (findPath as jest.Mock).mockReturnValue(['1', '2', '3']);

    const { container } = render(<svg><PathVisualization /></svg>);

    // Check for path elements (halo and main line)
    const paths = container.querySelectorAll('path');
    expect(paths.length).toBeGreaterThanOrEqual(2);

    // Check for start/end markers
    const circles = container.querySelectorAll('circle');
    expect(circles.length).toBeGreaterThanOrEqual(2);
  });

  it('should handle no path found', () => {
    (useUIStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({ showPath: true, pathStartRoomId: '1', pathEndRoomId: '3' })
    );

    (findPath as jest.Mock).mockReturnValue([]); // No path

    const { container } = render(<svg><PathVisualization /></svg>);
    expect(container.querySelector('path')).toBeNull();
  });
});
