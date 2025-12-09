import React from 'react';
import { render, screen } from '@testing-library/react';
import { Input } from '@/components/ui/input';
import '@testing-library/jest-dom';

describe('Input', () => {
  it('renders correctly', () => {
    render(<Input placeholder="Type here" />);
    const input = screen.getByPlaceholderText('Type here');
    expect(input).toBeInTheDocument();
  });

  it('accepts ref', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Input ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});
