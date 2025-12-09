import React from 'react';
import { render, screen } from '@testing-library/react';
import { NoSelectionPanel } from '@/components/properties/NoSelectionPanel';
import { useFloorplanStore } from '@/stores/floorplanStore';
import { Room } from '@/types/floorplan';

// Mock the store
jest.mock('@/stores/floorplanStore');

describe('NoSelectionPanel', () => {
  const mockRooms: Room[] = [
    {
      id: '1',
      name: 'Room 1',
      length: 5,
      width: 4,
      height: 3,
      type: 'living',
      position: { x: 0, z: 0 },
      rotation: 0,
      doors: [],
      windows: []
    },
    {
      id: '2',
      name: 'Room 2',
      length: 3,
      width: 3,
      height: 3,
      type: 'bedroom',
      position: { x: 5, z: 0 },
      rotation: 0,
      doors: [],
      windows: []
    }
  ];

  const mockProject = {
    id: 'project-1',
    name: 'Test Project',
    units: 'meters',
    rooms: mockRooms,
    connections: [],
    doors: {},
    windows: {},
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    (useFloorplanStore as unknown as jest.Mock).mockImplementation((selector) => {
       // We need to handle the selector logic
       // The component calls: useFloorplanStore(state => state.getCurrentFloorplan())
       const state = {
         getCurrentFloorplan: jest.fn().mockReturnValue(mockProject)
       };
       return selector(state);
    });
  });

  it('renders project summary correctly', () => {
    render(<NoSelectionPanel />);

    expect(screen.getByText('Project Summary')).toBeInTheDocument();
    expect(screen.getByText('Total Rooms')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // 2 rooms

    // Area: 5*4 + 3*3 = 20 + 9 = 29
    expect(screen.getByText(/29.00 m²/)).toBeInTheDocument();
  });

  it('renders correctly when no project is loaded', () => {
    (useFloorplanStore as unknown as jest.Mock).mockImplementation((selector) => {
       const state = {
         getCurrentFloorplan: jest.fn().mockReturnValue(null)
       };
       return selector(state);
    });

    render(<NoSelectionPanel />);
    expect(screen.getByText('No project loaded.')).toBeInTheDocument();
  });
});
