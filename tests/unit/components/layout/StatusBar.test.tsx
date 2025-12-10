import React from 'react';
import { render, screen } from '@testing-library/react';
import { StatusBar } from '../../../../src/components/layout/StatusBar';
import { useFloorplanStore } from '../../../../src/stores/floorplanStore';
import { useUIStore } from '../../../../src/stores/uiStore';
import { TooltipProvider } from '../../../../src/components/ui/tooltip';

// Mock the stores
jest.mock('../../../../src/stores/floorplanStore');
jest.mock('../../../../src/stores/uiStore');

// Helper to render with providers
const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <TooltipProvider>
      {component}
    </TooltipProvider>
  );
};

describe('StatusBar', () => {
  beforeEach(() => {
    // Reset mocks
    (useFloorplanStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = {
        currentFloorplan: { name: 'Test Project' },
        selectedRoomId: null,
        selectedWallId: null,
        selectedDoorId: null,
        selectedWindowId: null,
      };
      return selector(state);
    });

    (useUIStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = {
        saveStatus: 'saved',
        lastSaveTime: new Date('2023-01-01T12:00:00Z'),
        zoomLevel: 1.0,
      };
      return selector(state);
    });
  });

  it('renders project name', () => {
    renderWithProviders(<StatusBar />);
    expect(screen.getByText('Test Project')).toBeInTheDocument();
  });

  it('renders "Ready" when no selection', () => {
    renderWithProviders(<StatusBar />);
    expect(screen.getByText('Ready')).toBeInTheDocument();
  });

  it('renders "Room selected" when room is selected', () => {
    (useFloorplanStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = {
        currentFloorplan: { name: 'Test Project' },
        selectedRoomId: 'room-1',
        selectedWallId: null,
        selectedDoorId: null,
        selectedWindowId: null,
      };
      return selector(state);
    });
    renderWithProviders(<StatusBar />);
    expect(screen.getByText('Room selected')).toBeInTheDocument();
  });

  it('renders save status "Saved"', () => {
    renderWithProviders(<StatusBar />);
    expect(screen.getByText('Saved')).toBeInTheDocument();
  });

  it('renders save status "Saving..."', () => {
    (useUIStore as unknown as jest.Mock).mockImplementation((selector) => {
       const state = {
        saveStatus: 'saving',
        lastSaveTime: null,
        zoomLevel: 1.0,
      };
      return selector(state);
    });
    renderWithProviders(<StatusBar />);
    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });

  it('renders zoom level', () => {
     (useUIStore as unknown as jest.Mock).mockImplementation((selector) => {
       const state = {
        saveStatus: 'saved',
        lastSaveTime: null,
        zoomLevel: 1.5, // 150%
      };
      return selector(state);
    });
    renderWithProviders(<StatusBar />);
    expect(screen.getByText('150%')).toBeInTheDocument();
  });
});
