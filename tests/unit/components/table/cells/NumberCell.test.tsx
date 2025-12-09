import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { NumberCell } from '../../../../../src/components/table/cells/NumberCell';

describe('NumberCell', () => {
  it('renders value with unit', () => {
    const onCommit = jest.fn();
    render(<NumberCell value={10} unit="m" onCommit={onCommit} />);
    expect(screen.getByText('10 m')).toBeInTheDocument();
  });

  it('switches to edit mode on click', () => {
    const onCommit = jest.fn();
    render(<NumberCell value={10} onCommit={onCommit} />);
    fireEvent.click(screen.getByText('10'));
    // input type="number" does not have implicit role="textbox" in some queries or role="spinbutton"
    // best to use getByDisplayValue or similar if role is tricky, but here spinbutton is standard for number
    const input = screen.getByRole('spinbutton');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue(10);
  });

  it('commits value on blur', () => {
    const onCommit = jest.fn();
    render(<NumberCell value={10} onCommit={onCommit} />);
    fireEvent.click(screen.getByText('10'));
    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '15' } });
    fireEvent.blur(input);
    expect(onCommit).toHaveBeenCalledWith(15);
  });

  it('shows error and does not commit if out of range', () => {
    const onCommit = jest.fn();
    render(<NumberCell value={10} min={0} max={20} onCommit={onCommit} />);
    fireEvent.click(screen.getByText('10'));
    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '25' } });

    expect(screen.getByText('Value must be between 0 and 20')).toBeInTheDocument();

    fireEvent.blur(input);
    expect(onCommit).not.toHaveBeenCalled();
    // Should revert to original value display
    expect(screen.getByText('10')).toBeInTheDocument();
  });
});
