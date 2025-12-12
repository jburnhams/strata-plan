import { renderHook, act } from '@testing-library/react';
import { useWindowPlacement } from '../../../src/hooks/useWindowPlacement';
import { useFloorplanStore } from '../../../src/stores/floorplanStore';
import { useToolStore } from '../../../src/stores/toolStore';
import { WINDOW_DEFAULTS } from '../../../src/types/window';
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

describe('useWindowPlacement', () => {
  const mockSetTool = jest.fn();
  const mockAddWindow = jest.fn();
  const mockSelectWindow = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup Store Mocks
    (useToolStore as unknown as jest.Mock).mockReturnValue({
      activeTool: 'window',
      setTool: mockSetTool,
    });

    // Default mock setup for floorplanStore
    (useFloorplanStore as unknown as jest.Mock).mockImplementation(() => ({
      currentFloorplan: {
        rooms: [
          { id: 'room1', rotation: 0, position: { x: 0, z: 0 }, length: 10, width: 10, height: 3 },
        ],
        connections: [],
        windows: [],
      },
      addWindow: mockAddWindow,
      selectWindow: mockSelectWindow,
      getDoorsByRoom: jest.fn().mockReturnValue([]),
      getWindowsByRoom: jest.fn().mockReturnValue([]),
    }));

    // Mock Geometry
    mockGetRoomWallSegments.mockReturnValue([
      { id: 'room1-north', from: { x: 0, z: 0 }, to: { x: 10, z: 0 }, wallSide: 'north' },
    ]);
    mockGetWallLength.mockReturnValue(10);

    // Mock Distance
    mockDistance.mockImplementation((x1, z1, x2, z2) => {
        const dx = x2 - x1;
        const dz = z2 - z1;
        return Math.sqrt(dx * dx + dz * dz);
    });
  });

  it('should be active when tool is window', () => {
    const { result } = renderHook(() => useWindowPlacement());
    expect(result.current.isActive).toBe(true);
  });

  it('should detect wall on mouse move', () => {
    const { result } = renderHook(() => useWindowPlacement());

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
    const { result } = renderHook(() => useWindowPlacement());

    act(() => {
      result.current.handleMouseMove({ x: 5, z: 5 });
    });

    expect(result.current.hoveredWall).toBeNull();
  });

  it('should validate window bounds (too close to start)', () => {
    const { result } = renderHook(() => useWindowPlacement());

    // Window width is 1.2m. Half is 0.6m.
    // Point at 0.1m.
    act(() => {
      result.current.handleMouseMove({ x: 0.1, z: 0 });
    });

    expect(result.current.isValid).toBe(false);
    expect(result.current.validationError).toBe('Window exceeds wall bounds');
  });

  it('should validate window bounds (too close to end)', () => {
    const { result } = renderHook(() => useWindowPlacement());

    // Point at 9.9m.
    act(() => {
      result.current.handleMouseMove({ x: 9.9, z: 0 });
    });

    expect(result.current.isValid).toBe(false);
    expect(result.current.validationError).toBe('Window exceeds wall bounds');
  });

  it('should validate ceiling height', () => {
    // Override store with low ceiling room
    (useFloorplanStore as unknown as jest.Mock).mockImplementation(() => ({
        currentFloorplan: {
          rooms: [
            { id: 'room1', rotation: 0, position: { x: 0, z: 0 }, length: 10, width: 10, height: 1.5 }, // 1.5m height
          ],
        },
        addWindow: mockAddWindow,
        selectWindow: mockSelectWindow,
        getDoorsByRoom: jest.fn().mockReturnValue([]),
        getWindowsByRoom: jest.fn().mockReturnValue([]),
      }));

    const { result } = renderHook(() => useWindowPlacement());

    // Window height (1.2) + sill height (0.9) = 2.1m.
    // Room height 1.5m. Should fail.
    act(() => {
        result.current.handleMouseMove({ x: 5, z: 0 });
    });

    expect(result.current.isValid).toBe(false);
    expect(result.current.validationError).toBe('Window exceeds ceiling height');
  });

  it('should validate overlap with existing window', () => {
    // Mock existing window at position 0.5 (center)
    const mockGetWindows = jest.fn().mockReturnValue([
        { id: 'w1', roomId: 'room1', wallSide: 'north', position: 0.5, width: 1.2 }
    ]);
    (useFloorplanStore as unknown as jest.Mock).mockImplementation(() => ({
        currentFloorplan: {
          rooms: [
            { id: 'room1', rotation: 0, position: { x: 0, z: 0 }, length: 10, width: 10, height: 3 },
          ],
        },
        addWindow: mockAddWindow,
        selectWindow: mockSelectWindow,
        getDoorsByRoom: jest.fn().mockReturnValue([]),
        getWindowsByRoom: mockGetWindows,
    }));

    const { result } = renderHook(() => useWindowPlacement());

    // Try to place another window at same position
    act(() => {
        result.current.handleMouseMove({ x: 5, z: 0 });
    });

    expect(result.current.isValid).toBe(false);
    expect(result.current.validationError).toBe('Overlaps with existing opening');
  });

  it('should create window on click when valid', () => {
    mockAddWindow.mockReturnValue({ id: 'new-window' });
    const { result } = renderHook(() => useWindowPlacement());

    act(() => {
      result.current.handleMouseMove({ x: 5, z: 0 });
    });

    act(() => {
      result.current.handleClick();
    });

    expect(mockAddWindow).toHaveBeenCalledWith(expect.objectContaining({
      ...WINDOW_DEFAULTS,
      roomId: 'room1',
      wallSide: 'north',
      position: 0.5,
    }));
    expect(mockSelectWindow).toHaveBeenCalledWith('new-window');
    expect(mockSetTool).toHaveBeenCalledWith('select');
  });
});
