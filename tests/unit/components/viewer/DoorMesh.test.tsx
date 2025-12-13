import React from 'react';
import { render } from '@testing-library/react';
import { DoorMesh } from '../../../../src/components/viewer/DoorMesh';
import { Door } from '../../../../src/types';
import * as THREE from 'three';

// Mock Three.js materials to verify they are instantiated
jest.mock('three', () => {
    const originalModule = jest.requireActual('three');
    return {
        ...originalModule,
        MeshStandardMaterial: jest.fn(),
        BoxGeometry: jest.fn(),
        SphereGeometry: jest.fn()
    };
});

describe('DoorMesh', () => {
  const mockDoor: Door = {
    id: 'door-1',
    roomId: 'room-1',
    wallSide: 'north',
    position: 0.5,
    width: 1.0,
    height: 2.0,
    type: 'single',
    swing: 'inward',
    handleSide: 'left',
    isExterior: false
  };

  // Suppress R3F warnings in JSDOM
  const originalConsoleError = console.error;
  beforeAll(() => {
    console.error = (...args: any[]) => {
      if (typeof args[0] === 'string' && (args[0].includes('Warning: React does not recognize') || args[0].includes('Invalid property'))) {
        return;
      }
      originalConsoleError(...args);
    };
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  beforeEach(() => {
      jest.clearAllMocks();
  });

  it('instantiates materials', () => {
    // Just rendering should trigger useMemo which creates materials
    render(<DoorMesh door={mockDoor} />);

    expect(THREE.MeshStandardMaterial).toHaveBeenCalledTimes(3);
    // Frame, Panel, Handle
  });

  it('renders correctly with default props', () => {
     const { container } = render(<DoorMesh door={mockDoor} />);
     // Should verify structure indirectly by ensuring no crash and perhaps inspecting custom logic outcomes if possible
     // Since R3F renders to "mesh", "group", etc. which are not HTML, they appear as custom elements in JSDOM.
     // We can query them.

     // Check for root group
     const rootGroup = container.querySelector('group');
     expect(rootGroup).toHaveAttribute('name', 'door-door-1');
  });

  it('renders frames and panel', () => {
     const { container } = render(<DoorMesh door={mockDoor} />);
     const meshes = container.querySelectorAll('mesh');
     // 3 frames (top, left, right) + 1 panel + 1 handle = 5 meshes
     expect(meshes.length).toBe(5);
  });

  it('handles right handle side', () => {
      const rightDoor = { ...mockDoor, handleSide: 'right' as const };
      const { container } = render(<DoorMesh door={rightDoor} />);

      // We can check attributes of the pivot group to see if position changed
      // The pivot group is inside the root group.
      // It's the 4th child? Or nested deeper?
      // Root group has: mesh, mesh, mesh, group (pivot)
      const rootGroup = container.querySelector('group');
      const pivotGroup = rootGroup?.querySelector('group');

      expect(pivotGroup).toBeInTheDocument();
      // Inspecting position prop in JSDOM rendered output might show up as attribute "position" with string value "x,y,z"
      // React treats array props as comma separated string in attributes for custom elements sometimes.

      // Calculation:
      // left handle: (width/2) - frameWidth
      // right handle: -(width/2) + frameWidth
      // width=1, frame=0.05.
      // left: 0.5 - 0.05 = 0.45
      // right: -0.5 + 0.05 = -0.45

      // We expect the position attribute to contain "-0.45" for x
      const pos = pivotGroup?.getAttribute('position');
      // Note: React might not render complex objects as attributes cleanly, but R3F reconciler usually doesn't run in JSDOM.
      // If we are just rendering react elements, props are passed.
      // However, @testing-library/react renders to HTML string essentially.
      // Array props like [0, 1, 0] become "0,1,0" string attribute.

      // Let's check.
      expect(pos).toContain('-0.45');
  });
});
