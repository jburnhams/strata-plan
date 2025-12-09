import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SelectCell } from '../../../../../src/components/table/cells/SelectCell';
import { RoomType } from '../../../../../src/types';

describe('SelectCell', () => {
  const options: RoomType[] = ['bedroom', 'kitchen', 'bathroom'];

  it('renders value initially', () => {
    const onCommit = jest.fn();
    render(<SelectCell value="bedroom" options={options} onCommit={onCommit} />);
    expect(screen.getByText('bedroom')).toBeInTheDocument();
  });

  it('switches to edit mode on click', () => {
    const onCommit = jest.fn();
    render(<SelectCell value="bedroom" options={options} onCommit={onCommit} />);
    fireEvent.click(screen.getByText('bedroom'));
    const select = screen.getByRole('combobox'); // select element is combobox
    expect(select).toBeInTheDocument();
    expect(select).toHaveValue('bedroom');
  });

  it('commits value on change', () => {
    const onCommit = jest.fn();
    render(<SelectCell value="bedroom" options={options} onCommit={onCommit} />);
    fireEvent.click(screen.getByText('bedroom'));
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'kitchen' } });
    expect(onCommit).toHaveBeenCalledWith('kitchen');
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('navigable with arrow keys (opens on Enter)', () => {
    const onCommit = jest.fn();
    render(<SelectCell value="bedroom" options={options} onCommit={onCommit} />);
    const cell = screen.getByText('bedroom').closest('div');
    if (cell) {
        fireEvent.keyDown(cell, { key: 'Enter' });
    }
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });
});
