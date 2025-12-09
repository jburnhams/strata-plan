import { renderHook, act } from '@testing-library/react';
import { useCameraControls } from '@/hooks/useCameraControls';
import { useFloorplanStore } from '@/stores/floorplanStore';
import { Vector3 } from 'three';

// Mock useFloorplanStore
jest.mock('@/stores/floorplanStore', () => ({
  useFloorplanStore: jest.fn(),
}));

// We use a real Vector3 for position so vector math works, but patch copy
const mockCameraPositionCopy = jest.fn(function(this: Vector3, v: Vector3) {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
    return this;
});
const mockPosition = new Vector3(0, 0, 10);
mockPosition.copy = mockCameraPositionCopy as any;

const mockCamera = {
  position: mockPosition,
  getWorldDirection: jest.fn((v) => v.set(0,0,-1)),
  fov: 50,
};

jest.mock('@react-three/fiber', () => ({
  useThree: (selector: any) => selector ? selector({ camera: mockCamera }) : { camera: mockCamera },
}));

describe('useCameraControls', () => {
  let mockControlsRef: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockControlsRef = {
      current: {
        target: new Vector3(0, 0, 0),
        update: jest.fn(),
        minDistance: 2,
        maxDistance: 100,
      },
    };

    // Reset camera position for each test
    mockCamera.position.set(0, 0, 10);

    (useFloorplanStore as unknown as jest.Mock).mockImplementation((cb) => cb({
        currentFloorplan: { rooms: [] }
    }));
  });

  it('setPresetView "isometric" sets correct position', () => {
    const { result } = renderHook(() => useCameraControls(mockControlsRef));

    act(() => {
      result.current.setPresetView('isometric');
    });

    // isometric is at (20, 20, 20) relative to center (0,0,0)
    expect(mockCameraPositionCopy).toHaveBeenCalledWith(expect.objectContaining({ x: 20, y: 20, z: 20 }));
    expect(mockControlsRef.current.update).toHaveBeenCalled();
  });

  it('fitToView calculates bounds and positions camera', () => {
    // Mock rooms
    const mockRoom = {
        id: '1',
        position: { x: 0, z: 0 },
        length: 10,
        width: 10,
        height: 3,
        rotation: 0
    };

    (useFloorplanStore as unknown as jest.Mock).mockImplementation((cb) => cb({
        currentFloorplan: { rooms: [mockRoom] }
    }));

    const { result } = renderHook(() => useCameraControls(mockControlsRef));

    act(() => {
      result.current.fitToView();
    });

    // Center of room is 5, 5. Height is 3.
    // Bounds: 0,0 to 10,10. Center X=5, Z=5.
    // target should be (5, 0, 5) - Wait, fitToView uses box.getCenter().
    // Box: minX=0, maxX=10, minZ=0, maxZ=10, minY=0, maxY=3.
    // Center: 5, 1.5, 5.

    const target = mockControlsRef.current.target;
    expect(target.x).toBe(5);
    expect(target.y).toBe(1.5);
    expect(target.z).toBe(5);

    expect(mockCameraPositionCopy).toHaveBeenCalled();
    expect(mockControlsRef.current.update).toHaveBeenCalled();
  });

  it('zoom in modifies camera position', () => {
    const { result } = renderHook(() => useCameraControls(mockControlsRef));

    // Initial distance is 10 (0,0,10) to (0,0,0)

    act(() => {
      result.current.zoom(1);
    });

    // Factor 0.9. New distance 9.
    expect(mockPosition.z).toBeCloseTo(9);
    expect(mockControlsRef.current.update).toHaveBeenCalled();
  });

  it('zoom out modifies camera position', () => {
    const { result } = renderHook(() => useCameraControls(mockControlsRef));

    act(() => {
      result.current.zoom(-1);
    });

    // Factor 1.1. New distance 11.
    expect(mockPosition.z).toBeCloseTo(11);
  });
});
