import { renderHook } from '@testing-library/react';
import { useThreeScene } from '@/hooks/useThreeScene';
import { Color } from 'three';

// Mock useThree
const mockScene = { background: null };
const mockCamera = {};
const mockRenderer = {};
const mockControls = {};

jest.mock('@react-three/fiber', () => ({
  useThree: jest.fn(() => ({
    scene: mockScene,
    camera: mockCamera,
    gl: mockRenderer,
    controls: mockControls,
  })),
}));

describe('useThreeScene', () => {
  beforeEach(() => {
    // Reset background
    mockScene.background = null;
  });

  it('initializes scene background', () => {
    renderHook(() => useThreeScene());
    expect(mockScene.background).toBeInstanceOf(Color);
    expect((mockScene.background as Color).getHexString()).toBe('f5f5f5');
  });

  it('returns scene objects', () => {
    const { result } = renderHook(() => useThreeScene());
    expect(result.current.scene).toBe(mockScene);
    expect(result.current.camera).toBe(mockCamera);
    expect(result.current.renderer).toBe(mockRenderer);
    expect(result.current.controls).toBe(mockControls);
  });
});
