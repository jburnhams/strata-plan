import React from 'react';
import { render, screen, fireEvent, waitFor, within, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RoomTable } from '../../src/components/table/RoomTable';
import { useFloorplanStore } from '../../src/stores/floorplanStore';
import { useUIStore } from '../../src/stores/uiStore';
import { Toaster } from '../../src/components/ui/toaster';

// Setup basic environment
describe('RoomTable Integration Workflow', () => {
  // Reset store before each test
  beforeEach(() => {
     jest.useFakeTimers();
     useFloorplanStore.setState({
        currentFloorplan: {
          id: 'integration-test-floorplan',
          name: 'Integration Test Floorplan',
          units: 'meters',
          rooms: [],
          walls: [],
          doors: [],
          windows: [],
          connections: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          version: '1.0.0',
        },
        selectedRoomId: null,
        isDirty: false,
      });

      useUIStore.setState({
        tableSortColumn: null,
        tableSortDirection: 'asc',
      });

      // Mock window.confirm
      jest.spyOn(window, 'confirm').mockImplementation(() => true);
  });

  afterEach(() => {
      jest.restoreAllMocks();
      jest.useRealTimers();
  });

  it('Full CRUD Workflow: Add, Edit, Validate, Filter, Sort, Delete', async () => {
    render(
      <>
        <Toaster />
        <RoomTable />
      </>
    );

    // 1. Initial Empty State
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();

    // 2. Add Room
    const addBtn = screen.getByText('+ Add Room');
    fireEvent.click(addBtn);

    // Wait for room to appear
    await waitFor(() => {
        expect(screen.queryByTestId('empty-state')).not.toBeInTheDocument();
    });

    // Check default values
    let nameCell = screen.getByText('Room 1');
    expect(nameCell).toBeInTheDocument();

    // 3. Edit Room Name
    fireEvent.click(nameCell); // Enter edit mode
    const nameInput = screen.getByRole('textbox', { name: /Edit text/i }); // TextCell uses aria-label="Edit text"

    fireEvent.change(nameInput, { target: { value: 'Master Bedroom' } });
    fireEvent.blur(nameInput); // Commit change

    // Verify update in store
    let rooms = useFloorplanStore.getState().currentFloorplan?.rooms || [];
    expect(rooms[0].name).toBe('Master Bedroom');

    // Verify UI update
    expect(screen.getByText('Master Bedroom')).toBeInTheDocument();

    // 4. Edit Dimensions (Warning)
    // Find length cell. We use the second column.
    // Row 0 is header. Row 1 is data.
    let row1 = screen.getAllByRole('row')[1];

    const cells = within(row1).getAllByRole('cell');
    const lengthCellContainer = cells[1];
    fireEvent.click(lengthCellContainer.firstChild!);

    const lengthInput = screen.getByRole('spinbutton', { name: /Edit number/i });

    fireEvent.change(lengthInput, { target: { value: '0.5' } }); // Warning (< 1.0)
    fireEvent.blur(lengthInput);

    // Verify Validation Warning
    // Row should have warning class/style
    const updatedRow = screen.getByTestId(`room-row-${rooms[0].id}`);
    expect(updatedRow).toHaveAttribute('title', expect.stringContaining('Length is unusually small'));

    // 5. Fix Dimension
    const warningCellDiv = within(updatedRow).getAllByRole('cell')[1].firstChild;
    fireEvent.click(warningCellDiv!);

    const lengthInput2 = screen.getByRole('spinbutton');
    fireEvent.change(lengthInput2, { target: { value: '5' } });
    fireEvent.blur(lengthInput2);

    // Verify Validation Cleared
    expect(updatedRow).not.toHaveAttribute('title', expect.stringContaining('Length is unusually small'));

    // Check totals
    // Area: 5 * 4 = 20
    expect(screen.getByText(/Area: 20.0/)).toBeInTheDocument();

    // 6. Add Another Room
    const footerAddBtn = screen.getAllByText('+ Add Room').find(b => b.classList.contains('add-room-button-footer'));
    fireEvent.click(footerAddBtn!);

    // New room 'Room 2'. Wait for it to appear in the table specifically,
    // to avoid matching toast notifications or other elements.
    const table = screen.getByRole('table');
    await waitFor(() => {
        expect(within(table).getAllByText(/Room 2/).length).toBeGreaterThan(0);
    });

    // Change Room 2 Type to 'kitchen'
    row1 = within(table).getAllByRole('row')[2];
    const typeCell = within(row1).getAllByRole('cell')[4];
    fireEvent.click(typeCell.firstChild!);

    // SelectCell implementation uses a native <select> when editing.
    // We need to find this select and fire change event.
    // Since it's inside the row now:
    const typeSelect = within(row1).getByLabelText('Select room type');
    fireEvent.change(typeSelect, { target: { value: 'kitchen' } });

    // 7. Filter by Name
    const searchInput = screen.getByPlaceholderText('Search rooms...');
    fireEvent.change(searchInput, { target: { value: 'Master' } });

    act(() => {
        jest.advanceTimersByTime(500); // Debounce
    });

    // Should only see Master Bedroom
    expect(within(table).getByText('Master Bedroom')).toBeInTheDocument();
    expect(within(table).queryByText(/Room 2/)).not.toBeInTheDocument();

    // Clear filter
    fireEvent.change(searchInput, { target: { value: '' } });
    act(() => {
        jest.advanceTimersByTime(500);
    });

    // Wait for Room 2 to reappear
    await waitFor(() => {
        const matches = within(table).queryAllByText(/Room 2/);
        expect(matches.length).toBeGreaterThan(0);
    }, { timeout: 2000 });

    // 8. Filter by Type
    const selects = screen.getAllByRole('combobox');
    const typeFilter = selects[0]; // TableControls is first
    fireEvent.change(typeFilter, { target: { value: 'kitchen' } });

    // Should only see Room 2 (Kitchen)
    await waitFor(() => {
        expect(within(table).queryByText('Master Bedroom')).not.toBeInTheDocument();
    });
    expect(within(table).getAllByText(/Room 2/).length).toBeGreaterThan(0);

    // Reset
    fireEvent.change(typeFilter, { target: { value: 'all' } });

    // 9. Sort
    const nameHeader = screen.getByText('Room Name');
    fireEvent.click(nameHeader); // Asc

    await waitFor(() => {
        let rows = within(table).getAllByRole('row');
        expect(rows[1]).toHaveTextContent('Master Bedroom');
        expect(rows[2]).toHaveTextContent('Room 2');
    });

    fireEvent.click(nameHeader); // Desc

    await waitFor(() => {
        let rows = within(table).getAllByRole('row');
        expect(rows[1]).toHaveTextContent('Room 2');
        expect(rows[2]).toHaveTextContent('Master Bedroom');
    });

    // 10. Delete Room
    // Click delete on the first row (Room 2 currently)
    let rows = within(table).getAllByRole('row');
    const deleteBtn = within(rows[1]).getByRole('button', { name: /Delete/i });
    fireEvent.click(deleteBtn);

    await waitFor(() => {
        expect(within(table).queryByText(/Room 2/)).not.toBeInTheDocument();
    });

    expect(within(table).getByText('Master Bedroom')).toBeInTheDocument();
  });
});
