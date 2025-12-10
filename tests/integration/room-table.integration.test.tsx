import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RoomTable } from '../../src/components/table/RoomTable';
import { useFloorplanStore } from '../../src/stores/floorplanStore';
import { Toaster } from '../../src/components/ui/toaster';

// Setup basic environment
describe('RoomTable Integration Workflow', () => {
  // Reset store before each test
  beforeEach(() => {
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

      // Mock window.confirm
      jest.spyOn(window, 'confirm').mockImplementation(() => true);
  });

  afterEach(() => {
      jest.restoreAllMocks();
  });

  it('Full CRUD Workflow: Add, Edit, Validate, Sort, Delete', async () => {
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
    const row1 = screen.getAllByRole('row')[1];

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

    // New room 'Room 2'
    await screen.findByText('Room 2');

    // 7. Sort
    const nameHeader = screen.getByText('Room Name');
    fireEvent.click(nameHeader); // Asc
    fireEvent.click(nameHeader); // Desc

    const rows = screen.getAllByRole('row');
    // Header(1) + Row1 + Row2 + Footer...
    // Check first data row (index 1)
    expect(rows[1]).toHaveTextContent('Room 2');
    expect(rows[2]).toHaveTextContent('Master Bedroom');

    // 8. Delete Room
    // Click delete on the first row (Room 2)
    const deleteBtn = within(rows[1]).getByRole('button', { name: /Delete/i });
    fireEvent.click(deleteBtn);

    // Should confirm (mocked) and delete
    await waitFor(() => {
        expect(screen.queryByText('Room 2')).not.toBeInTheDocument();
    });

    // Only Master Bedroom remains
    expect(screen.getByText('Master Bedroom')).toBeInTheDocument();

    // Check totals updated
    // Area: 20.0 (Master Bedroom)
    expect(screen.getByText(/Area: 20.0/)).toBeInTheDocument();
  });
});
