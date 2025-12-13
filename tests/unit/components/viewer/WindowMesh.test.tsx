import React from 'react';
import { WindowMesh } from '../../../../src/components/viewer/WindowMesh';
import { Window } from '../../../../src/types';

describe('WindowMesh', () => {
  const mockWindow: Window = {
    id: 'window-1',
    roomId: 'room-1',
    wallSide: 'north',
    position: 0.5,
    width: 1.2,
    height: 1.2,
    sillHeight: 0.9,
    frameType: 'double',
    material: 'pvc',
    openingType: 'casement'
  };

  // Suppress console errors for unknown elements
  const originalConsoleError = console.error;
  beforeAll(() => {
    console.error = (...args: any[]) => {
      if (typeof args[0] === 'string' && args[0].includes('Warning: React does not recognize the')) {
        return;
      }
      originalConsoleError(...args);
    };
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  it('renders without crashing', () => {
    const element = <WindowMesh window={mockWindow} />;
    expect(element).toBeDefined();
  });
});
