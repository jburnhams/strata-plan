import React from 'react';
import { render, act } from '@testing-library/react';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { useUIStore } from '@/stores/uiStore';
import '@testing-library/jest-dom';

describe('ThemeProvider', () => {
  beforeEach(() => {
    useUIStore.setState({ theme: 'light' });
    document.documentElement.className = '';
  });

  it('applies light theme class', () => {
    render(<ThemeProvider>Test</ThemeProvider>);
    expect(document.documentElement.classList.contains('light')).toBe(true);
  });

  it('applies dark theme class', () => {
    act(() => {
      useUIStore.setState({ theme: 'dark' });
    });
    render(<ThemeProvider>Test</ThemeProvider>);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});
