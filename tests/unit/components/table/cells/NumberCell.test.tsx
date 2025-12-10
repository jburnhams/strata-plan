import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { NumberCell } from '../../../../../src/components/table/cells/NumberCell';

describe('NumberCell', () => {
  it('renders value with unit', () => {
    const onCommit = jest.fn();
    render(<NumberCell value={10} unit="m" onCommit={onCommit} />);
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('m')).toBeInTheDocument();
  });

  it('switches to edit mode on click', () => {
    const onCommit = jest.fn();
    render(<NumberCell value={10} onCommit={onCommit} />);
    fireEvent.click(screen.getByText('10'));
    // input type="number" does not have implicit role="textbox" in some queries or role="spinbutton"
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

    // New: Error is in tooltip (title attribute) of ValidationIndicator
    const indicator = screen.getByTitle('Value must be between 0 and 20');
    expect(indicator).toBeInTheDocument();

    fireEvent.blur(input);
    expect(onCommit).not.toHaveBeenCalled();
    // Should revert to original value display
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('displays external validation state', () => {
    const onCommit = jest.fn();
    render(
      <NumberCell
        value={10}
        onCommit={onCommit}
        validationState="warning"
        validationMessage="Warning message"
      />
    );

    const indicator = screen.getByTitle('Warning message');
    expect(indicator).toBeInTheDocument();
  });

  it('internal error overrides external validation state', () => {
    const onCommit = jest.fn();
    render(
      <NumberCell
        value={10}
        min={0}
        max={20}
        onCommit={onCommit}
        validationState="warning"
        validationMessage="Warning message"
      />
    );

    // Initially shows warning
    expect(screen.getByTitle('Warning message')).toBeInTheDocument();

    // Edit and create internal error
    fireEvent.click(screen.getByText('10'));
    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '25' } });

    // Now shows internal error
    expect(screen.queryByTitle('Warning message')).not.toBeInTheDocument();
    expect(screen.getByTitle('Value must be between 0 and 20')).toBeInTheDocument();
  });

  it('commits on Enter', () => {
    const onCommit = jest.fn();
    render(<NumberCell value={10} onCommit={onCommit} />);
    fireEvent.click(screen.getByText('10'));
    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '12' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onCommit).toHaveBeenCalledWith(12);
  });

  it('cancels on Escape', () => {
    const onCommit = jest.fn();
    render(<NumberCell value={10} onCommit={onCommit} />);
    fireEvent.click(screen.getByText('10'));
    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '12' } });
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(onCommit).not.toHaveBeenCalled();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('increments/decrements with arrow keys', () => {
      // Assuming step is default 0.1 or passed
      const onCommit = jest.fn();
      render(<NumberCell value={10} step={1} onCommit={onCommit} />);
      fireEvent.click(screen.getByText('10'));
      const input = screen.getByRole('spinbutton');

      fireEvent.keyDown(input, { key: 'ArrowUp' });
      expect(input).toHaveValue(11); // 10 + 1

      fireEvent.keyDown(input, { key: 'ArrowDown' });
      expect(input).toHaveValue(10); // 11 - 1
  });
});
