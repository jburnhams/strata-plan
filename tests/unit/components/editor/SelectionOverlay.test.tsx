import { render, screen, fireEvent, createEvent } from '@testing-library/react';
import { SelectionOverlay } from '@/components/editor/SelectionOverlay';
import { useRoomResize } from '@/hooks/useRoomResize';
import { useRoomRotation } from '@/hooks/useRoomRotation';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

jest.mock('@/stores/floorplanStore', () => {
    const { jest } = require('@jest/globals');
    return {
        useFloorplanStore: jest.fn()
    };
});
jest.mock('@/stores/uiStore', () => {
    const { jest } = require('@jest/globals');
    return {
        useUIStore: jest.fn()
    };
});
jest.mock('@/hooks/useRoomResize', () => {
    const { jest } = require('@jest/globals');
    return {
        useRoomResize: jest.fn()
    };
});
jest.mock('@/hooks/useRoomRotation', () => {
    const { jest } = require('@jest/globals');
    return {
        useRoomRotation: jest.fn()
    };
});

// Access mocks after definition
const { useFloorplanStore } = require('@/stores/floorplanStore');
const { useUIStore } = require('@/stores/uiStore');

describe('SelectionOverlay', () => {
  const mockHandleResizeStart = jest.fn();
  const mockHandleRotationStart = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useFloorplanStore as unknown as jest.Mock).mockImplementation((selector: any) => {
      const state = {
        currentFloorplan: {
          rooms: [
            { id: 'room1', name: 'Room 1', position: { x: 0, z: 0 }, length: 5, width: 4, rotation: 0 },
          ],
        },
        selectedRoomIds: ['room1'],
      };
      return selector(state);
    });

    (useUIStore as unknown as jest.Mock).mockImplementation((selector: any) => {
      const state = {
        zoomLevel: 1,
      };
      return selector(state);
    });

    (useRoomResize as unknown as jest.Mock).mockReturnValue({
      handleResizeStart: mockHandleResizeStart,
    });

    (useRoomRotation as unknown as jest.Mock).mockReturnValue({
      handleRotationStart: mockHandleRotationStart,
    });
  });

  const renderComponent = () => {
    return render(
      <svg>
        <SelectionOverlay />
      </svg>
    );
  };

  it('renders handles for selected room', () => {
    const { container } = renderComponent();
    // Outline + 8 resize handles + 1 rotate handle
    // handles have data-testid="handle-..."
    const handles = container.querySelectorAll('[data-testid^="handle-"]');
    // nw, ne, sw, se, n, s, e, w, rotate (9 handles)
    expect(handles).toHaveLength(9);
  });

  it('does not render if no room selected', () => {
    (useFloorplanStore as unknown as jest.Mock).mockImplementation((selector: any) => {
        const state = {
          currentFloorplan: { rooms: [] },
          selectedRoomIds: [],
        };
        return selector(state);
      });
    const { container } = renderComponent();
    // Since we wrapped in <svg>, container has <svg>. We check if <svg> is empty.
    expect(container.querySelector('g[data-testid="selection-overlay"]')).toBeNull();
  });

  it('calls handleResizeStart on corner handle mousedown', () => {
    renderComponent();
    const handle = screen.getByTestId('handle-nw-room1');
    fireEvent.mouseDown(handle, { button: 0 });
    expect(mockHandleResizeStart).toHaveBeenCalledWith(expect.anything(), 'room1', 'nw');
  });

  it('calls handleRotationStart on rotate handle mousedown', () => {
    renderComponent();
    const handle = screen.getByTestId('handle-rotate-room1');
    fireEvent.mouseDown(handle, { button: 0 });
    expect(mockHandleRotationStart).toHaveBeenCalledWith(expect.anything(), 'room1');
  });

  it('stops propagation on handle click', () => {
    renderComponent();
    const handle = screen.getByTestId('handle-nw-room1');

    const event = createEvent.click(handle);
    event.stopPropagation = jest.fn();
    fireEvent(handle, event);

    expect(event.stopPropagation).toHaveBeenCalled();
  });

  it('ignores right click on handles', () => {
    renderComponent();
    const handle = screen.getByTestId('handle-nw-room1');
    fireEvent.mouseDown(handle, { button: 2 });
    expect(mockHandleResizeStart).not.toHaveBeenCalled();
  });
});
