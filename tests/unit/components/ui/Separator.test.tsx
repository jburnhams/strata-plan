import React from 'react';
import { render } from '@testing-library/react';
import { Separator } from '@/components/ui/separator';
import '@testing-library/jest-dom';

describe('Separator', () => {
  it('renders correctly', () => {
    const { container } = render(<Separator />);
    const separator = container.firstChild;
    expect(separator).toHaveClass('shrink-0');
    expect(separator).toHaveClass('bg-border');
  });

  it('applies orientation classes', () => {
    const { container } = render(<Separator orientation="vertical" />);
    const separator = container.firstChild;
    expect(separator).toHaveClass('h-full');
    expect(separator).toHaveClass('w-[1px]');
  });
});
