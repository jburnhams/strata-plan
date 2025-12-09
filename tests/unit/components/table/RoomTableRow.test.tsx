import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RoomTableRow } from '../../../../src/components/table/RoomTableRow';
import { Room } from '../../../../src/types';
import { ROOM_TYPE_COLORS } from '../../../../src/constants/colors';

// Mock child components if needed, or rely on them (integration style)
// Since we have units tests for cells, relying on them is fine for "unit" test of Row,
// as long as we test the wiring.

describe('RoomTableRow', () => {
  const mockRoom: Room = {
    id: 'room-1',
    name: 'Test Room',
    length: 5,
    width: 4,
    height: 3,
    type: 'bedroom',
    position: { x: 0, z: 0 },
    rotation: 0,
  };

  const defaultProps = {
    room: mockRoom,
    isSelected: false,
    onSelect: jest.fn(),
    onUpdate: jest.fn(),
    onDelete: jest.fn(),
    units: 'meters' as const,
  };

  it('renders all cells with correct values', () => {
    render(
      <table>
        <tbody>
          <RoomTableRow {...defaultProps} />
        </tbody>
      </table>
    );

    expect(screen.getByText('Test Room')).toBeInTheDocument();
    expect(screen.getByText('5 meters')).toBeInTheDocument();
    expect(screen.getByText('4 meters')).toBeInTheDocument();
    expect(screen.getByText('3 meters')).toBeInTheDocument();
    expect(screen.getByText('bedroom')).toBeInTheDocument();
    // Area 5 * 4 = 20
    expect(screen.getByText('20.0 m²')).toBeInTheDocument();
  });

  it('click selects row', () => {
    render(
      <table>
        <tbody>
          <RoomTableRow {...defaultProps} />
        </tbody>
      </table>
    );

    fireEvent.click(screen.getByTestId('room-row-room-1'));
    expect(defaultProps.onSelect).toHaveBeenCalled();
  });

  it('highlights when selected', () => {
    render(
      <table>
        <tbody>
          <RoomTableRow {...defaultProps} isSelected={true} />
        </tbody>
      </table>
    );

    const row = screen.getByTestId('room-row-room-1');
    expect(row.className).toContain('bg-blue-50');
  });

  it('calls onUpdate when cell changes', () => {
    render(
      <table>
        <tbody>
          <RoomTableRow {...defaultProps} />
        </tbody>
      </table>
    );

    fireEvent.click(screen.getByText('Test Room'));
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'New Name' } });
    fireEvent.blur(input);

    expect(defaultProps.onUpdate).toHaveBeenCalledWith({ name: 'New Name' });
  });

  it('calls onUpdate when length changes', () => {
    render(
      <table>
        <tbody>
          <RoomTableRow {...defaultProps} />
        </tbody>
      </table>
    );

    // Click on length cell (value is 5)
    fireEvent.click(screen.getByText('5 meters'));
    const input = screen.getByLabelText('Edit number');
    fireEvent.change(input, { target: { value: '6' } });
    fireEvent.blur(input);

    expect(defaultProps.onUpdate).toHaveBeenCalledWith({ length: 6 });
  });

  it('calls onUpdate when width changes', () => {
    render(
      <table>
        <tbody>
          <RoomTableRow {...defaultProps} />
        </tbody>
      </table>
    );

    // Click on width cell (value is 4)
    fireEvent.click(screen.getByText('4 meters'));
    const input = screen.getByLabelText('Edit number');
    fireEvent.change(input, { target: { value: '4.5' } });
    fireEvent.blur(input);

    expect(defaultProps.onUpdate).toHaveBeenCalledWith({ width: 4.5 });
  });

  it('calls onUpdate when height changes', () => {
    render(
      <table>
        <tbody>
          <RoomTableRow {...defaultProps} />
        </tbody>
      </table>
    );

    // Click on height cell (value is 3)
    fireEvent.click(screen.getByText('3 meters'));
    const input = screen.getByLabelText('Edit number');
    fireEvent.change(input, { target: { value: '2.5' } });
    fireEvent.blur(input);

    expect(defaultProps.onUpdate).toHaveBeenCalledWith({ height: 2.5 });
  });

  it('calls onUpdate when type changes', () => {
    render(
      <table>
        <tbody>
          <RoomTableRow {...defaultProps} />
        </tbody>
      </table>
    );

    // Click on type cell (value is bedroom)
    // Note: SelectCell renders text "bedroom" which matches value
    const cell = screen.getAllByText('bedroom').find(el => el.tagName === 'DIV' || el.parentElement?.tagName === 'DIV');
    if (!cell) throw new Error('Could not find type cell');

    fireEvent.click(cell);
    const select = screen.getByLabelText('Select room type');
    fireEvent.change(select, { target: { value: 'kitchen' } });
    // SelectCell commits on change

    expect(defaultProps.onUpdate).toHaveBeenCalledWith({ type: 'kitchen' });
  });

  it('calls onDelete when delete button clicked (and confirmed)', () => {
    // Mock window.confirm
    const confirmSpy = jest.spyOn(window, 'confirm');
    confirmSpy.mockImplementation(() => true);

    render(
      <table>
        <tbody>
          <RoomTableRow {...defaultProps} />
        </tbody>
      </table>
    );

    fireEvent.click(screen.getByText('Delete'));
    expect(confirmSpy).toHaveBeenCalled();
    expect(defaultProps.onDelete).toHaveBeenCalled();

    confirmSpy.mockRestore();
  });
});
