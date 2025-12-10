import React from 'react';
import { render, screen } from '@testing-library/react';
import { Grid } from '../../../../src/components/editor/Grid';
import { useUIStore } from '../../../../src/stores/uiStore';

describe('Grid', () => {
  beforeEach(() => {
    useUIStore.setState({
      showGrid: true,
      zoomLevel: 1.0,
    });
  });

  it('renders nothing when hidden', () => {
    useUIStore.setState({ showGrid: false });
    const { container } = render(
      <svg>
        <Grid />
      </svg>
    );
    expect(container.querySelector('g')).not.toBeInTheDocument();
  });

  it('renders major grid and axes by default', () => {
    render(
      <svg>
        <Grid />
      </svg>
    );

    expect(screen.getByTestId('grid-layer')).toBeInTheDocument();
    expect(screen.getByTestId('grid-major-rect')).toBeInTheDocument();
    expect(screen.getByTestId('grid-axis-x')).toBeInTheDocument();
    expect(screen.getByTestId('grid-axis-z')).toBeInTheDocument();
  });

  it('renders medium grid when zoom >= 0.5', () => {
    useUIStore.setState({ zoomLevel: 0.5 });
    render(
      <svg>
        <Grid />
      </svg>
    );
    expect(screen.getByTestId('grid-medium-rect')).toBeInTheDocument();
  });

  it('hides medium grid when zoom < 0.5', () => {
    useUIStore.setState({ zoomLevel: 0.49 });
    render(
      <svg>
        <Grid />
      </svg>
    );
    expect(screen.queryByTestId('grid-medium-rect')).not.toBeInTheDocument();
  });

  it('renders minor grid when zoom > 1.0', () => {
    useUIStore.setState({ zoomLevel: 1.1 });
    render(
      <svg>
        <Grid />
      </svg>
    );
    expect(screen.getByTestId('grid-minor-rect')).toBeInTheDocument();
  });

  it('hides minor grid when zoom <= 1.0', () => {
    useUIStore.setState({ zoomLevel: 1.0 });
    render(
      <svg>
        <Grid />
      </svg>
    );
    expect(screen.queryByTestId('grid-minor-rect')).not.toBeInTheDocument();
  });
});
