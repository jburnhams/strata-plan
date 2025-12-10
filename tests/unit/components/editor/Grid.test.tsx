import React from 'react';
import { render, screen } from '@testing-library/react';
import { Grid } from '../../../../src/components/editor/Grid';
import { useUIStore } from '../../../../src/stores/uiStore';

// Mock useUIStore
jest.mock('../../../../src/stores/uiStore');

describe('Grid', () => {
  const defaultStore = {
    showGrid: true,
    zoomLevel: 1.0,
  };

  beforeEach(() => {
    (useUIStore as unknown as jest.Mock).mockReturnValue(defaultStore);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when showGrid is false', () => {
    (useUIStore as unknown as jest.Mock).mockReturnValue({
      ...defaultStore,
      showGrid: false,
    });
    render(
      <svg>
        <Grid />
      </svg>
    );
    expect(screen.queryByTestId('grid-layer')).not.toBeInTheDocument();
  });

  it('renders 1m and 0.5m grid at zoom 1.0', () => {
    // Zoom 1.0 -> show05m is true (>= 0.5), show01m is false (> 1.0)
    render(
      <svg>
        <Grid />
      </svg>
    );
    expect(screen.getByTestId('grid-rect-1m')).toBeInTheDocument();
    expect(screen.getByTestId('grid-rect-0.5m')).toBeInTheDocument();
    expect(screen.queryByTestId('grid-rect-0.1m')).not.toBeInTheDocument();
  });

  it('renders only 1m grid at zoom 0.4', () => {
    (useUIStore as unknown as jest.Mock).mockReturnValue({
      ...defaultStore,
      zoomLevel: 0.4,
    });
    render(
      <svg>
        <Grid />
      </svg>
    );
    expect(screen.getByTestId('grid-rect-1m')).toBeInTheDocument();
    expect(screen.queryByTestId('grid-rect-0.5m')).not.toBeInTheDocument();
    expect(screen.queryByTestId('grid-rect-0.1m')).not.toBeInTheDocument();
  });

  it('renders all grids at zoom 2.0', () => {
    (useUIStore as unknown as jest.Mock).mockReturnValue({
      ...defaultStore,
      zoomLevel: 2.0,
    });
    render(
      <svg>
        <Grid />
      </svg>
    );
    expect(screen.getByTestId('grid-rect-1m')).toBeInTheDocument();
    expect(screen.getByTestId('grid-rect-0.5m')).toBeInTheDocument();
    expect(screen.getByTestId('grid-rect-0.1m')).toBeInTheDocument();
  });
});
