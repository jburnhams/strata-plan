import React from 'react';
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';
import '@testing-library/jest-dom';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
  });

  it('applies default classes', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button');
    // Check for some tailwind classes that shadcn button uses
    expect(button.className).toContain('inline-flex');
    expect(button.className).toContain('items-center');
  });

  it('applies variant classes', () => {
    render(<Button variant="destructive">Delete</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('bg-destructive');
  });
});
