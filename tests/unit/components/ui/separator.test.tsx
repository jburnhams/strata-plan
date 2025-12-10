import React from 'react';
import { render, screen } from '@testing-library/react';
import { Separator } from '../../../../src/components/ui/separator';

describe('Separator', () => {
  it('renders horizontal separator', () => {
    render(<Separator data-testid="sep" />);
    const sep = screen.getByTestId('sep');
    expect(sep).toBeInTheDocument();
    expect(sep).toHaveClass('h-[1px]');
  });

  it('renders vertical separator', () => {
    render(<Separator orientation="vertical" data-testid="sep-v" />);
    const sep = screen.getByTestId('sep-v');
    expect(sep).toBeInTheDocument();
    expect(sep).toHaveClass('h-full');
  });
});
