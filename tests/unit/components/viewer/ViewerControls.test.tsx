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
  Settings: () => <div data-testid="icon-settings" />,
  Grid: () => <div data-testid="icon-grid" />,
  Type: () => <div data-testid="icon-type" />,
  Sun: () => <div data-testid="icon-sun" />,
  Layers: () => <div data-testid="icon-layers" />,
  User: () => <div data-testid="icon-user" />,
  Download: () => <div data-testid="icon-download" />,
  Maximize: () => <div data-testid="icon-maximize" />,
  HelpCircle: () => <div data-testid="icon-help" />,
  FileImage: () => <div data-testid="icon-file-image" />,
  FileBox: () => <div data-testid="icon-file-box" />,
}));

// Mock UI Store
const mockSetViewerBrightness = jest.fn();
const mockSetViewerQuality = jest.fn();
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
    viewerQuality: 'medium',
    setViewerQuality: mockSetViewerQuality,
    viewerWallOpacity: 1.0,
    setViewerWallOpacity: mockSetViewerWallOpacity,
  })),
}));

// Mock Shadcn components to avoid Radix complexity in unit tests
jest.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: any) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: any) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: any) => <div data-testid="dropdown-content">{children}</div>,
  DropdownMenuItem: ({ children, onClick }: any) => <div role="button" onClick={onClick}>{children}</div>,
  DropdownMenuLabel: ({ children }: any) => <div>{children}</div>,
  DropdownMenuSeparator: () => <hr />,
}));

jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children }: any) => <div>{children}</div>,
  DialogTrigger: ({ children }: any) => <div>{children}</div>,
  DialogContent: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <div>{children}</div>,
  DialogDescription: ({ children }: any) => <div>{children}</div>,
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
    expect(screen.getByTitle(/First Person Walk/)).toBeInTheDocument();
    expect(screen.getByTitle(/Export/)).toBeInTheDocument();
    expect(screen.getByTitle(/Toggle Fullscreen/)).toBeInTheDocument();
    expect(screen.getByTitle(/Help/)).toBeInTheDocument();
  });

  it('renders settings menu content', () => {
    render(<ViewerControls cameraControlsRef={mockRef} />);
    // There are now multiple dropdowns, so we expect multiple contents
    const contents = screen.getAllByTestId('dropdown-content');
    expect(contents.length).toBeGreaterThan(0);
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

  it('changes quality preset', () => {
      render(<ViewerControls cameraControlsRef={mockRef} />);
      const select = screen.getByTestId('select');
      fireEvent.change(select, { target: { value: 'high' } });
      expect(mockSetViewerQuality).toHaveBeenCalledWith('high');
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

  it('toggles first person mode', () => {
    const onToggle = jest.fn();
    render(<ViewerControls cameraControlsRef={mockRef} isFirstPerson={false} onToggleFirstPerson={onToggle} />);

    fireEvent.click(screen.getByTitle(/First Person Walk/));
    expect(onToggle).toHaveBeenCalled();
  });

  it('disables controls in first person mode', () => {
    render(<ViewerControls cameraControlsRef={mockRef} isFirstPerson={true} />);

    expect(screen.getByTitle(/Isometric/)).toBeDisabled();
    expect(screen.getByTitle(/Zoom In/)).toBeDisabled();

    // Keyboard shortcuts should also be ignored
    fireEvent.keyDown(window, { key: '1' });
    expect(mockControls.setPreset).not.toHaveBeenCalled();
  });

  it('calls onToggleFullscreen when fullscreen button clicked', () => {
    const onFullscreen = jest.fn();
    render(<ViewerControls cameraControlsRef={mockRef} onToggleFullscreen={onFullscreen} />);

    fireEvent.click(screen.getByTitle(/Toggle Fullscreen/));
    expect(onFullscreen).toHaveBeenCalled();
  });

  it('renders help content', () => {
    render(<ViewerControls cameraControlsRef={mockRef} />);
    expect(screen.getByTestId('dialog-content')).toBeInTheDocument();
  });
});
