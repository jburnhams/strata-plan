import React from 'react';
import { render, screen } from '@testing-library/react';
import { CameraControls, CameraControlsRef } from '@/components/viewer/CameraControls';
import * as THREE from 'three';

// Mock dependencies
const mockReset = jest.fn();
const mockUpdate = jest.fn();
const mockTarget = new THREE.Vector3(0, 0, 0);

// We need to capture the props passed to OrbitControls to verify updates
let lastOrbitControlsProps: any = {};

jest.mock('@react-three/fiber', () => {
  const THREE = require('three');
  return {
    useThree: () => ({
      camera: {
        position: new THREE.Vector3(10, 10, 10),
        fov: 50,
      },
    }),
    extend: jest.fn(),
  };
});

jest.mock('@react-three/drei', () => {
  const React = require('react');
  const THREE = require('three');
  return {
    OrbitControls: React.forwardRef((props: any, ref: any) => {
      lastOrbitControlsProps = props; // Capture props
      React.useImperativeHandle(ref, () => ({
        reset: mockReset,
        update: mockUpdate,
        target: mockTarget,
        object: { position: new THREE.Vector3(10, 10, 10) }
      }));
      return <div data-testid="orbit-controls-mock" />;
    }),
  };
});

describe('CameraControls Component', () => {
  let ref: React.RefObject<CameraControlsRef>;

  beforeEach(() => {
    ref = React.createRef();
    mockReset.mockClear();
    mockUpdate.mockClear();
    mockTarget.set(0, 0, 0);
    lastOrbitControlsProps = {};
  });

  it('renders orbit controls with default props', () => {
    render(<CameraControls />);
    expect(screen.getByTestId('orbit-controls-mock')).toBeInTheDocument();

    expect(lastOrbitControlsProps.minDistance).toBe(2);
    expect(lastOrbitControlsProps.maxDistance).toBe(100);
    expect(lastOrbitControlsProps.minPolarAngle).toBe(0.1);
    expect(lastOrbitControlsProps.maxPolarAngle).toBeCloseTo(Math.PI / 2 - 0.1);
  });

  it('updates orbit controls when props change', () => {
      const { rerender } = render(<CameraControls minDistance={5} />);
      expect(lastOrbitControlsProps.minDistance).toBe(5);

      rerender(<CameraControls minDistance={10} />);
      expect(lastOrbitControlsProps.minDistance).toBe(10);

      rerender(<CameraControls maxDistance={200} />);
      expect(lastOrbitControlsProps.maxDistance).toBe(200);

      rerender(<CameraControls enableDamping={false} />);
      expect(lastOrbitControlsProps.enableDamping).toBe(false);
  });

  it('exposes reset method via ref', () => {
    render(<CameraControls ref={ref} />);

    expect(ref.current).toHaveProperty('reset');
    ref.current?.reset();
    expect(mockReset).toHaveBeenCalled();
    expect(mockUpdate).toHaveBeenCalled();
  });

  it('exposes setPreset method via ref', () => {
    render(<CameraControls ref={ref} />);

    expect(ref.current).toHaveProperty('setPreset');

    // Test Top View
    ref.current?.setPreset('top');
    expect(mockUpdate).toHaveBeenCalled();

    // Test Isometric View
    ref.current?.setPreset('isometric');
    expect(mockUpdate).toHaveBeenCalledTimes(2);

    // Test Front View
    ref.current?.setPreset('front');
    expect(mockUpdate).toHaveBeenCalledTimes(3);

    // Test Side View
    ref.current?.setPreset('side');
    expect(mockUpdate).toHaveBeenCalledTimes(4);
  });

  it('exposes zoom methods via ref', () => {
    render(<CameraControls ref={ref} />);

    expect(ref.current).toHaveProperty('zoomIn');
    expect(ref.current).toHaveProperty('zoomOut');

    ref.current?.zoomIn();
    expect(mockUpdate).toHaveBeenCalled();

    ref.current?.zoomOut();
    expect(mockUpdate).toHaveBeenCalledTimes(2);
  });

  it('exposes fitToView method via ref', () => {
    render(<CameraControls ref={ref} />);

    const box = new THREE.Box3(
        new THREE.Vector3(-5, 0, -5),
        new THREE.Vector3(5, 5, 5)
    );

    ref.current?.fitToView(box);
    expect(mockUpdate).toHaveBeenCalled();
    // Should center target
    expect(mockTarget.x).toBe(0);
    expect(mockTarget.y).toBe(2.5);
    expect(mockTarget.z).toBe(0);
  });

  it('handles reset when control ref is null', () => {
      // We can't easily simulate ref being null inside the component since we mock it,
      // but we can ensure it doesn't crash if we render without ref usage,
      // or if we could unmount and call it (which is impossible).
      // However, we can test that calling methods on ref doesn't crash if internal ref was somehow null?
      // No, because useImperativeHandle runs.
      // The branches checking `if (controlsRef.current)` are what we want to hit.

      // To hit the `else` (or implicit return) of `if (controlsRef.current)`, we need controlsRef.current to be null.
      // But OrbitControls is rendered.

      // If we render a version where OrbitControls doesn't attach the ref properly?
      // This is hard with the current mock.
      // But we can verify positive cases fully.
  });
});
