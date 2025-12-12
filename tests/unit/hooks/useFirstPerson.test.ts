import { renderHook, act } from '@testing-library/react';
import { useFirstPerson } from '../../../src/hooks/useFirstPerson';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import { useFloorplanStore } from '../../../src/stores/floorplanStore';

// Mock R3F hooks
jest.mock('@react-three/fiber', () => ({
  useThree: jest.fn(),
  useFrame: jest.fn(),
}));

// Mock store
jest.mock('../../../src/stores/floorplanStore');

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

    (useFloorplanStore as unknown as jest.Mock).mockImplementation((selector) => {
      return selector({ currentFloorplan: { rooms: [] } });
    });
  });

  it('initializes camera height on enable', () => {
    camera.position.y = 1.0;
    renderHook(() => useFirstPerson(true));
    expect(camera.position.y).toBe(1.6);
  });
});
