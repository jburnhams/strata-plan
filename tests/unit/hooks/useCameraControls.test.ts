import { renderHook, act } from '@testing-library/react';
import { useCameraControls } from '../../../src/hooks/useCameraControls';
import * as THREE from 'three';

describe('useCameraControls', () => {
  it('should initialize with default view "isometric"', () => {
    const { result } = renderHook(() => useCameraControls());
    expect(result.current.currentView).toBe('isometric');
  });

  it('should update current view', () => {
    const { result } = renderHook(() => useCameraControls());

    act(() => {
      result.current.setCurrentView('top');
    });

    expect(result.current.currentView).toBe('top');
  });

  describe('getPresetPosition', () => {
    const target = new THREE.Vector3(0, 0, 0);
    const distance = 10;

    it('should calculate isometric position correctly', () => {
      const { result } = renderHook(() => useCameraControls());
      const pos = result.current.getPresetPosition('isometric', target, distance);

      const isoDist = distance / Math.sqrt(3);
      // Precision check
      expect(pos.x).toBeCloseTo(isoDist);
      expect(pos.y).toBeCloseTo(isoDist);
      expect(pos.z).toBeCloseTo(isoDist);
    });

    it('should calculate top position correctly', () => {
      const { result } = renderHook(() => useCameraControls());
      const pos = result.current.getPresetPosition('top', target, distance);

      expect(pos.x).toBe(0);
      expect(pos.y).toBe(distance);
      expect(pos.z).toBe(0);
    });

    it('should calculate front position correctly', () => {
      const { result } = renderHook(() => useCameraControls());
      const pos = result.current.getPresetPosition('front', target, distance);

      expect(pos.x).toBe(0);
      expect(pos.y).toBe(0);
      expect(pos.z).toBe(distance);
    });

    it('should calculate side position correctly', () => {
      const { result } = renderHook(() => useCameraControls());
      const pos = result.current.getPresetPosition('side', target, distance);

      expect(pos.x).toBe(distance);
      expect(pos.y).toBe(0);
      expect(pos.z).toBe(0);
    });

    it('should use target offset', () => {
        const { result } = renderHook(() => useCameraControls());
        const offsetTarget = new THREE.Vector3(1, 2, 3);
        const pos = result.current.getPresetPosition('top', offsetTarget, distance);

        expect(pos.x).toBe(1);
        expect(pos.y).toBe(2 + distance);
        expect(pos.z).toBe(3);
    });
  });
});
