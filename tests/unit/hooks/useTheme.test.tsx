import { renderHook, act } from '@testing-library/react';
import { useTheme } from '@/hooks/useTheme';
import { useUIStore } from '@/stores/uiStore';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

describe('useTheme Hook', () => {
  const mockMatchMedia = (matches: boolean) => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  };

  beforeEach(() => {
    useUIStore.getState().setTheme('system');
    mockMatchMedia(false); // Default to light mode preference
  });

  it('should return default theme', () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('system');
    expect(result.current.resolvedTheme).toBe('light');
  });

  it('should resolve system dark theme', () => {
    mockMatchMedia(true); // Prefer dark
    const { result } = renderHook(() => useTheme());
    expect(result.current.resolvedTheme).toBe('dark');
  });

  it('should change theme', () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.setTheme('dark');
    });

    expect(result.current.theme).toBe('dark');
    expect(result.current.resolvedTheme).toBe('dark');
  });

  it('should toggle theme', () => {
    const { result } = renderHook(() => useTheme());

    // Initial: system (light)
    expect(result.current.resolvedTheme).toBe('light');

    act(() => {
      result.current.toggleTheme();
    });

    // Should become explicit dark
    expect(result.current.theme).toBe('dark');
    expect(result.current.resolvedTheme).toBe('dark');

    act(() => {
        result.current.toggleTheme();
    });

    // Should become explicit light
    expect(result.current.theme).toBe('light');
    expect(result.current.resolvedTheme).toBe('light');
  });
});
