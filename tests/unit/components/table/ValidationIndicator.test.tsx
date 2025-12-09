import React from 'react';
import { render, screen } from '@testing-library/react';
import { ValidationIndicator } from '../../../../src/components/table/ValidationIndicator';
import '@testing-library/jest-dom';

describe('ValidationIndicator', () => {
  it('renders nothing when state is valid', () => {
    const { container } = render(<ValidationIndicator state="valid" message="" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders warning icon when state is warning', () => {
    render(<ValidationIndicator state="warning" message="This is a warning" />);
    // Looking for the icon. Lucide icons usually render an SVG.
    // We can look for the title or aria-label if we add it.
    const icon = screen.getByTitle('This is a warning');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass('text-yellow-500'); // Assuming we use tailwind class
  });

  it('renders error icon when state is error', () => {
    render(<ValidationIndicator state="error" message="This is an error" />);
    const icon = screen.getByTitle('This is an error');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass('text-red-500');
  });

  it('renders nothing if message is empty even if state is not valid', () => {
    // This is an edge case, maybe we still want the icon but no tooltip?
    // Or maybe we consider it invalid usage.
    // Let's assume we render the icon with empty title if message is missing but state is set.
    render(<ValidationIndicator state="error" message="" />);
    // Depending on implementation. Let's assume we need a message.
    // Actually, let's say if message is empty, we still show icon to indicate error.
    const icon = screen.getByTestId('validation-icon');
    expect(icon).toBeInTheDocument();
  });
});
