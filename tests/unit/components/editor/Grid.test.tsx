import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Grid } from '@/components/editor/Grid';
import { useUIStore } from '@/stores/uiStore';

// Helper to reset store
const resetStore = () => {
  useUIStore.setState({
    showGrid: true,
    zoomLevel: 1.0,
  });
};

describe('Grid', () => {
  beforeEach(() => {
    resetStore();
  });

  it('renders nothing when showGrid is false', () => {
    useUIStore.setState({ showGrid: false });
    const { container } = render(<svg><Grid /></svg>);
    // Grid returns null, so container (svg) should have no children or empty group if Grid returned fragments
    // Grid returns <g> or null.
    // If null, svg is empty.
    expect(container.querySelector('g')).not.toBeInTheDocument();
  });

  it('renders grid layer when showGrid is true', () => {
    render(<svg><Grid /></svg>);
    expect(screen.getByTestId('grid-layer')).toBeInTheDocument();
  });

  it('renders only large grid at low zoom (< 0.5)', () => {
    useUIStore.setState({ zoomLevel: 0.25 });
    render(<svg><Grid /></svg>);

    const group = screen.getByTestId('grid-layer');
    // Check outerHTML to see which fills are applied
    // We expect fill="url(#grid-large)" but not medium/small
    expect(group.innerHTML).toContain('url(#grid-large)');
    expect(group.innerHTML).not.toContain('url(#grid-medium)');
    expect(group.innerHTML).not.toContain('url(#grid-small)');
  });

  it('renders medium grid at medium zoom (0.5 <= z <= 1.0)', () => {
    useUIStore.setState({ zoomLevel: 0.5 });
    render(<svg><Grid /></svg>);

    const group = screen.getByTestId('grid-layer');
    expect(group.innerHTML).toContain('url(#grid-large)');
    expect(group.innerHTML).toContain('url(#grid-medium)');
    expect(group.innerHTML).not.toContain('url(#grid-small)');
  });

  it('renders small grid at high zoom (> 1.0)', () => {
    useUIStore.setState({ zoomLevel: 2.0 });
    render(<svg><Grid /></svg>);

    const group = screen.getByTestId('grid-layer');
    expect(group.innerHTML).toContain('url(#grid-large)');
    expect(group.innerHTML).toContain('url(#grid-medium)');
    expect(group.innerHTML).toContain('url(#grid-small)');
  });
});
