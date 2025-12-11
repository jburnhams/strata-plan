import React from 'react';
import { render, screen } from '@testing-library/react';
import { ConnectionLines } from '../../../../src/components/editor/ConnectionLines';
import { useFloorplanStore } from '../../../../src/stores/floorplanStore';
import { useUIStore } from '../../../../src/stores/uiStore';
import { Room, RoomConnection } from '../../../../src/types';

// Mock dependencies
jest.mock('../../../../src/stores/floorplanStore');
jest.mock('../../../../src/stores/uiStore');
jest.mock('../../../../src/services/geometry', () => ({
  getRoomCenter: jest.fn((room) => ({ x: room.position.x, z: room.position.z })), // Simplified mock
}));


describe('ConnectionLines', () => {
  const mockRooms: Room[] = [
    {
      id: 'room1',
      name: 'Room 1',
      length: 4,
      width: 5,
      height: 3,
      type: 'bedroom',
      position: { x: 0, z: 0 },
      doors: [],
      windows: [],
      rotation: 0
    },
    {
      id: 'room2',
      name: 'Room 2',
      length: 4,
      width: 5,
      height: 3,
      type: 'living',
      position: { x: 4, z: 0 }, // Adjacent to Room 1
      doors: [],
      windows: [],
      rotation: 0
    }
  ];

  const mockConnections: RoomConnection[] = [
    {
      id: 'conn1',
      room1Id: 'room1',
      room2Id: 'room2',
      room1Wall: 'east',
      room2Wall: 'west',
      sharedWallLength: 3,
      doors: []
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    (useFloorplanStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = {
        currentFloorplan: {
          rooms: mockRooms,
          connections: mockConnections
        }
      };
      return selector(state);
    });

    (useUIStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = {
        showConnections: true,
      };
      return selector(state);
    });
  });

  it('should render nothing when showConnections is false', () => {
    (useUIStore as unknown as jest.Mock).mockImplementation((selector) => {
      return selector({ showConnections: false });
    });

    const { container } = render(<ConnectionLines />);
    expect(container.firstChild).toBeNull();
  });

  it('should render connection lines when showConnections is true', () => {
    const { container } = render(
      <svg>
        <ConnectionLines />
      </svg>
    );

    const lines = container.querySelectorAll('line');
    const circles = container.querySelectorAll('circle');

    expect(lines.length).toBe(1);
    expect(circles.length).toBe(2);
  });

  it('should handle missing rooms gracefully', () => {
    (useFloorplanStore as unknown as jest.Mock).mockImplementation((selector) => {
      return selector({
        currentFloorplan: {
          rooms: [mockRooms[0]], // Missing room2
          connections: mockConnections
        }
      });
    });

    const { container } = render(
      <svg>
        <ConnectionLines />
      </svg>
    );
    const lines = container.querySelectorAll('line');
    expect(lines.length).toBe(0);
  });

  it('should render manual connections with distinctive styling', () => {
      const manualConnection: RoomConnection = {
          ...mockConnections[0],
          isManual: true,
          sharedWallLength: undefined // Manual connections might not have shared length
      };

      (useFloorplanStore as unknown as jest.Mock).mockImplementation((selector) => {
        return selector({
          currentFloorplan: {
            rooms: mockRooms,
            connections: [manualConnection]
          }
        });
      });

      const { container } = render(
        <svg>
          <ConnectionLines />
        </svg>
      );

      // Check for Manual Link text
      expect(screen.getByText('Manual Link')).toBeInTheDocument();

      // Check for dashed line style (simplified check for attributes)
      const line = container.querySelector('line');
      expect(line).toHaveAttribute('stroke-dasharray', '2,2');
      expect(line).toHaveAttribute('stroke', '#A855F7'); // Purple
  });
});
