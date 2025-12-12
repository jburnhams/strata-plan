import { render, screen } from '@testing-library/react';
import { MeasurementOverlay } from '@/components/editor/MeasurementOverlay';
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

const { useFloorplanStore } = require('@/stores/floorplanStore');
const { useUIStore } = require('@/stores/uiStore');

describe('MeasurementOverlay', () => {
  const defaultRoom = { id: 'room1', name: 'Room 1', position: { x: 0, z: 0 }, length: 5, width: 4, rotation: 0 };

  beforeEach(() => {
    jest.clearAllMocks();

    (useFloorplanStore as unknown as jest.Mock).mockImplementation((selector: any) => {
      const state = {
        currentFloorplan: {
          rooms: [defaultRoom],
          units: 'meters'
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
  });

  const renderComponent = () => {
    return render(
      <svg>
        <MeasurementOverlay />
      </svg>
    );
  };

  it('renders measurements for selected room', () => {
    renderComponent();
    expect(screen.getByText('5.00 m')).toBeTruthy();
    expect(screen.getByText('4.00 m')).toBeTruthy();
  });

  it('does not render if no room selected', () => {
    (useFloorplanStore as unknown as jest.Mock).mockImplementation((selector: any) => {
        const state = {
          currentFloorplan: { rooms: [defaultRoom] },
          selectedRoomIds: [],
        };
        return selector(state);
      });
    const { container } = renderComponent();
    expect(container.querySelector('g[data-testid="measurement-overlay"]')).toBeNull();
  });

  it('renders measurements in feet if unit is feet', () => {
    (useFloorplanStore as unknown as jest.Mock).mockImplementation((selector: any) => {
      const state = {
        currentFloorplan: {
          rooms: [defaultRoom],
          units: 'feet'
        },
        selectedRoomIds: ['room1'],
      };
      return selector(state);
    });

    renderComponent();
    // 5m = 16.40ft, 4m = 13.12ft
    expect(screen.getByText('16.40 ft')).toBeTruthy();
    expect(screen.getByText('13.12 ft')).toBeTruthy();
  });

  it('applies rotation transform', () => {
     (useFloorplanStore as unknown as jest.Mock).mockImplementation((selector: any) => {
      const state = {
        currentFloorplan: {
          rooms: [{ ...defaultRoom, rotation: 45 }],
          units: 'meters'
        },
        selectedRoomIds: ['room1'],
      };
      return selector(state);
    });

    const { container } = renderComponent();
    const group = container.querySelector('g[transform^="rotate(45"]');
    expect(group).toBeTruthy();
  });
});
