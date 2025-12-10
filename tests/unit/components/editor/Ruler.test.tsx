import React from 'react';
import { render, screen } from '@testing-library/react';
import 'jest-canvas-mock';
import { Ruler } from '../../../../src/components/editor/Ruler';
import { useUIStore } from '../../../../src/stores/uiStore';

// Mock UI Store
jest.mock('../../../../src/stores/uiStore', () => ({
  useUIStore: jest.fn(),
}));

describe('Ruler', () => {
  beforeEach(() => {
    // Default mock implementation
    (useUIStore as unknown as jest.Mock).mockReturnValue({
      zoomLevel: 1.0,
      panOffset: { x: 0, z: 0 },
    });
  });

  it('renders horizontal ruler', () => {
    render(<Ruler orientation="horizontal" viewportWidth={800} viewportHeight={600} />);
    const canvas = screen.getByTestId('ruler-horizontal');
    expect(canvas).toBeInTheDocument();

    // Note: jest-canvas-mock might affect how styles are applied or read,
    // or how width/height attributes are reflected.
    // The component sets width/height on the canvas element directly, which affects layout.
    // However, the test failure indicated it didn't find the expected styles.
    // The component uses style object for positioning, but width/height are attributes.
    // Let's check attributes instead for dimensions.

    expect(canvas).toHaveStyle({ top: '0px', position: 'absolute' });
    expect(canvas).toHaveAttribute('width', '800');
    expect(canvas).toHaveAttribute('height', '20');
  });

  it('renders vertical ruler', () => {
    render(<Ruler orientation="vertical" viewportWidth={800} viewportHeight={600} />);
    const canvas = screen.getByTestId('ruler-vertical');
    expect(canvas).toBeInTheDocument();

    expect(canvas).toHaveStyle({ left: '0px', position: 'absolute' });
    expect(canvas).toHaveAttribute('width', '20');
    expect(canvas).toHaveAttribute('height', '600');
  });

  it('updates canvas size when viewport dimensions change', () => {
    const { rerender } = render(<Ruler orientation="horizontal" viewportWidth={100} viewportHeight={100} />);
    const canvas = screen.getByTestId('ruler-horizontal') as HTMLCanvasElement;

    // Initial size
    expect(canvas.width).toBe(100);

    // Update props
    rerender(<Ruler orientation="horizontal" viewportWidth={200} viewportHeight={100} />);
    expect(canvas.width).toBe(200);
  });
});
