import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { CameraControls } from '@/components/viewer/CameraControls';
import { useCameraControls } from '@/hooks/useCameraControls';

// Mock useCameraControls
jest.mock('@/hooks/useCameraControls');

// Mock @react-three/drei
jest.mock('@react-three/drei', () => {
  const React = require('react');
  return {
    OrbitControls: React.forwardRef((props, ref) => React.createElement('div', { 'data-testid': 'orbit-controls' })),
  };
});

describe('CameraControls', () => {
  const mockSetPresetView = jest.fn();
  const mockFitToView = jest.fn();
  const mockZoom = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useCameraControls as jest.Mock).mockReturnValue({
      setPresetView: mockSetPresetView,
      fitToView: mockFitToView,
      zoom: mockZoom,
    });
  });

  it('renders OrbitControls', () => {
    render(<CameraControls />);
    // Just verifying it renders without crashing
  });

  it('handles keyboard shortcuts', () => {
    render(<CameraControls />);

    fireEvent.keyDown(window, { key: '1' });
    expect(mockSetPresetView).toHaveBeenCalledWith('isometric');

    fireEvent.keyDown(window, { key: '2' });
    expect(mockSetPresetView).toHaveBeenCalledWith('top');

    fireEvent.keyDown(window, { key: 'f' });
    expect(mockFitToView).toHaveBeenCalled();

    fireEvent.keyDown(window, { key: '+' });
    expect(mockZoom).toHaveBeenCalledWith(1);

    fireEvent.keyDown(window, { key: '=' });
    expect(mockZoom).toHaveBeenCalledWith(1);

    fireEvent.keyDown(window, { key: '-' });
    expect(mockZoom).toHaveBeenCalledWith(-1);

    fireEvent.keyDown(window, { key: '_' });
    expect(mockZoom).toHaveBeenCalledWith(-1);
  });

  it('ignores keyboard shortcuts when input is focused', () => {
    render(<CameraControls />);

    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    fireEvent.keyDown(input, { key: '1' });
    expect(mockSetPresetView).not.toHaveBeenCalled();

    document.body.removeChild(input);
  });
});
