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
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('Test Value');
  });

  it('commits value on blur', () => {
    const onCommit = jest.fn();
    render(<TextCell value="Test Value" onCommit={onCommit} />);
    fireEvent.click(screen.getByText('Test Value'));
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'New Value' } });
    fireEvent.blur(input);
    expect(onCommit).toHaveBeenCalledWith('New Value');
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('commits value on Enter', () => {
    const onCommit = jest.fn();
    render(<TextCell value="Test Value" onCommit={onCommit} />);
    fireEvent.click(screen.getByText('Test Value'));
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'New Value' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    // Enter triggers blur typically in our implementation via blur() call,
    // but in test environment we might need to simulate blur or check if blur called.
    // Our implementation: handleKeyDown calls inputRef.current.blur()
    expect(onCommit).toHaveBeenCalledWith('New Value');
  });

  it('cancels on Escape', () => {
    const onCommit = jest.fn();
    render(<TextCell value="Test Value" onCommit={onCommit} />);
    fireEvent.click(screen.getByText('Test Value'));
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'New Value' } });
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(onCommit).not.toHaveBeenCalled();
    expect(screen.getByText('Test Value')).toBeInTheDocument();
  });
});
