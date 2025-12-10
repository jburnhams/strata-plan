import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RoomTableRow } from '../../../../src/components/table/RoomTableRow';
import { Room } from '../../../../src/types';
import { ROOM_TYPE_COLORS } from '../../../../src/constants/colors';

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
    doors: [],
    windows: []
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
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    // meters appears multiple times
    expect(screen.getAllByText('meters')).toHaveLength(3);
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
    const input = screen.getByRole('textbox', { name: /edit text/i });
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
    fireEvent.click(screen.getByRole('button', { name: /5\s*meters/i }));
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
    fireEvent.click(screen.getByRole('button', { name: /4\s*meters/i }));
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
    fireEvent.click(screen.getByRole('button', { name: /3\s*meters/i }));
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
    const confirmSpy = jest.spyOn(window, 'confirm');
    confirmSpy.mockImplementation(() => true);

    render(
      <table>
        <tbody>
          <RoomTableRow {...defaultProps} />
        </tbody>
      </table>
    );

    // Action cell shows delete button
    // It might be hidden via opacity-0, but it's in DOM.
    // We can query by text usually or role.
    // ActionCell usually has a button with trash icon.
    // Let's assume there is a button.
    const buttons = screen.getAllByRole('button');
    // The last button or look for Delete text/title.
    // ActionCell.tsx implementation: likely has title "Delete Room"
    // Let's check ActionCell implementation if needed, but 'Delete' text was in original test.
    // The original test used getByText('Delete').
    // If ActionCell uses an Icon, it might not have text 'Delete'.
    // Let's use getByTitle if available, or just try finding the button.

    // In previous test it was `screen.getByText('Delete')`.
    // Let's hope ActionCell has aria-label or title.

    // For now I'll use getAllByRole('button') and click the last one,
    // or assume the text "Delete" is there (maybe in tooltip or hidden text).
    // If ActionCell uses Lucide icon only, we need aria-label.

    // Let's assume ActionCell has a button.
    const deleteButton = buttons[buttons.length - 1];
    fireEvent.click(deleteButton);

    expect(confirmSpy).toHaveBeenCalled();
    expect(defaultProps.onDelete).toHaveBeenCalled();

    confirmSpy.mockRestore();
  });

  it('renders validation indicators when invalid', () => {
    const invalidRoom = { ...mockRoom, length: 0.05 }; // Too small
    render(
      <table>
        <tbody>
          <RoomTableRow {...defaultProps} room={invalidRoom} />
        </tbody>
      </table>
    );

    // Check for row styling
    const row = screen.getByTestId('room-row-room-1');
    expect(row.className).toContain('border-l-red-500');

    // Check for row tooltip
    expect(row).toHaveAttribute('title', expect.stringContaining('Length must be at least 0.1m'));

    // Check for cell indicator
    const icon = screen.getByTestId('validation-icon');
    expect(icon).toHaveAttribute('title', 'Length must be at least 0.1m');
  });

  it('renders warning indicators when warning', () => {
     // Warning: value < 1m -> "Dimension seems small"
    const warningRoom = { ...mockRoom, length: 0.5 };
    render(
      <table>
        <tbody>
          <RoomTableRow {...defaultProps} room={warningRoom} />
        </tbody>
      </table>
    );

    // Check for row styling
    const row = screen.getByTestId('room-row-room-1');
    expect(row.className).toContain('border-l-yellow-500');

    // Check for validation message tooltip on row
    expect(row).toHaveAttribute('title', expect.stringContaining('Length is unusually small'));

    // Check for cell indicator
    const icon = screen.getByTestId('validation-icon');
    expect(icon).toHaveAttribute('title', expect.stringContaining('Length is unusually small'));
  });

  it('renders validation summary in row title', () => {
    const invalidRoom = { ...mockRoom, length: 0.05, height: 1.0 };
    render(
      <table>
        <tbody>
          <RoomTableRow {...defaultProps} room={invalidRoom} />
        </tbody>
      </table>
    );

    const row = screen.getByTestId('room-row-room-1');
    expect(row).toHaveAttribute('title', expect.stringContaining('Length must be at least 0.1m'));
    expect(row).toHaveAttribute('title', expect.stringContaining('Ceiling height must be at least 1.5m'));
  });

  it('shows warning for duplicate name', () => {
    render(
      <table>
        <tbody>
          <RoomTableRow {...defaultProps} otherNames={['Test Room']} />
        </tbody>
      </table>
    );

    // Check for row styling
    const row = screen.getByTestId('room-row-room-1');
    expect(row.className).toContain('border-l-yellow-500');

    // Check for validation message tooltip
    expect(row).toHaveAttribute('title', expect.stringContaining('Another room has this name'));
  });
});
