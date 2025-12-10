import { renderHook } from '@testing-library/react';
import { useThreeScene } from '../../../src/hooks/useThreeScene';
import { useThree } from '@react-three/fiber';
import { MutableRefObject } from 'react';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

// Mock @react-three/fiber
jest.mock('@react-three/fiber', () => ({
  useThree: jest.fn(),
}));

describe('useThreeScene', () => {
  const mockScene = { name: 'Scene' };
  const mockCamera = { name: 'Camera' };
  const mockGl = { name: 'Renderer' };

  beforeEach(() => {
    (useThree as jest.Mock).mockReturnValue({
      scene: mockScene,
      camera: mockCamera,
      gl: mockGl,
    });
  });

  it('should return scene objects from useThree', () => {
    const { result } = renderHook(() => useThreeScene());

    expect(result.current.scene).toBe(mockScene);
    expect(result.current.camera).toBe(mockCamera);
    expect(result.current.renderer).toBe(mockGl);
    expect(result.current.controls).toBeNull();
  });

  it('should return controls if ref is provided', () => {
    const mockControls = { name: 'Controls' } as unknown as OrbitControlsImpl;
    const ref = { current: mockControls } as MutableRefObject<OrbitControlsImpl | null>;

    const { result } = renderHook(() => useThreeScene(ref));

    expect(result.current.controls).toBe(mockControls);
  });

  it('should return null controls if ref is null', () => {
      const ref = { current: null } as MutableRefObject<OrbitControlsImpl | null>;
      const { result } = renderHook(() => useThreeScene(ref));
      expect(result.current.controls).toBeNull();
  });
});
