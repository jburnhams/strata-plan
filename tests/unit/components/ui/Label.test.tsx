import React from 'react';
import { render, screen } from '@testing-library/react';
import { Label } from '@/components/ui/label';
import '@testing-library/jest-dom';

describe('Label', () => {
  it('renders correctly', () => {
    render(<Label htmlFor="test">Label Text</Label>);
    const label = screen.getByText('Label Text');
    expect(label).toBeInTheDocument();
    expect(label).toHaveAttribute('for', 'test');
  });

  it('accepts ref', () => {
    const ref = React.createRef<HTMLLabelElement>();
    render(<Label ref={ref}>Label</Label>);
    expect(ref.current).toBeInstanceOf(HTMLLabelElement);
  });
});
