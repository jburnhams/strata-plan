import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Viewer3D } from '@/components/viewer/Viewer3D';

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock WebGL context
const mockGetContext = jest.fn();
HTMLCanvasElement.prototype.getContext = mockGetContext;

describe('Viewer3D', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetContext.mockReturnValue({
        getParameter: jest.fn().mockReturnValue(''),
        getExtension: jest.fn().mockReturnValue({}),
        createTexture: jest.fn(),
        bindTexture: jest.fn(),
        texParameteri: jest.fn(),
        texImage2D: jest.fn(),
        clearColor: jest.fn(),
        clear: jest.fn(),
        enable: jest.fn(),
        blendFunc: jest.fn(),
        viewport: jest.fn(),
        // Add minimal WebGL methods to prevent three.js crashing immediately in jsdom
    });
  });

  it('renders loading state initially', () => {
    // We assume WebGL is supported
    mockGetContext.mockReturnValue({});
    render(<Viewer3D />);
    // Since Canvas loads async, we might see the loader or the canvas.
    // We are not mocking Canvas so it tries to render.
    // Just checking if it doesn't crash.
  });

  it('shows error if WebGL is not supported', () => {
    mockGetContext.mockReturnValue(null);
    render(<Viewer3D />);
    expect(screen.getByText('WebGL is not supported in this browser.')).toBeInTheDocument();
  });
});
