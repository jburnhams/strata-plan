import { renderHook, act } from '@testing-library/react';
import { useBreakpoint } from '../../../src/hooks/useBreakpoint';
import { BREAKPOINTS } from '../../../src/styles/breakpoints';

describe('useBreakpoint', () => {
  const originalInnerWidth = window.innerWidth;

  beforeAll(() => {
    // Mock window.innerWidth
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
  });

  afterAll(() => {
    window.innerWidth = originalInnerWidth;
  });

  const setWindowWidth = (width: number) => {
    act(() => {
      window.innerWidth = width;
      window.dispatchEvent(new Event('resize'));
    });
  };

  it('should identify mobile devices correctly', () => {
    setWindowWidth(BREAKPOINTS.sm - 1); // < 640px
    const { result } = renderHook(() => useBreakpoint());

    expect(result.current.isMobile).toBe(true);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(false);
    expect(result.current.breakpoint).toBe('xs');

    setWindowWidth(BREAKPOINTS.sm); // 640px
    expect(result.current.isMobile).toBe(true);
    expect(result.current.breakpoint).toBe('sm');
  });

  it('should identify tablet devices correctly', () => {
    setWindowWidth(BREAKPOINTS.md); // 768px
    const { result } = renderHook(() => useBreakpoint());

    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(true);
    expect(result.current.isDesktop).toBe(false);
    expect(result.current.breakpoint).toBe('md');
  });

  it('should identify desktop devices correctly', () => {
    setWindowWidth(BREAKPOINTS.lg); // 1024px
    const { result } = renderHook(() => useBreakpoint());

    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(true);
    expect(result.current.breakpoint).toBe('lg');
  });

  it('should identify large desktop devices correctly', () => {
    setWindowWidth(BREAKPOINTS.xl); // 1280px
    const { result } = renderHook(() => useBreakpoint());
    expect(result.current.breakpoint).toBe('xl');

    setWindowWidth(BREAKPOINTS['2xl']); // 1536px
    expect(result.current.breakpoint).toBe('2xl');
  });
});
