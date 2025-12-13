import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import App from '../../src/App';
import { useFloorplanStore } from '../../src/stores/floorplanStore';
import { useUIStore } from '../../src/stores/uiStore';

// Mocks
jest.mock('@napi-rs/canvas', () => {
  return {
    createCanvas: (w: number, h: number) => {
      return {
          getContext: () => ({
              fillRect: () => {},
              measureText: () => ({ width: 0 }),
          }),
          width: w,
          height: h,
          toDataURL: () => 'data:image/png;base64,',
      };
    }
  };
});

// Mock Canvas2D component to verify it receives props/rendering
jest.mock('../../src/components/editor/Canvas2D', () => ({
  Canvas2D: () => <div data-testid="desktop-canvas">Desktop Canvas</div>,
}));

// Mock TouchCanvas component
jest.mock('../../src/components/editor/TouchCanvas', () => ({
  TouchCanvas: () => <div data-testid="touch-canvas">Touch Canvas</div>,
}));

// Mock ResizeObserver
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = ResizeObserver;

// Mock SettingsSync to avoid IndexedDB errors
jest.mock('../../src/components/layout/SettingsSync', () => ({
  SettingsSync: () => null,
}));

// Mock useNavigation to force Editor view
jest.mock('../../src/hooks/useNavigation', () => ({
  useNavigation: () => ({
    currentView: 'editor',
    navigateTo: jest.fn(),
    createProject: jest.fn(),
    openProject: jest.fn(),
    closeProject: jest.fn(),
  }),
}));

// Robust mock for useBreakpoint
const mockUseBreakpointHook = jest.fn();
jest.mock('../../src/hooks/useBreakpoint', () => ({
  useBreakpoint: () => mockUseBreakpointHook(),
}));

// Mock crypto if needed
if (!global.crypto) {
    Object.defineProperty(global, 'crypto', {
        value: {
            randomUUID: () => '1234-5678',
        }
    });
}

describe('Mobile Integration', () => {
  beforeEach(() => {
    // Reset stores
    useFloorplanStore.getState().clearFloorplan();
    useFloorplanStore.getState().createFloorplan('Test Plan', 'meters'); // Ensure a plan exists
    useUIStore.setState({ mode: 'canvas' });

    mockUseBreakpointHook.mockReset();
    // Default to desktop to prevent undefined crashes if not set
    mockUseBreakpointHook.mockReturnValue({
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        breakpoint: 'xl'
    });
  });

  it('renders Desktop layout by default (large screen)', async () => {
    mockUseBreakpointHook.mockReturnValue({
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      breakpoint: 'xl'
    });

    render(<App />);

    // Should see Desktop Canvas
    expect(screen.getByTestId('desktop-canvas')).toBeInTheDocument();
    expect(screen.queryByTestId('touch-canvas')).not.toBeInTheDocument();
  });

  it('switches to Mobile layout and TouchCanvas on small screens', async () => {
    mockUseBreakpointHook.mockReturnValue({
      isMobile: true,
      isTablet: false,
      isDesktop: false,
      breakpoint: 'sm'
    });

    render(<App />);

    // Should see Touch Canvas
    await waitFor(() => {
        expect(screen.getByTestId('touch-canvas')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('desktop-canvas')).not.toBeInTheDocument();
  });

  it('renders MobileRoomTable on mobile when in table mode', async () => {
    mockUseBreakpointHook.mockReturnValue({
      isMobile: true,
      isTablet: false,
      isDesktop: false,
      breakpoint: 'sm'
    });

    render(<App />);

    // Switch to table mode via UI or direct state if needed
    const tableSpan = screen.queryByText('Table');
    if (tableSpan) {
        const tableButton = tableSpan.closest('button');
        if (tableButton) {
            fireEvent.click(tableButton);
        }
    } else {
        // Fallback if UI not rendered yet
        act(() => { useUIStore.setState({ mode: 'table' }) });
    }

    // MobileRoomTable usually renders "Rooms (0)" or "No rooms added yet"
    await waitFor(() => {
        expect(screen.getByText('No rooms added yet.')).toBeInTheDocument();
    });

    expect(screen.getByText('Add Room')).toBeInTheDocument();
  });

  it('renders TabletLayout on medium screens', async () => {
    mockUseBreakpointHook.mockReturnValue({
      isMobile: false,
      isTablet: true,
      isDesktop: false,
      breakpoint: 'lg'
    });

    render(<App />);

    // Tablet uses Canvas2D (Desktop version) currently
    await waitFor(() => {
        expect(screen.getByTestId('desktop-canvas')).toBeInTheDocument();
    });
  });
});
