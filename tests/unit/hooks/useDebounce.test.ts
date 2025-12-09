import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../../../src/hooks/useDebounce';

describe('useDebounce', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));
    expect(result.current).toBe('initial');
  });

  it('should debounce value updates', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    // Update value
    rerender({ value: 'updated', delay: 500 });

    // Should not update immediately
    expect(result.current).toBe('initial');

    // Fast-forward time partially
    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(result.current).toBe('initial');

    // Fast-forward rest of time
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(result.current).toBe('updated');
  });

  it('should reset timer on subsequent updates', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    // Update value
    rerender({ value: 'update1', delay: 500 });

    act(() => {
      jest.advanceTimersByTime(200);
    });

    // Update value again before timer fires
    rerender({ value: 'update2', delay: 500 });

    act(() => {
      jest.advanceTimersByTime(300);
    });
    // Total 500ms passed, but timer was reset at 200ms
    // So only 300ms passed for the second update (need 500ms)
    expect(result.current).toBe('initial');

    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(result.current).toBe('update2');
  });
});
