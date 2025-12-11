import React from 'react';
import { render, screen } from '@testing-library/react';
import { ConnectionLines } from '../../src/components/editor/ConnectionLines';
import { useFloorplanStore } from '../../src/stores/floorplanStore';
import { useUIStore } from '../../src/stores/uiStore';
import { Room, RoomConnection } from '../../src/types/floorplan';

// We need to mock the stores but keep the ability to change state if needed,
// however for integration test we usually want to use real stores?
// But since this is a UI integration test involving stores, we can mock the store *implementation* to behave like a store,
// or just use the mocked module approach as we are in a "unit-like" integration environment (jsdom).
// A true "deep" integration test would use the real store.
// But useFloorplanStore is a hook.
// Let's assume for this "UI Integration" we want to test that given a state, the DOM is correct.
// The "deep realistic" part comes from using real components (ConnectionLines) and real logic if possible.
// Since ConnectionLines relies on `detectAdjacency` (real logic), we are good.
// We just need to feed it data.

// Since the store is a singleton hook, we can mock it to return specific state.
jest.mock('../../src/stores/floorplanStore');
jest.mock('../../src/stores/uiStore');

// Mock geometry service to rely on real calculation if we wanted, but here we can just let it run or mock if it's too complex.
// ConnectionLines calls `getRoomCenter` and `detectAdjacency`.
// `detectAdjacency` is pure logic, we should NOT mock it to be "realistic".
// `getRoomCenter` is also pure logic.
// So we should NOT mock `src/services/geometry` or `src/services/adjacency/detection`.
// However, in the unit test we mocked `getRoomCenter`.
// Here we will use the REAL implementations by NOT mocking them.

describe('Adjacency UI Integration', () => {
  const createRoom = (id: string, x: number, z: number): Room => ({
    id,
    name: `Room ${id}`,
    length: 4,
    width: 4,
    height: 3,
    type: 'bedroom',
    position: { x, z },
    doors: [],
    windows: [],
    rotation: 0
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Default UI state
    (useUIStore as unknown as jest.Mock).mockImplementation((selector) => {
      return selector({ showConnections: true });
    });
  });

  it('should visually connect adjacent rooms using real geometry calculations', () => {
    const room1 = createRoom('1', 0, 0);
    const room2 = createRoom('2', 4, 0); // Adjacent

    // We assume the store has already calculated connections (since that logic is in the store actions/subscribers)
    // But ConnectionLines just READS connections.
    // So we must provide the connections in the store state.
    // This effectively tests that IF connections exist, they align with geometry.

    // Note: ConnectionLines calls `detectAdjacency` internally to refine the visualization (shared wall segment).
    // So this test verifies that `detectAdjacency` works within the component.

    const connections: RoomConnection[] = [{
      id: 'c1',
      room1Id: '1',
      room2Id: '2',
      room1Wall: 'east',
      room2Wall: 'west',
      sharedWallLength: 4,
      doors: []
    }];

    (useFloorplanStore as unknown as jest.Mock).mockImplementation((selector) => {
      return selector({
        currentFloorplan: {
          rooms: [room1, room2],
          connections: connections
        }
      });
    });

    const { container } = render(
      <svg>
        <ConnectionLines />
      </svg>
    );

    // Verify SVG structure
    expect(container.querySelector('g')).toBeInTheDocument();

    // Check title (tooltip) which relies on room names and shared length
    // Wait, svg title is not always accessible via getByTitle in all testing library versions/configurations?
    // It should work. Let's debug why it failed.
    // The failed output showed <title>Room 1 ↔ Room 2 (4.00m shared)</title>
    // Ah, maybe the mismatch is "4.00m" vs "4m" or something invisible?
    // "Room 1 ↔ Room 2 (4.00m shared)"
    // The error says: Unable to find an element with the title: Room 1 ↔ Room 2 (4.00m shared).
    // But the HTML dump shows exactly that title text.
    // SVG title is a child of G, not an attribute.
    // getByTitle searches for `title` attribute or `<title>` element in SVG.
    // However, maybe it needs exact match?
    // Let's try finding by text content inside title tag.

    const titleElement = container.querySelector('title');
    expect(titleElement).toHaveTextContent('Room 1 ↔ Room 2 (4.00m shared)');

    // Verify line coordinates (approximate)
    const line = container.querySelector('line');
    expect(line).toBeInTheDocument();
    // Room 1 center: 2, 2
    // Room 2 center: 6, 2
    expect(line).toHaveAttribute('x1', '2');
    expect(line).toHaveAttribute('y1', '2');
    expect(line).toHaveAttribute('x2', '6');
    expect(line).toHaveAttribute('y2', '2');
  });

  it('should update visual connection when rooms are manual linked', () => {
    const room1 = createRoom('1', 0, 0);
    const room2 = createRoom('2', 10, 0); // Far away

    const connections: RoomConnection[] = [{
      id: 'c1',
      room1Id: '1',
      room2Id: '2',
      room1Wall: 'east', // Dummy values for manual
      room2Wall: 'west',
      sharedWallLength: undefined,
      doors: [],
      isManual: true
    }];

    (useFloorplanStore as unknown as jest.Mock).mockImplementation((selector) => {
      return selector({
        currentFloorplan: {
          rooms: [room1, room2],
          connections: connections
        }
      });
    });

    const { container } = render(
      <svg>
        <ConnectionLines />
      </svg>
    );

    expect(screen.getByText('Manual Link')).toBeInTheDocument();

    const line = container.querySelector('line');
    expect(line).toHaveAttribute('stroke-dasharray', '2,2');
  });
});
