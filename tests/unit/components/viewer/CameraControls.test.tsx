import React from 'react';
import { render, screen } from '@testing-library/react';
import { CameraControls, CameraControlsRef } from '../../../../src/components/viewer/CameraControls';
import * as THREE from 'three';

// Mock dependencies
const mockReset = jest.fn();
const mockUpdate = jest.fn();
const mockTarget = new THREE.Vector3(0, 0, 0);

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
  });

  it('renders orbit controls', () => {
    render(<CameraControls />);
    expect(screen.getByTestId('orbit-controls-mock')).toBeInTheDocument();
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
  });

  it('exposes zoom methods via ref', () => {
    render(<CameraControls ref={ref} />);

    expect(ref.current).toHaveProperty('zoomIn');
    expect(ref.current).toHaveProperty('zoomOut');

    ref.current?.zoomIn();
    expect(mockUpdate).toHaveBeenCalled();
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
});
