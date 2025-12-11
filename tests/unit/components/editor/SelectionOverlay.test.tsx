import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SelectionOverlay } from '../../../../src/components/editor/SelectionOverlay';
import { useFloorplanStore } from '../../../../src/stores/floorplanStore';
import { useUIStore } from '../../../../src/stores/uiStore';

// Reset stores helper
const resetStore = () => {
    useFloorplanStore.setState({
        currentFloorplan: {
            id: 'test',
            name: 'Test',
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
        selectedRoomIds: [],
        selectedRoomId: null,
    });
    useUIStore.setState({ zoomLevel: 1.0 });
};

describe('SelectionOverlay', () => {
    beforeEach(() => {
        resetStore();
    });

    it('renders nothing when no room is selected', () => {
        render(<SelectionOverlay />);
        expect(screen.queryByTestId('selection-overlay')).not.toBeInTheDocument();
    });

    it('renders handles when room is selected', () => {
        const store = useFloorplanStore.getState();
        store.addRoom({
            name: 'Room 1',
            length: 5, width: 4, height: 2.7, type: 'bedroom',
            position: { x: 0, z: 0 }, rotation: 0
        });

        // Re-fetch state because addRoom might replace the array reference or object
        // And getState() returns a snapshot at call time?
        // useFloorplanStore is a zustand store. getState() returns current state.
        // But we need to ensure we get the updated rooms list.
        const updatedStore = useFloorplanStore.getState();
        const roomId = updatedStore.currentFloorplan?.rooms[0].id!;

        updatedStore.selectRoom(roomId);

        render(
            <svg>
                <SelectionOverlay />
            </svg>
        );

        expect(screen.getByTestId('selection-overlay')).toBeInTheDocument();

        // Check for specific handles
        expect(screen.getByTestId(`handle-nw-${roomId}`)).toBeInTheDocument();
        expect(screen.getByTestId(`handle-ne-${roomId}`)).toBeInTheDocument();
        expect(screen.getByTestId(`handle-sw-${roomId}`)).toBeInTheDocument();
        expect(screen.getByTestId(`handle-se-${roomId}`)).toBeInTheDocument();
    });

    it('renders handles for multiple selected rooms', () => {
        const store = useFloorplanStore.getState();
        store.addRoom({ name: 'R1', length: 5, width: 4, height: 2.7, type: 'bedroom', position: { x: 0, z: 0 }, rotation: 0 });
        store.addRoom({ name: 'R2', length: 5, width: 4, height: 2.7, type: 'bedroom', position: { x: 10, z: 0 }, rotation: 0 });

        const updatedStore = useFloorplanStore.getState();
        const rooms = updatedStore.currentFloorplan?.rooms!;
        updatedStore.setRoomSelection([rooms[0].id, rooms[1].id]);

        render(
            <svg>
                <SelectionOverlay />
            </svg>
        );

        expect(screen.getByTestId(`handle-nw-${rooms[0].id}`)).toBeInTheDocument();
        expect(screen.getByTestId(`handle-nw-${rooms[1].id}`)).toBeInTheDocument();
    });
});
