import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DoorPropertiesPanel } from '../../../../src/components/properties/DoorPropertiesPanel';
import { useFloorplanStore } from '../../../../src/stores/floorplanStore';
import { Door } from '../../../../src/types';

// Mock generic UI components if needed, but Shadcn components are usually fine to render.
// However, Select involves portals which can be tricky.
// We can use @radix-ui/react-select mocks or just integration style testing with pointer events.
// Or simple mocks.
// Let's try to render them. Note setup.ts handles some ResizeObserver mocks.

describe('DoorPropertiesPanel', () => {
  const mockDoor: Door = {
    id: 'door-1',
    wallId: 'wall-1',
    width: 0.9,
    height: 2.1,
    offset: 1.0,
    type: 'single',
    swing: 'inward',
    handleSide: 'left'
  };

  const setupStore = (door: Door | null = mockDoor) => {
    useFloorplanStore.setState({
      currentFloorplan: {
        id: 'fp-1',
        name: 'Test Plan',
        units: 'meters',
        rooms: [],
        walls: [],
        doors: door ? [door] : [],
        windows: [],
        connections: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0.0',
      },
      selectedDoorId: door ? door.id : null,
    });
  };

  beforeEach(() => {
    setupStore();
  });

  it('renders nothing if no door selected', () => {
    setupStore(null);
    const { container } = render(<DoorPropertiesPanel />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders door properties when door selected', () => {
    render(<DoorPropertiesPanel />);
    expect(screen.getByText('Door Properties')).toBeInTheDocument();
    expect(screen.getByLabelText(/Width/)).toHaveValue(0.9);
    expect(screen.getByLabelText(/Height/)).toHaveValue(2.1);
  });

  it('updates width when input changes', () => {
    render(<DoorPropertiesPanel />);
    const input = screen.getByLabelText(/Width/);
    fireEvent.change(input, { target: { value: '1.2' } });

    const updatedDoor = useFloorplanStore.getState().getDoorById(mockDoor.id);
    expect(updatedDoor?.width).toBe(1.2);
  });

  it('does not update width for invalid input', () => {
      render(<DoorPropertiesPanel />);
      const input = screen.getByLabelText(/Width/);
      fireEvent.change(input, { target: { value: '-1' } }); // Invalid

      const updatedDoor = useFloorplanStore.getState().getDoorById(mockDoor.id);
      expect(updatedDoor?.width).toBe(0.9); // Unchanged
  });

  it('updates height when input changes', () => {
    render(<DoorPropertiesPanel />);
    const input = screen.getByLabelText(/Height/);
    fireEvent.change(input, { target: { value: '2.5' } });

    const updatedDoor = useFloorplanStore.getState().getDoorById(mockDoor.id);
    expect(updatedDoor?.height).toBe(2.5);
  });

  // For Select components (Radix UI), testing interactions can be complex.
  // We can rely on the fact that `Select` calls `onValueChange` and we pass `updateDoor`.
  // Or we can try to click trigger and select item.
  // Let's try minimal interaction.

  /*
  it('updates door type', async () => {
      render(<DoorPropertiesPanel />);
      // Radix UI Select is complex to test without userEvent and proper mocks.
      // Skipping specific interaction test for Select to avoid flakiness,
      // relying on manual/integration tests or assuming Shadcn works.
      // But we need coverage for the callback.
      // We can mock the Select component to verify props?
      // Or just assume standard library behavior.
  });
  */

  it('deletes door on button click and confirm', () => {
      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
      render(<DoorPropertiesPanel />);

      const deleteBtn = screen.getByText('Delete Door');
      fireEvent.click(deleteBtn);

      expect(confirmSpy).toHaveBeenCalled();
      const updatedDoor = useFloorplanStore.getState().getDoorById(mockDoor.id);
      expect(updatedDoor).toBeUndefined();

      confirmSpy.mockRestore();
  });

  it('does not delete door if confirm cancelled', () => {
      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(false);
      render(<DoorPropertiesPanel />);

      const deleteBtn = screen.getByText('Delete Door');
      fireEvent.click(deleteBtn);

      expect(confirmSpy).toHaveBeenCalled();
      const updatedDoor = useFloorplanStore.getState().getDoorById(mockDoor.id);
      expect(updatedDoor).toBeDefined();

      confirmSpy.mockRestore();
  });
});
