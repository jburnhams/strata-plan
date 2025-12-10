import React from 'react';
import { render, act } from '@testing-library/react';
import { SceneManager } from '../../src/components/viewer/SceneManager';
import { useFloorplanStore } from '../../src/stores/floorplanStore';
// import { createCanvas } from '@napi-rs/canvas';

// NOTE: We are not using @napi-rs/canvas here because it provides a 2D context (Skia),
// whereas SceneManager/Three.js requires a WebGL context.
// In a Node environment without 'headless-gl', we cannot create a real WebGL context.
// Therefore, we test SceneManager by rendering it directly (as a React component tree)
// and verifying that it passes the correct props to its children (RoomMesh) after the debounce period.
// This validates the integration of the store, the hook, and the component logic.

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock matchMedia
window.matchMedia = window.matchMedia || function() {
  return {
    matches: false,
    addListener: function() {},
    removeListener: function() {}
  };
};

// Mock RoomMesh to detect when it's rendered
// We mock it to return a simple <group> which is valid React output,
// avoiding R3F rendering issues in JSDOM without WebGL.
const mockRoomMesh = jest.fn();

jest.mock('../../src/components/viewer/RoomMesh', () => ({
  RoomMesh: (props: any) => {
    mockRoomMesh(props);
    return <group name={`room-${props.room.id}`} />;
  }
}));

describe('SceneManager Integration (Scene Sync)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Reset store
    act(() => {
        useFloorplanStore.setState({
            currentFloorplan: {
                id: 'fp1',
                rooms: [],
                units: 'meters',
                connections: [],
                createdAt: new Date(),
                updatedAt: new Date()
            },
            selectedRoomId: null,
            selectedRoomIds: []
        });
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('synchronizes scene with store updates after debounce', async () => {
    // Suppress console errors for unknown tags (<group>)
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Render SceneManager directly.
    render(<SceneManager />);

    // Initial render: 0 rooms
    expect(mockRoomMesh).toHaveBeenCalledTimes(0);

    // Add room to store
    act(() => {
        useFloorplanStore.setState(state => ({
            currentFloorplan: {
                ...state.currentFloorplan!,
                rooms: [
                    {
                        id: 'room1',
                        name: 'Living Room',
                        width: 4,
                        length: 5,
                        height: 2.4,
                        position: { x: 0, z: 0 },
                        type: 'living',
                        doors: [],
                        windows: []
                    }
                ]
            }
        }));
    });

    // Run timers for debounce
    act(() => {
        jest.advanceTimersByTime(200);
    });

    // Now it should have updated
    expect(mockRoomMesh).toHaveBeenCalled();
    expect(mockRoomMesh).toHaveBeenCalledWith(
        expect.objectContaining({
            room: expect.objectContaining({ id: 'room1' })
        })
    );

    consoleSpy.mockRestore();
  });
});
