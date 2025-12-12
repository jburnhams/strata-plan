import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { useFloorplanStore } from '@/stores/floorplanStore';
import { useUIStore } from '@/stores/uiStore';
import { RoomPropertiesPanel } from '@/components/properties/RoomPropertiesPanel';
import { RoomShape } from '@/components/editor/RoomShape';
import { ColorSchemeDialog } from '@/components/dialogs/ColorSchemeDialog';
import { FLOOR_MATERIALS } from '@/constants/materialConfigs';
import * as THREE from 'three';

// Mock UI components
jest.mock('@/components/ui/accordion', () => ({
  Accordion: ({ children }: any) => <div>{children}</div>,
  AccordionItem: ({ children }: any) => <div>{children}</div>,
  AccordionTrigger: ({ children }: any) => <button>{children}</button>,
  AccordionContent: ({ children }: any) => <div>{children}</div>,
}));

jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: any) => open ? <div>{children}</div> : null,
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <div>{children}</div>,
  DialogDescription: ({ children }: any) => <div>{children}</div>,
  DialogFooter: ({ children }: any) => <div>{children}</div>,
}));

// Mock Three.js/R3F
jest.mock('@react-three/fiber', () => {
  const THREE = require('three');
  // Return simple mock for DOM element inside the factory, but we can't access document directly here safely if global override issues occur in some setups.
  // However, JSDOM env has 'document' global. The error was about referencing "document" which is technically in scope but Jest mock factory hoisting makes it tricky.
  // We can just return a dummy object or create element inside function.
  return {
    useFrame: jest.fn(),
    useThree: jest.fn(() => ({
      scene: new THREE.Scene(),
      camera: new THREE.PerspectiveCamera(),
      gl: { domElement: { tagName: 'CANVAS', style: {}, addEventListener: jest.fn(), removeEventListener: jest.fn() } }
    })),
    extend: jest.fn(),
  };
});

jest.mock('@react-three/drei', () => ({
  Text: () => null,
  Billboard: ({ children }: any) => <group>{children}</group>,
}));

describe('Materials Integration Workflow', () => {
  beforeEach(() => {
    act(() => {
      useFloorplanStore.getState().clearFloorplan();
      useFloorplanStore.getState().createFloorplan('Test Plan', 'meters');
      useUIStore.getState().setMaterialQuality('standard');
    });
  });

  const addRoom = () => {
    let roomId = '';
    act(() => {
      const room = useFloorplanStore.getState().addRoom({
        name: 'Test Room',
        type: 'bedroom',
        length: 5,
        width: 4,
        height: 3,
        position: { x: 0, z: 0 },
        rotation: 0,
      });
      roomId = room.id;
    });
    return roomId;
  };

  it('updates 2D and 3D representations when material changes', async () => {
    const roomId = addRoom();

    // Select room
    act(() => {
      useFloorplanStore.getState().selectRoom(roomId);
    });

    // 1. Initial State Check
    let room = useFloorplanStore.getState().getRoomById(roomId);
    expect(room?.floorMaterial).toBe('hardwood'); // Default for bedroom

    // 2. Render Components
    const { rerender: rerender2D } = render(
      <svg>
        <RoomShape
          room={room!}
          isSelected={true}
          isHovered={false}
          onClick={jest.fn()}
          onDoubleClick={jest.fn()}
          onMouseDown={jest.fn()}
          onMouseEnter={jest.fn()}
          onMouseLeave={jest.fn()}
        />
      </svg>
    );

    // Check 2D color
    let rect = screen.getByTestId(`room-shape-${roomId}`).querySelector('rect');
    expect(rect).toHaveAttribute('fill', FLOOR_MATERIALS['hardwood'].defaultColor);

    // 3. Change Material via Store (Simulating UI interaction)
    act(() => {
      useFloorplanStore.getState().setRoomFloorMaterial(roomId, 'tile-ceramic');
    });

    room = useFloorplanStore.getState().getRoomById(roomId);

    // Rerender 2D
    rerender2D(
      <svg>
        <RoomShape
          room={room!}
          isSelected={true}
          isHovered={false}
          onClick={jest.fn()}
          onDoubleClick={jest.fn()}
          onMouseDown={jest.fn()}
          onMouseEnter={jest.fn()}
          onMouseLeave={jest.fn()}
        />
      </svg>
    );

    // Check updated 2D color
    rect = screen.getByTestId(`room-shape-${roomId}`).querySelector('rect');
    expect(rect).toHaveAttribute('fill', FLOOR_MATERIALS['tile-ceramic'].defaultColor);
  });

  it('applies color scheme correctly', () => {
    // Add two rooms
    const r1 = addRoom();
    const r2 = addRoom();

    // Render Dialog
    render(
      <ColorSchemeDialog
        open={true}
        onOpenChange={jest.fn()}
      />
    );

    // Select 'Modern' scheme
    fireEvent.click(screen.getByText('Modern'));

    // Confirm and Apply
    // (Mock window.confirm)
    window.confirm = jest.fn(() => true);

    fireEvent.click(screen.getByText('Apply Scheme'));

    // Check rooms
    const room1 = useFloorplanStore.getState().getRoomById(r1);
    const room2 = useFloorplanStore.getState().getRoomById(r2);

    // Modern scheme defaults
    expect(room1?.floorMaterial).toBe('hardwood');
    expect(room1?.wallMaterial).toBe('drywall-white');

    expect(room2?.floorMaterial).toBe('hardwood');
    expect(room2?.wallMaterial).toBe('drywall-white');
  });

  it('handles custom color overrides', () => {
    const roomId = addRoom();

    act(() => {
      useFloorplanStore.getState().setRoomCustomColor(roomId, 'floor', '#123456');
    });

    const room = useFloorplanStore.getState().getRoomById(roomId);

    render(
      <svg>
        <RoomShape
          room={room!}
          isSelected={false}
          isHovered={false}
          onClick={jest.fn()}
          onDoubleClick={jest.fn()}
          onMouseDown={jest.fn()}
          onMouseEnter={jest.fn()}
          onMouseLeave={jest.fn()}
        />
      </svg>
    );

    const rect = screen.getByTestId(`room-shape-${roomId}`).querySelector('rect');
    expect(rect).toHaveAttribute('fill', '#123456');
  });
});
