import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { ThemeProvider } from '../../../../src/components/layout/ThemeProvider';
import { useTheme } from '../../../../src/hooks/useTheme';
import { useUIStore } from '../../../../src/stores/uiStore';

// Mock matchMedia
const mockMatchMedia = (matches: boolean, useModern = true) => {
  return jest.fn().mockImplementation((query) => {
    const listeners: any[] = [];
    return {
      matches,
      media: query,
      onchange: null,
      addListener: useModern ? undefined : jest.fn((cb) => listeners.push(cb)), // Deprecated
      removeListener: useModern ? undefined : jest.fn(), // Deprecated
      addEventListener: useModern ? jest.fn((type, cb) => { if(type === 'change') listeners.push(cb) }) : undefined,
      removeEventListener: useModern ? jest.fn() : undefined,
      dispatchEvent: jest.fn(),
      // Helper to trigger change
      _triggerChange: (e: any) => listeners.forEach(cb => cb(e))
    };
  });
};

// Component to test the hook
const TestComponent = () => {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  return (
    <div>
      <div data-testid="theme">{theme}</div>
      <div data-testid="resolvedTheme">{resolvedTheme}</div>
      <button onClick={() => setTheme('dark')}>Set Dark</button>
      <button onClick={() => setTheme('light')}>Set Light</button>
      <button onClick={() => setTheme('system')}>Set System</button>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
};

describe('ThemeProvider', () => {
  beforeEach(() => {
    // Reset store
    useUIStore.setState({ theme: 'system' });
    // Reset DOM class
    document.documentElement.classList.remove('light', 'dark');
    // Default system preference to light
    window.matchMedia = mockMatchMedia(false);
  });

  it('provides default theme from store (system)', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    expect(screen.getByTestId('theme').textContent).toBe('system');
  });

  it('resolves system theme to light when preference is light', () => {
    window.matchMedia = mockMatchMedia(false); // Prefer light
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    expect(screen.getByTestId('resolvedTheme').textContent).toBe('light');
    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('resolves system theme to dark when preference is dark', () => {
    window.matchMedia = mockMatchMedia(true); // Prefer dark
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    expect(screen.getByTestId('resolvedTheme').textContent).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.classList.contains('light')).toBe(false);
  });

  it('updates resolved theme when specific theme is set', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    act(() => {
      screen.getByText('Set Dark').click();
    });

    expect(screen.getByTestId('theme').textContent).toBe('dark');
    expect(screen.getByTestId('resolvedTheme').textContent).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('toggles themes correctly', () => {
    // Initial: system (resolves to light in this mock)
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // system -> light
    act(() => {
      screen.getByText('Toggle Theme').click();
    });
    expect(screen.getByTestId('theme').textContent).toBe('light');

    // light -> dark
    act(() => {
      screen.getByText('Toggle Theme').click();
    });
    expect(screen.getByTestId('theme').textContent).toBe('dark');

    // dark -> system
    act(() => {
      screen.getByText('Toggle Theme').click();
    });
    expect(screen.getByTestId('theme').textContent).toBe('system');
  });

  it('responds to system preference changes when in system mode', () => {
    const mock = mockMatchMedia(false); // Start light
    window.matchMedia = mock;

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('resolvedTheme').textContent).toBe('light');

    // Simulate system change to dark
    act(() => {
       const mql = mock.mock.results[0].value;
       mql._triggerChange({ matches: true });
    });

    expect(screen.getByTestId('resolvedTheme').textContent).toBe('dark');
  });

  it('uses legacy addListener if addEventListener is not present', () => {
     const mock = mockMatchMedia(false, false); // Use legacy
     window.matchMedia = mock;

     render(
        <ThemeProvider>
            <TestComponent />
        </ThemeProvider>
     );

     const mql = mock.mock.results[0].value;
     expect(mql.addListener).toHaveBeenCalled();
     expect(mql.addEventListener).toBeUndefined();

     // Test cleanup
     // We need to unmount to verify removeListener is called
     // render returns unmount
  });

  it('cleans up legacy listeners on unmount', () => {
     const mock = mockMatchMedia(false, false); // Use legacy
     window.matchMedia = mock;

     const { unmount } = render(
        <ThemeProvider>
            <TestComponent />
        </ThemeProvider>
     );

     const mql = mock.mock.results[0].value;
     unmount();

     expect(mql.removeListener).toHaveBeenCalled();
  });
});
