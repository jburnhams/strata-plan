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

// Mock crypto if needed
if (!global.crypto) {
    Object.defineProperty(global, 'crypto', {
        value: {
            randomUUID: () => '1234-5678',
        }
    });
}

describe('Mobile Integration', () => {
  const originalInnerWidth = window.innerWidth;

  beforeEach(() => {
    // Reset stores
    useFloorplanStore.getState().clearFloorplan();
    useUIStore.setState({ mode: 'canvas' });

    // Reset window width to original
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
  });

  // Robust viewport setter
  const setWindowWidth = (width: number) => {
    act(() => {
      // Use Object.defineProperty to ensure the property is set even if JSDOM/Environment tries to protect it
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: width,
      });

      // Also update matchMedia mock to consistent state (optional but good practice)
      window.matchMedia = jest.fn().mockImplementation((query) => {
        return {
          matches: false, // Simplification: we rely on useBreakpoint (innerWidth), but libraries might check this
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        };
      });

      window.dispatchEvent(new Event('resize'));
    });
  };

  const navigateToEditor = async () => {
    // Check if we are on landing page
    const demoButton = screen.queryByText('Try Demo');
    if (demoButton) {
      fireEvent.click(demoButton);

      // Wait for navigation to complete (Try Demo should disappear)
      await waitFor(() => {
        expect(screen.queryByText('Try Demo')).not.toBeInTheDocument();
      }, { timeout: 2000 });
    }
    // Else assume we are already in editor (store persisted state)
  };

  it('renders Desktop layout by default (large screen)', async () => {
    setWindowWidth(1280); // Desktop size
    render(<App />);

    // Navigate to editor
    await navigateToEditor();

    // Should see Desktop Canvas
    await waitFor(() => {
        expect(screen.getByTestId('desktop-canvas')).toBeInTheDocument();
    }, { timeout: 3000 });

    expect(screen.queryByTestId('touch-canvas')).not.toBeInTheDocument();
  });

  it('switches to Mobile layout and TouchCanvas on small screens', async () => {
    setWindowWidth(375); // Mobile size
    render(<App />);

    await navigateToEditor();

    // Should see Touch Canvas
    await waitFor(() => {
        expect(screen.getByTestId('touch-canvas')).toBeInTheDocument();
    }, { timeout: 3000 });

    expect(screen.queryByTestId('desktop-canvas')).not.toBeInTheDocument();
  });

  it('renders MobileRoomTable on mobile when in table mode', async () => {
    setWindowWidth(375);

    // Manually create floorplan to ensure state is populated
    useFloorplanStore.getState().createFloorplan('Test Plan', 'meters');

    render(<App />);
    await navigateToEditor();

    // Ensure we are in table mode
    const tableSpan = screen.queryByText('Table');
    if (tableSpan) {
        const tableButton = tableSpan.closest('button');
        if (tableButton) {
            fireEvent.click(tableButton);
        }
    } else {
        act(() => { useUIStore.setState({ mode: 'table' }) });
    }

    // MobileRoomTable usually renders "Rooms (0)" or "No rooms added yet"
    await waitFor(() => {
        expect(screen.getByText('No rooms added yet.')).toBeInTheDocument();
    }, { timeout: 3000 });

    expect(screen.getByText('Add Room')).toBeInTheDocument();
  });

  it('renders TabletLayout on medium screens', async () => {
    setWindowWidth(800); // Tablet size
    render(<App />);
    await navigateToEditor();

    // Tablet uses Canvas2D (Desktop version) currently
    await waitFor(() => {
        expect(screen.getByTestId('desktop-canvas')).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});
