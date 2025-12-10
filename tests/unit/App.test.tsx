import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../../src/App';

// Mock dependencies
jest.mock('../../src/components/layout/AppShell', () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => <div data-testid="app-shell">{children}</div>,
}));

jest.mock('../../src/components/table/RoomTable', () => ({
  RoomTable: () => <div data-testid="room-table">Room Table</div>,
}));

jest.mock('../../src/components/layout/ThemeProvider', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="theme-provider">{children}</div>,
}));

describe('App', () => {
  it('renders the application shell and room table', () => {
    render(<App />);

    expect(screen.getByTestId('app-shell')).toBeInTheDocument();
    expect(screen.getByTestId('room-table')).toBeInTheDocument();
  });
});
