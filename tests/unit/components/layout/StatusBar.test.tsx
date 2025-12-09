import React from 'react';
import { render, screen } from '@testing-library/react';
import { StatusBar } from '@/components/layout/StatusBar';
import '@testing-library/jest-dom';

describe('StatusBar', () => {
  it('renders correctly', () => {
    render(<StatusBar />);
    expect(screen.getByText('Ready')).toBeInTheDocument();
  });
});
