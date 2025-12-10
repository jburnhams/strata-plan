import React from 'react';
import { render, screen } from '@testing-library/react';
import { SelectionOverlay } from '../../../../src/components/editor/SelectionOverlay';
import { useFloorplanStore } from '../../../../src/stores/floorplanStore';
import { Room } from '../../../../src/types';

jest.mock('../../../../src/stores/floorplanStore');

describe('SelectionOverlay', () => {
  const mockRoom: Room = {
      id: 'room-1',
      name: 'Room 1',
      length: 5,
      width: 4,
      height: 2.7,
      type: 'living',
      position: { x: 0, z: 0 },
      rotation: 0,
      doors: [],
      windows: []
  };

  const mockStore = {
      getSelectedRooms: jest.fn().mockReturnValue([]),
  };

  beforeEach(() => {
    (useFloorplanStore as unknown as jest.Mock).mockReturnValue(mockStore);
  });

  it('renders nothing if no selection box and no selected rooms', () => {
    render(
      <svg>
        <SelectionOverlay selectionBox={null} />
      </svg>
    );
    const overlay = screen.getByTestId('selection-overlay');
    expect(overlay).toBeInTheDocument();
    expect(overlay.children.length).toBe(0);
  });

  it('renders selection box when provided', () => {
    const box = { minX: 0, maxX: 10, minZ: 0, maxZ: 10 };
    render(
      <svg>
        <SelectionOverlay selectionBox={box} />
      </svg>
    );
    expect(screen.getByTestId('selection-box')).toBeInTheDocument();
  });

  it('renders handles for selected room', () => {
    mockStore.getSelectedRooms.mockReturnValue([mockRoom]);
    render(
      <svg>
        <SelectionOverlay selectionBox={null} />
      </svg>
    );
    // Check for rotation handle
    expect(screen.getByTestId('handle-rotation')).toBeInTheDocument();
    // Check for corner handles
    expect(screen.getByTestId('handle-corner-0')).toBeInTheDocument();
  });
});
