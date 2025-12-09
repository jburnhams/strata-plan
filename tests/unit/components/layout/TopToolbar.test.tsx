import React from 'react';
import { render, screen } from '@testing-library/react';
import { TopToolbar } from '@/components/layout/TopToolbar';
import '@testing-library/jest-dom';

// Mock ThemeToggle to avoid testing its internal logic here
jest.mock('@/components/layout/ThemeToggle', () => ({
  ThemeToggle: () => <div data-testid="theme-toggle" />,
}));

describe('TopToolbar', () => {
  it('renders correctly', () => {
    render(<TopToolbar />);
    expect(screen.getByText('StrataPlan')).toBeInTheDocument();
    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
  });
});
