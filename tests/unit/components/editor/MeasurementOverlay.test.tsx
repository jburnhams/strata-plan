import React from 'react';
import { render, screen } from '@testing-library/react';
import { MeasurementOverlay } from '../../../../src/components/editor/MeasurementOverlay';
import { useFloorplanStore } from '../../../../src/stores/floorplanStore';
import { useMeasurementStore } from '../../../../src/stores/measurementStore';
import { useUIStore } from '../../../../src/stores/uiStore';
import { Room } from '../../../../src/types';

describe('MeasurementOverlay', () => {
  beforeEach(() => {
    useFloorplanStore.setState({
      currentFloorplan: {
        id: 'fp-1',
        name: 'Test Plan',
        units: 'meters',
        rooms: [],
        connections: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        walls: []
      },
      selectedRoomIds: []
    });

    useMeasurementStore.setState({
      activeMeasurement: null,
      measurements: []
    });

    useUIStore.setState({
      showMeasurements: true,
      zoomLevel: 1
    });
  });

  const mockRoom: Room = {
    id: 'room-1',
    name: 'Living',
    length: 5,
    width: 4,
    height: 2.4,
    type: 'living',
    position: { x: 0, z: 0 },
    rotation: 0
  };

  it('renders room dimensions when room is selected', () => {
    useFloorplanStore.setState(state => ({
      currentFloorplan: { ...state.currentFloorplan!, rooms: [mockRoom] },
      selectedRoomIds: ['room-1']
    }));

    render(
      <svg>
        <MeasurementOverlay />
      </svg>
    );

    expect(screen.getByText('5.00 m')).toBeInTheDocument();
    expect(screen.getByText('4.00 m')).toBeInTheDocument();
  });

  it('renders active measurement', () => {
    useMeasurementStore.setState({
      activeMeasurement: {
        startPoint: { x: 0, z: 0 },
        endPoint: { x: 3, z: 0 },
        distance: 3
      }
    });

    render(
      <svg>
        <MeasurementOverlay />
      </svg>
    );

    expect(screen.getByText('3.00 m')).toBeInTheDocument();
  });

  it('renders persisted measurements', () => {
    useMeasurementStore.setState({
      measurements: [
        { id: 'm1', startPoint: { x: 0, z: 0 }, endPoint: { x: 2.5, z: 0 }, distance: 2.5 }
      ]
    });

    render(
      <svg>
        <MeasurementOverlay />
      </svg>
    );

    expect(screen.getByText('2.50 m')).toBeInTheDocument();
  });

  it('does not render if showMeasurements is false', () => {
    useUIStore.setState({ showMeasurements: false });
    useFloorplanStore.setState(state => ({
      currentFloorplan: { ...state.currentFloorplan!, rooms: [mockRoom] },
      selectedRoomIds: ['room-1']
    }));

    const { container } = render(
      <svg>
        <MeasurementOverlay />
      </svg>
    );

    expect(container.querySelector('g[data-testid="measurement-overlay"]')).toBeNull();
  });

  it('displays gap between two selected rooms', () => {
    const room1 = { ...mockRoom, id: 'room-1', position: { x: 0, z: 0 }, length: 4, width: 4 }; // Ends at x=4
    const room2 = { ...mockRoom, id: 'room-2', position: { x: 6, z: 0 }, length: 4, width: 4 }; // Starts at x=6, gap 2m

    useFloorplanStore.setState(state => ({
      currentFloorplan: { ...state.currentFloorplan!, rooms: [room1, room2] },
      selectedRoomIds: ['room-1', 'room-2']
    }));

    render(
      <svg>
        <MeasurementOverlay />
      </svg>
    );

    // Should verify gap is 2.00 m
    expect(screen.getByText('2.00 m')).toBeInTheDocument();
  });

  it('renders measurements in feet if unit is feet', () => {
    useFloorplanStore.setState(state => ({
      currentFloorplan: { ...state.currentFloorplan!, units: 'feet', rooms: [mockRoom] },
      selectedRoomIds: ['room-1']
    }));

    render(
      <svg>
        <MeasurementOverlay />
      </svg>
    );

    // 5m * 3.28084 = 16.40 ft
    expect(screen.getByText(/16.40 ft/)).toBeInTheDocument();
  });

  it('renders rotation angle when room is rotated', () => {
    const rotatedRoom = { ...mockRoom, rotation: 45 };
    useFloorplanStore.setState(state => ({
      currentFloorplan: { ...state.currentFloorplan!, rooms: [rotatedRoom] },
      selectedRoomIds: ['room-1']
    }));

    render(
      <svg>
        <MeasurementOverlay />
      </svg>
    );

    expect(screen.getByText('45°')).toBeInTheDocument();
  });

  it('does not render rotation angle when rotation is 0', () => {
    const normalRoom = { ...mockRoom, rotation: 0 };
    useFloorplanStore.setState(state => ({
      currentFloorplan: { ...state.currentFloorplan!, rooms: [normalRoom] },
      selectedRoomIds: ['room-1']
    }));

    render(
      <svg>
        <MeasurementOverlay />
      </svg>
    );

    // 0° shouldn't be rendered as text
    const zeroDegrees = screen.queryByText('0°');
    expect(zeroDegrees).not.toBeInTheDocument();
  });
});
