import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ViewerControls } from '@/components/viewer/ViewerControls';
import { CameraControlsRef } from '@/components/viewer/CameraControls';

// Mock lucide-react
jest.mock('lucide-react', () => ({
  Box: () => <div data-testid="icon-box" />,
  ArrowUp: () => <div data-testid="icon-arrow-up" />,
  ArrowDown: () => <div data-testid="icon-arrow-down" />,
  ArrowRight: () => <div data-testid="icon-arrow-right" />,
  RotateCcw: () => <div data-testid="icon-rotate-ccw" />,
  ZoomIn: () => <div data-testid="icon-zoom-in" />,
  ZoomOut: () => <div data-testid="icon-zoom-out" />,
}));

describe('ViewerControls', () => {
  let mockControls: CameraControlsRef;
  let mockRef: React.RefObject<CameraControlsRef | null>;

  beforeEach(() => {
    mockControls = {
      reset: jest.fn(),
      setPreset: jest.fn(),
      zoomIn: jest.fn(),
      zoomOut: jest.fn(),
      fitToView: jest.fn(),
    };
    mockRef = { current: mockControls };
  });

  it('renders buttons correctly', () => {
    render(<ViewerControls cameraControlsRef={mockRef} />);

    expect(screen.getByTitle(/Isometric/)).toBeInTheDocument();
    expect(screen.getByTitle(/Top/)).toBeInTheDocument();
    expect(screen.getByTitle(/Front/)).toBeInTheDocument();
    expect(screen.getByTitle(/Side/)).toBeInTheDocument();
    expect(screen.getByTitle(/Zoom In/)).toBeInTheDocument();
    expect(screen.getByTitle(/Zoom Out/)).toBeInTheDocument();
    expect(screen.getByTitle(/Reset/)).toBeInTheDocument();
  });

  it('calls setPreset when preset buttons are clicked', () => {
    render(<ViewerControls cameraControlsRef={mockRef} />);

    fireEvent.click(screen.getByTitle(/Isometric/));
    expect(mockControls.setPreset).toHaveBeenCalledWith('isometric');

    fireEvent.click(screen.getByTitle(/Top/));
    expect(mockControls.setPreset).toHaveBeenCalledWith('top');

    fireEvent.click(screen.getByTitle(/Front/));
    expect(mockControls.setPreset).toHaveBeenCalledWith('front');

    fireEvent.click(screen.getByTitle(/Side/));
    expect(mockControls.setPreset).toHaveBeenCalledWith('side');
  });

  it('calls zoom and reset methods when buttons are clicked', () => {
    render(<ViewerControls cameraControlsRef={mockRef} />);

    fireEvent.click(screen.getByTitle(/Zoom In/));
    expect(mockControls.zoomIn).toHaveBeenCalled();

    fireEvent.click(screen.getByTitle(/Zoom Out/));
    expect(mockControls.zoomOut).toHaveBeenCalled();

    fireEvent.click(screen.getByTitle(/Reset/));
    expect(mockControls.reset).toHaveBeenCalled();
  });

  it('handles keyboard shortcuts', () => {
    render(<ViewerControls cameraControlsRef={mockRef} />);

    fireEvent.keyDown(window, { key: '1' });
    expect(mockControls.setPreset).toHaveBeenCalledWith('isometric');

    fireEvent.keyDown(window, { key: '2' });
    expect(mockControls.setPreset).toHaveBeenCalledWith('top');

    fireEvent.keyDown(window, { key: '+' });
    expect(mockControls.zoomIn).toHaveBeenCalled();

    fireEvent.keyDown(window, { key: '-' });
    expect(mockControls.zoomOut).toHaveBeenCalled();

    fireEvent.keyDown(window, { key: 'r' });
    expect(mockControls.reset).toHaveBeenCalled();
  });

  it('does not trigger shortcuts when typing in input', () => {
    render(
      <div>
        <ViewerControls cameraControlsRef={mockRef} />
        <input data-testid="test-input" />
      </div>
    );

    const input = screen.getByTestId('test-input');
    input.focus();

    fireEvent.keyDown(input, { key: '1' });
    expect(mockControls.setPreset).not.toHaveBeenCalled();
  });
});
