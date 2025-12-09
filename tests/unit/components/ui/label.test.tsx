import React from 'react';
import { render, screen } from '@testing-library/react';
import { Label } from '@/components/ui/label';

describe('Label component', () => {
  it('renders correctly', () => {
    render(<Label htmlFor="test-input">Test Label</Label>);
    const label = screen.getByText('Test Label');
    expect(label).toBeInTheDocument();
    expect(label).toHaveAttribute('for', 'test-input');
  });
});
