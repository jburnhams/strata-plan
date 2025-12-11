import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
  Settings: () => <div data-testid="icon-settings" />,
  Grid: () => <div data-testid="icon-grid" />,
  Type: () => <div data-testid="icon-type" />,
  Sun: () => <div data-testid="icon-sun" />,
  Layers: () => <div data-testid="icon-layers" />,
}));

// Mock UI Store
const mockSetViewerBrightness = jest.fn();
const mockSetViewerShadowQuality = jest.fn();
const mockSetViewerWallOpacity = jest.fn();
const mockToggleGrid = jest.fn();
const mockToggleRoomLabels = jest.fn();

jest.mock('@/stores/uiStore', () => ({
  useUIStore: jest.fn(() => ({
    showGrid: true,
    toggleGrid: mockToggleGrid,
    showRoomLabels: true,
    toggleRoomLabels: mockToggleRoomLabels,
    viewerBrightness: 1.0,
    setViewerBrightness: mockSetViewerBrightness,
    viewerShadowQuality: 'medium',
    setViewerShadowQuality: mockSetViewerShadowQuality,
    viewerWallOpacity: 1.0,
    setViewerWallOpacity: mockSetViewerWallOpacity,
  })),
}));

// Mock Shadcn components to avoid Radix complexity in unit tests
jest.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: any) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: any) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: any) => <div data-testid="dropdown-content">{children}</div>,
  DropdownMenuLabel: ({ children }: any) => <div>{children}</div>,
  DropdownMenuSeparator: () => <hr />,
}));

jest.mock('@/components/ui/slider', () => ({
  Slider: ({ onValueChange, value, max }: any) => (
    <input
      type="range"
      data-testid="slider"
      max={max}
      value={value[0]}
      onChange={(e) => onValueChange([parseFloat(e.target.value)])}
    />
  ),
}));

jest.mock('@/components/ui/switch', () => ({
  Switch: ({ checked, onCheckedChange, id }: any) => (
    <input
      type="checkbox"
      data-testid={`switch-${id}`}
      checked={checked}
      onChange={(e) => onCheckedChange(e.target.checked)}
    />
  ),
}));

jest.mock('@/components/ui/select', () => ({
  Select: ({ onValueChange, value, children }: any) => (
    <select data-testid="select" value={value} onChange={(e) => onValueChange(e.target.value)}>
       {children}
    </select>
  ),
  SelectTrigger: () => null,
  SelectValue: () => null,
  SelectContent: ({ children }: any) => <>{children}</>,
  SelectItem: ({ value, children }: any) => <option value={value}>{children}</option>,
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
    jest.clearAllMocks();
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
    expect(screen.getByTitle(/View Settings/)).toBeInTheDocument();
  });

  it('renders settings menu content', () => {
    render(<ViewerControls cameraControlsRef={mockRef} />);
    expect(screen.getByTestId('dropdown-content')).toBeInTheDocument();
  });

  it('toggles grid setting', () => {
    render(<ViewerControls cameraControlsRef={mockRef} />);
    const switchEl = screen.getByTestId('switch-show-grid');
    fireEvent.click(switchEl);
    expect(mockToggleGrid).toHaveBeenCalled();
  });

  it('toggles labels setting', () => {
    render(<ViewerControls cameraControlsRef={mockRef} />);
    const switchEl = screen.getByTestId('switch-show-labels');
    fireEvent.click(switchEl);
    expect(mockToggleRoomLabels).toHaveBeenCalled();
  });

  it('adjusts brightness', () => {
    render(<ViewerControls cameraControlsRef={mockRef} />);
    const sliders = screen.getAllByTestId('slider');
    // First slider is brightness
    fireEvent.change(sliders[0], { target: { value: '1.5' } });
    expect(mockSetViewerBrightness).toHaveBeenCalledWith(1.5);
  });

  it('adjusts wall opacity', () => {
    render(<ViewerControls cameraControlsRef={mockRef} />);
    const sliders = screen.getAllByTestId('slider');
    // Second slider is wall opacity
    fireEvent.change(sliders[1], { target: { value: '0.5' } });
    expect(mockSetViewerWallOpacity).toHaveBeenCalledWith(0.5);
  });

  it('changes shadow quality', () => {
      render(<ViewerControls cameraControlsRef={mockRef} />);
      const select = screen.getByTestId('select');
      fireEvent.change(select, { target: { value: 'high' } });
      expect(mockSetViewerShadowQuality).toHaveBeenCalledWith('high');
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
});
