import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { WallOverlay, WallPreview } from '../../../../src/components/editor/WallOverlay';
import { useFloorplanStore } from '../../../../src/stores/floorplanStore';
import { useUIStore } from '../../../../src/stores/uiStore';
import { Wall } from '../../../../src/types';

describe('WallOverlay', () => {
    const mockSelectWall = jest.fn();

    beforeEach(() => {
        useFloorplanStore.setState({
            currentFloorplan: {
                id: 'fp-1',
                name: 'Test',
                units: 'meters',
                rooms: [],
                walls: [
                    { id: 'w1', from: { x: 0, z: 0 }, to: { x: 1, z: 1 }, thickness: 0.2 },
                    { id: 'w2', from: { x: 2, z: 2 }, to: { x: 3, z: 3 }, thickness: 0.2 }
                ],
                connections: [],
                doors: [],
                windows: [],
                createdAt: new Date(),
                updatedAt: new Date(),
                version: '1.0'
            },
            selectedWallId: null,
            selectWall: mockSelectWall
        });
        useUIStore.setState({ zoomLevel: 1.0 });
        jest.clearAllMocks();
    });

    it('renders existing walls', () => {
        // Need to wrap in svg
        render(<svg><WallOverlay /></svg>);

        expect(screen.getByTestId('wall-w1')).toBeInTheDocument();
        expect(screen.getByTestId('wall-w2')).toBeInTheDocument();
    });

    it('selects wall on click', () => {
        render(<svg><WallOverlay /></svg>);

        const wall1 = screen.getByTestId('wall-w1');
        fireEvent.click(wall1);

        expect(mockSelectWall).toHaveBeenCalledWith('w1');
    });

    it('renders selection highlight when selected', () => {
        useFloorplanStore.setState({ selectedWallId: 'w1' });
        render(<svg><WallOverlay /></svg>);

        // The wall itself
        const wall1 = screen.getByTestId('wall-w1');
        expect(wall1).toHaveAttribute('stroke', '#2563eb');

        // Unselected
        const wall2 = screen.getByTestId('wall-w2');
        expect(wall2).toHaveAttribute('stroke', '#333');
    });
});

describe('WallPreview', () => {
    it('does not render if not drawing', () => {
        const { container } = render(<svg><WallPreview isDrawing={false} startPoint={{ x: 0, z: 0 }} currentPoint={{ x: 1, z: 1 }} /></svg>);
        expect(container.firstChild).toBeEmptyDOMElement();
    });

    it('renders preview line and label when drawing', () => {
        render(<svg><WallPreview isDrawing={true} startPoint={{ x: 0, z: 0 }} currentPoint={{ x: 3, z: 4 }} /></svg>);

        expect(screen.getByTestId('wall-preview')).toBeInTheDocument();
        expect(screen.getByText('5.00m')).toBeInTheDocument(); // 3-4-5 triangle
    });
});
