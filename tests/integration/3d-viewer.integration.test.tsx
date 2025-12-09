import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { Viewer3D } from '@/components/viewer/Viewer3D';

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  callback: ResizeObserverCallback;
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }
  observe(target: Element) {
    this.callback([
      {
        target,
        contentRect: {
          x: 0,
          y: 0,
          width: 800,
          height: 600,
          top: 0,
          right: 800,
          bottom: 600,
          left: 0,
          toJSON: () => {}
        },
        borderBoxSize: [],
        contentBoxSize: [],
        devicePixelContentBoxSize: []
      }
    ], this);
  }
  unobserve() {}
  disconnect() {}
};

describe('3D Viewer Integration', () => {
  let originalGetContext: any;
  let originalConsoleError: any;

  beforeAll(() => {
    originalGetContext = HTMLCanvasElement.prototype.getContext;
    originalConsoleError = console.error;

    // Suppress Three.js warnings
    console.error = (...args) => {
      if (typeof args[0] === 'string' && (args[0].includes('THREE.WebGLRenderer') || args[0].includes('Error'))) return;
      originalConsoleError(...args);
    };

    // Mock WebGL context
    const mockContext = {
      getExtension: () => ({}),
      getParameter: () => 0,
      createTexture: () => ({}),
      bindTexture: () => {},
      texParameteri: () => {},
      texImage2D: () => {},
      clearColor: () => {},
      clear: () => {},
      enable: () => {},
      disable: () => {},
      blendFunc: () => {},
      viewport: () => {},
      createShader: () => ({}),
      shaderSource: () => {},
      compileShader: () => {},
      getShaderParameter: () => true,
      createProgram: () => ({}),
      attachShader: () => {},
      linkProgram: () => {},
      getProgramParameter: () => true,
      useProgram: () => {},
      createBuffer: () => ({}),
      bindBuffer: () => {},
      bufferData: () => {},
      enableVertexAttribArray: () => {},
      vertexAttribPointer: () => {},
      getUniformLocation: () => ({}),
      uniformMatrix4fv: () => {},
      uniform1i: () => {},
      uniform1f: () => {},
      drawArrays: () => {},
      drawElements: () => {},
      canvas: { width: 800, height: 600 },
    };

    HTMLCanvasElement.prototype.getContext = function (
      type: string,
      attributes?: any
    ) {
      if (type === 'webgl' || type === 'experimental-webgl') {
        return mockContext as unknown as WebGLRenderingContext;
      }
      return originalGetContext.call(this, type, attributes);
    } as any;
  });

  afterAll(() => {
    HTMLCanvasElement.prototype.getContext = originalGetContext;
    console.error = originalConsoleError;
  });

  it('initializes and renders the 3D scene without crashing', async () => {
    const { container } = render(<Viewer3D />);

    // Wait for Canvas to render
    await waitFor(() => {
      const canvas = container.querySelector('canvas');
      expect(canvas).toBeInTheDocument();
    }, { timeout: 5000 });

    // Check that ErrorBoundary did not catch anything
    expect(container.textContent).not.toContain('Viewer Error');
    expect(container.textContent).not.toContain('WebGL is not supported');
  });
});
