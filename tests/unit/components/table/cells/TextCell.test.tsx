import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TextCell } from '../../../../../src/components/table/cells/TextCell';

describe('TextCell', () => {
  it('renders value initially', () => {
    const onCommit = jest.fn();
    render(<TextCell value="Test Value" onCommit={onCommit} />);
    expect(screen.getByText('Test Value')).toBeInTheDocument();
  });

  it('switches to edit mode on click', () => {
    const onCommit = jest.fn();
    render(<TextCell value="Test Value" onCommit={onCommit} />);
    fireEvent.click(screen.getByText('Test Value'));
    const input = screen.getByRole('textbox', { name: /edit text/i });
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('Test Value');
  });

  it('commits value on blur', () => {
    const onCommit = jest.fn();
    render(<TextCell value="Test Value" onCommit={onCommit} />);
    fireEvent.click(screen.getByText('Test Value'));
    const input = screen.getByRole('textbox', { name: /edit text/i });
    fireEvent.change(input, { target: { value: 'New Value' } });
    fireEvent.blur(input);
    expect(onCommit).toHaveBeenCalledWith('New Value');
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('commits value on Enter', () => {
    const onCommit = jest.fn();
    render(<TextCell value="Test Value" onCommit={onCommit} />);
    fireEvent.click(screen.getByText('Test Value'));
    const input = screen.getByRole('textbox', { name: /edit text/i });
    fireEvent.change(input, { target: { value: 'New Value' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onCommit).toHaveBeenCalledWith('New Value');
  });

  it('cancels on Escape', () => {
    const onCommit = jest.fn();
    render(<TextCell value="Test Value" onCommit={onCommit} />);
    fireEvent.click(screen.getByText('Test Value'));
    const input = screen.getByRole('textbox', { name: /edit text/i });
    fireEvent.change(input, { target: { value: 'New Value' } });
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(onCommit).not.toHaveBeenCalled();
    expect(screen.getByText('Test Value')).toBeInTheDocument();
  });

  it('displays validation state', () => {
    const onCommit = jest.fn();
    render(
      <TextCell
        value="Test"
        onCommit={onCommit}
        validationState="error"
        validationMessage="Error message"
      />
    );
    expect(screen.getByTitle('Error message')).toBeInTheDocument();
  });

  it('displays validation state in edit mode', () => {
    const onCommit = jest.fn();
    render(
      <TextCell
        value="Test"
        onCommit={onCommit}
        validationState="error"
        validationMessage="Error message"
      />
    );
    fireEvent.click(screen.getByText('Test'));
    expect(screen.getByRole('textbox', { name: /edit text/i })).toBeInTheDocument();
    expect(screen.getByTitle('Error message')).toBeInTheDocument();
  });
});
