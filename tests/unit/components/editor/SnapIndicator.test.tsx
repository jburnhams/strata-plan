import React from 'react';
import { render, screen } from '@testing-library/react';
import { SnapIndicator } from '../../../../src/components/editor/SnapIndicator';
import { useUIStore } from '../../../../src/stores/uiStore';

jest.mock('../../../../src/stores/uiStore');

describe('SnapIndicator', () => {
  const defaultStore = {
    snapToGrid: true,
    gridSize: 0.5,
    zoomLevel: 1.0,
    panOffset: { x: 0, z: 0 },
  };

  beforeEach(() => {
    (useUIStore as unknown as jest.Mock).mockReturnValue(defaultStore);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing if snapToGrid is false', () => {
    (useUIStore as unknown as jest.Mock).mockReturnValue({ ...defaultStore, snapToGrid: false });
    render(
       <svg>
         <SnapIndicator mousePos={{x: 500, y: 400}} viewportSize={{width: 1000, height: 800}} />
       </svg>
    );
    expect(screen.queryByTestId('snap-indicator')).not.toBeInTheDocument();
  });

  it('renders nothing if mousePos is null', () => {
    render(
       <svg>
         <SnapIndicator mousePos={null} viewportSize={{width: 1000, height: 800}} />
       </svg>
    );
    expect(screen.queryByTestId('snap-indicator')).not.toBeInTheDocument();
  });

  it('renders indicator at snapped position', () => {
    // Viewport 1000x800. Center is (500, 400).
    // Pan offset 0, 0.
    // Screen (500, 400) maps to World (0, 0).

    // Test point: Screen (525, 400).
    // World X offset = (525 - 500) / 50 = 25 / 50 = 0.5 meters.
    // World Z offset = (400 - 400) / 50 = 0 meters.
    // Snapped to 0.5m grid -> 0.5m.

    // The indicator is rendered inside <g transform="..."> in CanvasViewport,
    // but SnapIndicator outputs <circle cx="..."> in world units (if inside SVG).
    // Yes, SnapIndicator returns <g><circle .../></g>.

    render(
       <svg>
         <SnapIndicator mousePos={{x: 525, y: 400}} viewportSize={{width: 1000, height: 800}} />
       </svg>
    );

    const indicator = screen.getByTestId('snap-indicator');
    const circle = indicator.querySelector('circle');

    // At zoom 1.0, 50px per meter.
    expect(circle).toHaveAttribute('cx', '0.5');
    expect(circle).toHaveAttribute('cy', '0');
  });
});
