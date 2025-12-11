import React from 'react';
import { render, screen } from '@testing-library/react';
import { useFloorplanStore } from '../../src/stores/floorplanStore';
import { Room } from '../../src/types';
import { AdjacencyGraph, calculateAllConnections } from '../../src/services/adjacency/graph';

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-' + Math.random())
}));

describe('Adjacency Integration', () => {
  // Set up store
  const { getState, setState } = useFloorplanStore;

  const mockRoom1: Room = {
    id: 'room1',
    name: 'Room 1',
    length: 5,
    width: 5,
    height: 2.4,
    type: 'bedroom',
    position: { x: 0, z: 0 },
    rotation: 0,
    doors: [],
    windows: []
  };

  const mockRoom2: Room = {
    id: 'room2',
    name: 'Room 2',
    length: 5,
    width: 5,
    height: 2.4,
    type: 'bedroom',
    position: { x: 5, z: 0 }, // Touching Room 1 on East side
    rotation: 0,
    doors: [],
    windows: []
  };

  const mockRoom3: Room = {
    id: 'room3',
    name: 'Room 3',
    length: 5,
    width: 5,
    height: 2.4,
    type: 'bedroom',
    position: { x: 10, z: 0 }, // Touching Room 2 on East side, Far from Room 1
    rotation: 0,
    doors: [],
    windows: []
  };

  beforeEach(() => {
    setState({
      currentFloorplan: {
        id: 'fp1',
        name: 'Test Plan',
        units: 'meters',
        rooms: [],
        walls: [],
        doors: [],
        windows: [],
        connections: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0.0'
      },
      isDirty: false
    });
  });

  it('Auto-detection: Create adjacent rooms -> verify connection detected', () => {
    const { addRoom } = getState();

    // Add Room 1
    addRoom({ ...mockRoom1, id: undefined } as any);
    // Add Room 2 (adjacent)
    addRoom({ ...mockRoom2, id: undefined } as any);

    const state = getState();
    const rooms = state.currentFloorplan!.rooms;
    const connections = state.currentFloorplan!.connections;

    expect(rooms).toHaveLength(2);
    expect(connections).toHaveLength(1);

    const conn = connections[0];
    expect(conn.room1Id).toBeDefined();
    expect(conn.room2Id).toBeDefined();
    expect(conn.sharedWallLength).toBeCloseTo(5);
  });

  it('Move apart: Move room away -> verify connection removed', () => {
     const { addRoom, updateRoom, recalculateConnections } = getState();

    // Add Room 1 & 2 (adjacent)
    const r1 = addRoom({ ...mockRoom1, id: undefined } as any);
    const r2 = addRoom({ ...mockRoom2, id: undefined } as any);

    expect(getState().currentFloorplan!.connections).toHaveLength(1);

    // Move Room 2 away
    updateRoom(r2.id, { position: { x: 6, z: 0 } }); // 1m gap
    recalculateConnections();

    expect(getState().currentFloorplan!.connections).toHaveLength(0);
  });

  it('Multi-room: Create 3 chained rooms -> verify graph correct', () => {
    const { addRoom } = getState();

    addRoom({ ...mockRoom1, id: undefined } as any);
    addRoom({ ...mockRoom2, id: undefined } as any);
    addRoom({ ...mockRoom3, id: undefined } as any);

    const connections = getState().currentFloorplan!.connections;

    // Room 1-2 and Room 2-3. Room 1-3 should not be connected.
    expect(connections).toHaveLength(2);
  });

  it('Manual Connections: create, persist, and cleanup', () => {
    const { addRoom, recalculateConnections, deleteRoom, updateRoom, addManualConnection, removeConnection } = getState();

    // Add two non-adjacent rooms
    const r1 = addRoom({ ...mockRoom1, id: undefined, position: { x: 0, z: 0 } } as any);
    const r2 = addRoom({ ...mockRoom2, id: undefined, position: { x: 10, z: 0 } } as any); // Far away

    // No auto connections
    expect(getState().currentFloorplan!.connections).toHaveLength(0);

    // Create manual connection via action
    addManualConnection(r1.id, r2.id);

    // Verify it exists
    expect(getState().currentFloorplan!.connections).toHaveLength(1);
    expect(getState().currentFloorplan!.connections[0].isManual).toBe(true);

    // Verify it persists after recalculation
    recalculateConnections();
    expect(getState().currentFloorplan!.connections).toHaveLength(1);

    // Move room (trigger recalculation)
    updateRoom(r2.id, { position: { x: 12, z: 0 } });
    recalculateConnections();
    expect(getState().currentFloorplan!.connections).toHaveLength(1);

    // Remove connection via action
    const connId = getState().currentFloorplan!.connections[0].id;
    removeConnection(connId);
    expect(getState().currentFloorplan!.connections).toHaveLength(0);

    // Re-add and then delete room
    addManualConnection(r1.id, r2.id);
    expect(getState().currentFloorplan!.connections).toHaveLength(1);

    deleteRoom(r2.id);
    expect(getState().currentFloorplan!.connections).toHaveLength(0);
  });
});
