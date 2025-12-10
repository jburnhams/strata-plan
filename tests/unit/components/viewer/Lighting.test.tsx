import React from 'react';
import { renderHook, render, screen, act } from '@testing-library/react';
import { useLightingLogic, Lighting, LightingProps } from '../../../../src/components/viewer/Lighting';
import * as THREE from 'three';

// Mock dependencies
jest.mock('@react-three/fiber', () => ({
  useThree: () => ({ scene: {} }),
  useFrame: jest.fn(),
}));

// Suppress console.error for unknown elements <ambientLight> etc in JSDOM
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (/The tag <.*> is unrecognized/.test(args[0])) return;
    if (/is using incorrect casing/.test(args[0])) return;
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

describe('Lighting Logic', () => {
  let mockLight: any;

  beforeEach(() => {
    mockLight = {
      position: { set: jest.fn() },
      target: {
        position: { set: jest.fn() },
        updateMatrixWorld: jest.fn()
      },
      castShadow: false,
      shadow: {
        mapSize: { width: 0, height: 0 },
        camera: { left: 0, right: 0, top: 0, bottom: 0, near: 0, far: 0 },
        bias: 0
      }
    };
  });

  it('updates light position based on sun direction', () => {
    const props: LightingProps = { sunDirection: 90 }; // East

    renderHook(() => useLightingLogic(mockLight, props));

    expect(mockLight.position.set).toHaveBeenCalledWith(50, 30, 0);
  });

  it('updates light position for North', () => {
    const props: LightingProps = { sunDirection: 0 }; // North

    renderHook(() => useLightingLogic(mockLight, props));

    expect(mockLight.position.set).toHaveBeenCalledWith(
        expect.closeTo(0, 5),
        30,
        expect.closeTo(-50, 5)
    );
  });

  it('enables shadows when castShadows is true', () => {
    const props: LightingProps = { castShadows: true, shadowMapSize: 1024 };

    renderHook(() => useLightingLogic(mockLight, props));

    expect(mockLight.castShadow).toBe(true);
    expect(mockLight.shadow.mapSize.width).toBe(1024);
    expect(mockLight.shadow.mapSize.height).toBe(1024);
  });

  it('disables shadows when castShadows is false', () => {
    const props: LightingProps = { castShadows: false };

    renderHook(() => useLightingLogic(mockLight, props));

    expect(mockLight.castShadow).toBe(false);
  });
});

describe('Lighting Component', () => {
    it('renders light elements', () => {
        const { container } = render(<Lighting />);

        expect(container.querySelector('directionalLight')).toBeInTheDocument();
        expect(container.querySelector('ambientLight')).toBeInTheDocument();
    });
});
