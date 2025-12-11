import React from 'react';
import { render, screen } from '@testing-library/react';
import { SnapIndicator } from '../../../../src/components/editor/SnapIndicator';
import { useUIStore } from '../../../../src/stores/uiStore';

// Mock UI Store
jest.mock('../../../../src/stores/uiStore', () => ({
  useUIStore: jest.fn(),
}));

describe('SnapIndicator', () => {
  beforeEach(() => {
    (useUIStore as unknown as jest.Mock).mockReturnValue({
      snapToGrid: true,
      gridSize: 0.5,
      zoomLevel: 1.0,
    });
  });

  it('renders nothing when snapToGrid is false', () => {
    (useUIStore as unknown as jest.Mock).mockReturnValue({
      snapToGrid: false,
      gridSize: 0.5,
      zoomLevel: 1.0,
    });
    const { container } = render(<SnapIndicator cursorPosition={{ x: 0, z: 0 }} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when cursorPosition is null', () => {
    const { container } = render(<SnapIndicator cursorPosition={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders snapped indicator at correct position', () => {
    render(
      <svg>
        <SnapIndicator cursorPosition={{ x: 1.2, z: 2.8 }} />
      </svg>
    );

    // Nearest 0.5 to 1.2 is 1.0. Nearest 0.5 to 2.8 is 3.0.
    const indicator = screen.getByTestId('snap-indicator');
    expect(indicator).toBeInTheDocument();

    const circles = indicator.querySelectorAll('circle');
    expect(circles).toHaveLength(2);

    expect(circles[0]).toHaveAttribute('cx', '1');
    expect(circles[0]).toHaveAttribute('cy', '3');
  });

  it('updates position when grid size changes', () => {
     (useUIStore as unknown as jest.Mock).mockReturnValue({
      snapToGrid: true,
      gridSize: 1.0,
      zoomLevel: 1.0,
    });

    render(
      <svg>
        <SnapIndicator cursorPosition={{ x: 1.2, z: 2.8 }} />
      </svg>
    );

    // Nearest 1.0 to 1.2 is 1.0. Nearest 1.0 to 2.8 is 3.0.
    const indicator = screen.getByTestId('snap-indicator');
    const circles = indicator.querySelectorAll('circle');
    expect(circles[0]).toHaveAttribute('cx', '1');
    expect(circles[0]).toHaveAttribute('cy', '3');
  });
});
