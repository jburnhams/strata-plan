import React from 'react';
import { render, screen } from '@testing-library/react';
import { NoSelectionPanel } from '../../../../src/components/properties/NoSelectionPanel';
import { useFloorplanStore } from '../../../../src/stores/floorplanStore';

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  Settings2: () => <div data-testid="icon-settings" />,
}));

// Mock Card components
jest.mock('../../../../src/components/ui/card', () => ({
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  CardHeader: ({ children }: any) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: any) => <div data-testid="card-title">{children}</div>,
  CardContent: ({ children }: any) => <div data-testid="card-content">{children}</div>,
}));

describe('NoSelectionPanel', () => {
  it('renders correctly', () => {
    // Mock store return values
    useFloorplanStore.setState({
        // Mocking the getter functions is hard because they are derived from state in the store definition.
        // We should set the state such that getters return expected values.
        currentFloorplan: {
            id: 'fp-1',
            name: 'Test',
            units: 'meters',
            rooms: [
                { id: '1', length: 4, width: 5 } as any
            ],
            walls: [], doors: [], windows: [], connections: [],
            createdAt: new Date(), updatedAt: new Date(), version: '1.0'
        }
    });

    render(<NoSelectionPanel />);
    expect(screen.getByTestId('no-selection-panel')).toBeInTheDocument();
    expect(screen.getByText('Select a room to edit properties')).toBeInTheDocument();
    expect(screen.getByText('Project Summary')).toBeInTheDocument();
    expect(screen.getByText('Total Rooms')).toBeInTheDocument();

    // Check values
    expect(screen.getByText('1')).toBeInTheDocument(); // Room count
    expect(screen.getByText('20.00 m²')).toBeInTheDocument(); // Area
  });
});
