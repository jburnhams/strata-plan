import React from 'react';
import { render, screen } from '@testing-library/react';
import { Ruler } from '../../../../src/components/editor/Ruler';
import { useUIStore } from '../../../../src/stores/uiStore';

jest.mock('../../../../src/stores/uiStore');

describe('Ruler', () => {
  const defaultStore = {
    zoomLevel: 1.0,
    panOffset: { x: 0, z: 0 },
  };

  beforeEach(() => {
    (useUIStore as unknown as jest.Mock).mockReturnValue(defaultStore);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders horizontal ruler', () => {
    render(<Ruler orientation="horizontal" size={1000} otherSize={800} />);
    expect(screen.getByTestId('horizontal-ruler')).toBeInTheDocument();
  });

  it('renders vertical ruler', () => {
    render(<Ruler orientation="vertical" size={800} otherSize={1000} />);
    expect(screen.getByTestId('vertical-ruler')).toBeInTheDocument();
  });

  it('renders ticks', () => {
    render(<Ruler orientation="horizontal" size={1000} otherSize={800} />);
    // Check for "0" text content.
    // Note: implementation checks Math.abs(t) < 0.001 ? 0 : ...
    expect(screen.getByText('0')).toBeInTheDocument();
  });
});
