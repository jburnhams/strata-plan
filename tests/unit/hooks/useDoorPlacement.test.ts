import { renderHook, act } from '@testing-library/react';
import { useDoorPlacement } from '../../../src/hooks/useDoorPlacement';
import { useFloorplanStore } from '../../../src/stores/floorplanStore';
import { useToolStore } from '../../../src/stores/toolStore';
import { DOOR_DEFAULTS } from '../../../src/types/door';
import { getRoomWallSegments, getWallLength, distance } from '../../../src/services/geometry';

// Mock dependencies
jest.mock('../../../src/stores/floorplanStore');
jest.mock('../../../src/stores/toolStore');
jest.mock('../../../src/services/geometry', () => ({
  getRoomWallSegments: jest.fn(),
  getWallLength: jest.fn(),
  localToWorld: jest.fn(),
  worldToLocal: jest.fn(),
  distance: jest.fn(),
}));

// We need to access the mock store implementations
const mockFloorplanStore = useFloorplanStore as unknown as jest.Mocked<typeof useFloorplanStore>;
const mockToolStore = useToolStore as unknown as jest.Mocked<typeof useToolStore>;
// Access mocked geometry functions
const mockGetRoomWallSegments = getRoomWallSegments as jest.Mock;
const mockGetWallLength = getWallLength as jest.Mock;
const mockDistance = distance as jest.Mock;

describe('useDoorPlacement', () => {
  const mockSetTool = jest.fn();
  const mockAddDoor = jest.fn();
  const mockSelectDoor = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup Store Mocks
    (useToolStore as unknown as jest.Mock).mockReturnValue({
      activeTool: 'door',
      setTool: mockSetTool,
    });

    // Default mock setup for floorplanStore
    (useFloorplanStore as unknown as jest.Mock).mockImplementation(() => ({
      currentFloorplan: {
        rooms: [
          { id: 'room1', rotation: 0, position: { x: 0, z: 0 }, length: 10, width: 10 },
        ],
        connections: [],
        doors: [],
      },
      addDoor: mockAddDoor,
      selectDoor: mockSelectDoor,
      getDoorsByRoom: jest.fn().mockReturnValue([]),
      getWindowsByRoom: jest.fn().mockReturnValue([]),
    }));

    // Mock Geometry
    mockGetRoomWallSegments.mockReturnValue([
      { id: 'room1-north', from: { x: 0, z: 0 }, to: { x: 10, z: 0 }, wallSide: 'north' },
    ]);
    mockGetWallLength.mockReturnValue(10);

    // Mock Distance to behave correctly (Euclidean distance) with 4 arguments
    mockDistance.mockImplementation((x1, z1, x2, z2) => {
        const dx = x2 - x1;
        const dz = z2 - z1;
        return Math.sqrt(dx * dx + dz * dz);
    });
  });

  it('should be active when tool is door', () => {
    const { result } = renderHook(() => useDoorPlacement());
    expect(result.current.isActive).toBe(true);
  });

  it('should detect wall on mouse move', () => {
    const { result } = renderHook(() => useDoorPlacement());

    // Point close to the wall (0,0) -> (10,0)
    // 5, 0.1
    act(() => {
      result.current.handleMouseMove({ x: 5, z: 0.1 });
    });

    expect(mockGetRoomWallSegments).toHaveBeenCalled();
    expect(result.current.hoveredWall).toEqual(expect.objectContaining({
      roomId: 'room1',
      wall: expect.objectContaining({ wallSide: 'north' }),
    }));
    expect(result.current.isValid).toBe(true);
  });

  it('should not detect wall if far away', () => {
    const { result } = renderHook(() => useDoorPlacement());

    act(() => {
      result.current.handleMouseMove({ x: 5, z: 5 });
    });

    expect(result.current.hoveredWall).toBeNull();
  });

  it('should validate door bounds (too close to start)', () => {
    const { result } = renderHook(() => useDoorPlacement());

    // Door width is 0.9m. Half width is 0.45m.
    // Point at 0.1m along wall (10m long).
    // 0.1m is < 0.45m, so should be invalid.
    act(() => {
      result.current.handleMouseMove({ x: 0.1, z: 0 });
    });

    expect(result.current.isValid).toBe(false);
    expect(result.current.validationError).toBe('Door exceeds wall bounds');
  });

  it('should validate door bounds (too close to end)', () => {
    const { result } = renderHook(() => useDoorPlacement());

    // Wall length 10m. End is 10.
    // Point at 9.9m.
    // 9.9 + 0.45 = 10.35 > 10. Invalid.
    act(() => {
      result.current.handleMouseMove({ x: 9.9, z: 0 });
    });

    expect(result.current.isValid).toBe(false);
    expect(result.current.validationError).toBe('Door exceeds wall bounds');
  });

  it('should create door on click when valid', () => {
    mockAddDoor.mockReturnValue({ id: 'new-door' });
    const { result } = renderHook(() => useDoorPlacement());

    // Setup valid hover
    act(() => {
      result.current.handleMouseMove({ x: 5, z: 0 });
    });

    act(() => {
      result.current.handleClick();
    });

    expect(mockAddDoor).toHaveBeenCalledWith(expect.objectContaining({
      ...DOOR_DEFAULTS,
      roomId: 'room1',
      wallSide: 'north',
      position: 0.5, // 5 / 10
      isExterior: true, // Should be true as there are no connections
    }));
    expect(mockSelectDoor).toHaveBeenCalledWith('new-door');
    expect(mockSetTool).toHaveBeenCalledWith('select');
  });

  it('should handle shared wall (connection)', () => {
     // For this test, we override the mock return value specifically
     (useFloorplanStore as unknown as jest.Mock).mockImplementation(() => ({
      currentFloorplan: {
        rooms: [
          { id: 'room1', rotation: 0, position: { x: 0, z: 0 }, length: 10, width: 10 },
          { id: 'room2', rotation: 0, position: { x: 0, z: -10 }, length: 10, width: 10 }
        ],
        connections: [
            { id: 'conn1', room1Id: 'room1', room2Id: 'room2', room1Wall: 'north', room2Wall: 'south' }
        ],
        doors: [],
      },
      addDoor: mockAddDoor,
      selectDoor: mockSelectDoor,
      getDoorsByRoom: jest.fn().mockReturnValue([]),
      getWindowsByRoom: jest.fn().mockReturnValue([]),
    }));

    const { result } = renderHook(() => useDoorPlacement());

    // Hover on north wall of room1 which is shared
    act(() => {
        result.current.handleMouseMove({ x: 5, z: 0 });
    });

    mockAddDoor.mockReturnValue({ id: 'new-door' });

    act(() => {
        result.current.handleClick();
    });

    expect(mockAddDoor).toHaveBeenCalledWith(expect.objectContaining({
        connectionId: 'conn1',
        isExterior: false
    }));
  });
});
