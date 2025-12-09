import React from 'react';
import { render } from '@testing-library/react';
import { Environment } from '../../../../src/components/viewer/Environment';
import * as THREE from 'three';

// Mock @react-three/fiber
const mockScene = new THREE.Scene();

jest.mock('@react-three/fiber', () => {
    return {
      useThree: () => ({
        scene: mockScene,
      }),
    };
  });

// Mock Three.js objects
jest.mock('three', () => {
  const original = jest.requireActual('three');
  return {
    ...original,
    Color: class {
      r = 0; g = 0; b = 0;
      set = jest.fn();
      constructor(color: string) { return this; }
    },
    // Keep Scene real-ish or mocked enough to hold properties
    Scene: class {
        background = null;
        fog = null;
    },
    Fog: class {
        color: any; near: number; far: number;
        constructor(color: any, near: number, far: number) {
            this.color = color;
            this.near = near;
            this.far = far;
        }
    }
  };
});


describe('Environment', () => {
    beforeEach(() => {
        // Reset scene props
        mockScene.background = null;
        mockScene.fog = null;
    });

    it('renders environment components', () => {
        const consoleError = console.error;
        console.error = jest.fn();

        const { container } = render(<Environment />);

        expect(container.querySelector('mesh')).toBeInTheDocument();
        expect(container.querySelector('gridHelper')).toBeInTheDocument();

        console.error = consoleError;
    });

    it('applies background and fog to scene', () => {
        render(<Environment backgroundColor="#ff0000" />);

        expect(mockScene.background).toBeDefined();
        expect(mockScene.fog).toBeDefined();
    });

    it('toggles grid visibility', () => {
        const consoleError = console.error;
        console.error = jest.fn();

        const { container, rerender } = render(<Environment showGrid={true} />);
        expect(container.querySelector('gridHelper')).toBeInTheDocument();

        rerender(<Environment showGrid={false} />);
        expect(container.querySelector('gridHelper')).not.toBeInTheDocument();

        console.error = consoleError;
    });

    it('toggles axis visibility', () => {
        const consoleError = console.error;
        console.error = jest.fn();

        const { container, rerender } = render(<Environment showAxis={true} />);
        expect(container.querySelector('axesHelper')).toBeInTheDocument();

        rerender(<Environment showAxis={false} />);
        expect(container.querySelector('axesHelper')).not.toBeInTheDocument();

        console.error = consoleError;
    });
});
