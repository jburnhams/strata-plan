import { renderHook, act } from '@testing-library/react';
import { useFirstPerson } from '../../../src/hooks/useFirstPerson';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';

// Mock R3F hooks
jest.mock('@react-three/fiber', () => ({
  useThree: jest.fn(),
  useFrame: jest.fn(),
}));

describe('useFirstPerson', () => {
  let camera: THREE.PerspectiveCamera;
  let scene: THREE.Scene;
  let frameCallback: (state: any, delta: number) => void;

  beforeEach(() => {
    jest.clearAllMocks();

    camera = new THREE.PerspectiveCamera();
    camera.position.set(0, 1.6, 0);
    // Orient camera looking down -Z
    camera.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), 0);

    scene = new THREE.Scene();

    (useThree as jest.Mock).mockReturnValue({
      camera,
      scene
    });

    (useFrame as jest.Mock).mockImplementation((cb) => {
      frameCallback = cb;
    });
  });

  it('initializes camera height on enable', () => {
    camera.position.y = 1.0;
    renderHook(() => useFirstPerson(true));
    expect(camera.position.y).toBe(1.6);
  });

  it('moves camera forward when key pressed', () => {
    const { unmount } = renderHook(() => useFirstPerson(true));

    // Simulate KeyDown 'W'
    act(() => {
      const event = new KeyboardEvent('keydown', { code: 'KeyW' });
      document.dispatchEvent(event);
    });

    // Simulate frame update (delta = 0.1s)
    // Speed is 2.0 m/s. Move should be 0.2m forward (-Z).
    act(() => {
      if (frameCallback) frameCallback({} as any, 0.1);
    });

    expect(camera.position.z).toBeCloseTo(-0.2);

    unmount();
  });

  it('stops movement when colliding with a wall', () => {
    const { unmount } = renderHook(() => useFirstPerson(true));

    // Mock Raycaster.intersectObjects to return a hit
    const mockRaycasterInstance = {
      set: jest.fn(),
      intersectObjects: jest.fn().mockReturnValue([
        {
          distance: 0.1, // Very close, < 0.5 threshold
          object: new THREE.Mesh(), // Valid mesh
          face: { normal: new THREE.Vector3(0, 0, 1) }, // Valid wall normal (horizontal)
          visible: true
        }
      ]),
      far: 100
    };

    // We need to spy on THREE.Raycaster constructor or prototype
    // Since we can't easily replace the instance created inside the hook via closure,
    // we should mock the module or prototype method.
    // However, the hook creates `useRef(new THREE.Raycaster())`.
    // The easiest way is to mock the method on the prototype before rendering.

    const originalIntersect = THREE.Raycaster.prototype.intersectObjects;
    THREE.Raycaster.prototype.intersectObjects = mockRaycasterInstance.intersectObjects;

    // Simulate KeyDown 'W'
    act(() => {
      const event = new KeyboardEvent('keydown', { code: 'KeyW' });
      document.dispatchEvent(event);
    });

    // Initial Z is 0. Attempting to move forward (-Z).
    // Collision detected at 0.1 distance.
    // Should NOT move.

    act(() => {
      if (frameCallback) frameCallback({} as any, 0.1);
    });

    expect(camera.position.z).toBe(0);

    // Restore
    THREE.Raycaster.prototype.intersectObjects = originalIntersect;
    unmount();
  });

  it('ignores floor collisions (vertical normal)', () => {
    const { unmount } = renderHook(() => useFirstPerson(true));

    // Mock floor hit
    const mockRaycasterInstance = {
      intersectObjects: jest.fn().mockReturnValue([
        {
          distance: 0.1,
          object: new THREE.Mesh(),
          face: { normal: new THREE.Vector3(0, 1, 0) }, // Upward normal (floor)
          visible: true
        }
      ])
    };

    const originalIntersect = THREE.Raycaster.prototype.intersectObjects;
    THREE.Raycaster.prototype.intersectObjects = mockRaycasterInstance.intersectObjects;

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyW' }));
    });

    // Should ignore collision and move
    act(() => {
      if (frameCallback) frameCallback({} as any, 0.1);
    });

    expect(camera.position.z).toBeCloseTo(-0.2);

    THREE.Raycaster.prototype.intersectObjects = originalIntersect;
    unmount();
  });
});
