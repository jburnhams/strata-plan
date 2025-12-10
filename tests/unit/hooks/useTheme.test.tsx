import React from 'react';
import { renderHook } from '@testing-library/react';
import { useTheme } from '../../../src/hooks/useTheme';

describe('useTheme', () => {
  // Suppress console.error for the expected error
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  it('throws error when used outside of ThemeProvider', () => {
    expect(() => {
      renderHook(() => useTheme());
    }).toThrow('useTheme must be used within a ThemeProvider');
  });
});
