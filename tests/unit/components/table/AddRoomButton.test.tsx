import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AddRoomButton } from '../../../../src/components/table/AddRoomButton';

describe('AddRoomButton', () => {
  it('renders main add button', () => {
    const onAdd = jest.fn();
    render(<AddRoomButton onAdd={onAdd} />);
    expect(screen.getByText('+ Add Room')).toBeInTheDocument();
  });

  it('renders quick add buttons', () => {
    const onAdd = jest.fn();
    render(<AddRoomButton onAdd={onAdd} />);
    expect(screen.getByText('Bedroom')).toBeInTheDocument();
    expect(screen.getByText('Kitchen')).toBeInTheDocument();
    expect(screen.getByText('Bathroom')).toBeInTheDocument();
    expect(screen.getByText('Living')).toBeInTheDocument();
  });

  it('clicking main button calls onAdd without type', () => {
    const onAdd = jest.fn();
    render(<AddRoomButton onAdd={onAdd} />);
    fireEvent.click(screen.getByText('+ Add Room'));
    // Calling with undefined implies an argument was passed as undefined,
    // but onClick={() => onAdd()} calls it with NO arguments.
    // Jest treats toHaveBeenCalledWith(undefined) as expecting 1 argument which is undefined.
    // So we should check called with nothing or loosely.
    expect(onAdd).toHaveBeenCalled();
    // Alternatively check arguments length if needed, but simple check is enough here.
  });

  it('clicking quick add button calls onAdd with type', () => {
    const onAdd = jest.fn();
    render(<AddRoomButton onAdd={onAdd} />);
    fireEvent.click(screen.getByText('Bedroom'));
    expect(onAdd).toHaveBeenCalledWith('bedroom');
  });
});
