import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useFirstPerson } from '@/hooks/useFirstPerson';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';

// Mock R3F hooks
jest.mock('@react-three/fiber', () => ({
  useThree: jest.fn(),
  useFrame: jest.fn(),
}));

describe('useFirstPerson', () => {
  let mockCamera: any;

  beforeEach(() => {
    mockCamera = {
      position: new THREE.Vector3(0, 5, 10),
      quaternion: new THREE.Quaternion(),
      lookAt: jest.fn(),
    };
    (useThree as jest.Mock).mockReturnValue({ camera: mockCamera });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('initializes camera position when enabled', () => {
    const { rerender } = renderHook(({ isEnabled }) => useFirstPerson(isEnabled), {
      initialProps: { isEnabled: false }
    });

    // Not enabled yet
    expect(mockCamera.position.y).toBe(5);

    // Enable
    rerender({ isEnabled: true });

    // Should set height to at least EYE_HEIGHT (1.6)
    // In our mock initial was 5, so it stays 5 if we just use max.
    // Wait, let's check logic: camera.position.y = Math.max(camera.position.y, EYE_HEIGHT);
    // 5 > 1.6, so it stays 5.

    // Let's reset camera to 0
    mockCamera.position.y = 0;
    rerender({ isEnabled: false }); // Reset prop to force effect re-run if dependecies changed (but simple boolean toggle is enough)

    // Create new hook instance or just toggle
    const { rerender: rerender2 } = renderHook(({ isEnabled }) => useFirstPerson(isEnabled), {
        initialProps: { isEnabled: false }
    });

    rerender2({ isEnabled: true });
    expect(mockCamera.position.y).toBe(1.6);
  });

  it('registers keyboard listeners when enabled', () => {
    const addSpy = jest.spyOn(document, 'addEventListener');
    const removeSpy = jest.spyOn(document, 'removeEventListener');

    const { unmount } = renderHook(() => useFirstPerson(true));

    expect(addSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    expect(addSpy).toHaveBeenCalledWith('keyup', expect.any(Function));

    unmount();

    expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith('keyup', expect.any(Function));
  });

  it('moves camera on frame update when keys are pressed', () => {
    let frameCallback: (state: any, delta: number) => void = () => {};
    (useFrame as jest.Mock).mockImplementation((cb) => {
      frameCallback = cb;
    });

    renderHook(() => useFirstPerson(true));

    // Simulate KeyW (Forward)
    const keydownEvent = new KeyboardEvent('keydown', { code: 'KeyW' });
    document.dispatchEvent(keydownEvent);

    // Initial Z
    const initialZ = mockCamera.position.z;

    // Trigger frame
    act(() => {
      frameCallback({}, 0.1); // 100ms delta
    });

    // Should have moved forward (negative Z in Three.js default if looking at -Z)
    // Our logic: forwardVector is (0,0,-1) rotated by identity quat -> (0,0,-1).
    // addScaledVector(forward, speed * delta) -> add (0,0,-0.2) if speed is 2.
    // initialZ (10) + (-0.2) = 9.8
    expect(mockCamera.position.z).toBeLessThan(initialZ);
  });

  it('moves faster when shift is held', () => {
    let frameCallback: (state: any, delta: number) => void = () => {};
    (useFrame as jest.Mock).mockImplementation((cb) => {
      frameCallback = cb;
    });

    renderHook(() => useFirstPerson(true));

    // Simulate KeyW + Shift
    document.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyW' }));
    document.dispatchEvent(new KeyboardEvent('keydown', { code: 'ShiftLeft' }));

    const initialZ = mockCamera.position.z;

    // Trigger frame
    act(() => {
      frameCallback({}, 0.1);
    });

    // Speed 4.0 -> delta 0.4
    // Position 10 -> 9.6
    expect(mockCamera.position.z).toBeCloseTo(9.6);
  });
});
