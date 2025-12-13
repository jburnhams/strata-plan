import React from 'react';
import { render } from '@testing-library/react';
import { DoorTool } from '../../../../src/components/editor/DoorTool';
import * as useDoorPlacementHook from '../../../../src/hooks/useDoorPlacement';

// Mock the hook
jest.mock('../../../../src/hooks/useDoorPlacement');

describe('DoorTool', () => {
    const mockHandleMouseMove = jest.fn();
    const mockHandleClick = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (useDoorPlacementHook.useDoorPlacement as jest.Mock).mockReturnValue({
            isActive: true,
            hoveredWall: {
                wall: { from: { x: 0, z: 0 }, to: { x: 10, z: 0 } },
                position: 0.5
            },
            isValid: true,
            handleMouseMove: mockHandleMouseMove,
            handleClick: mockHandleClick
        });
    });

    it('renders nothing if not active', () => {
        (useDoorPlacementHook.useDoorPlacement as jest.Mock).mockReturnValue({
            isActive: false,
            handleMouseMove: mockHandleMouseMove,
            handleClick: mockHandleClick
        });
        const { container } = render(
             <svg>
                <DoorTool cursorPosition={{ x: 0, z: 0 }} />
             </svg>
        );
        expect(container.querySelector('g')).toBeNull();
    });

    it('renders preview when active and hovering wall', () => {
        const { container } = render(
             <svg>
                <DoorTool cursorPosition={{ x: 5, z: 0 }} />
             </svg>
        );
        const group = container.querySelector('g');
        expect(group).toBeInTheDocument();
        // Position should be mid-wall (0.5 * 10 = 5, 0)
        expect(group).toHaveAttribute('transform', expect.stringContaining('translate(5, 0)'));
    });

    it('updates hook on cursor move', () => {
        const cursor = { x: 3, z: 2 };
        render(
             <svg>
                <DoorTool cursorPosition={cursor} />
             </svg>
        );
        expect(mockHandleMouseMove).toHaveBeenCalledWith(cursor);
    });

    it('handles mouse up to place door', () => {
        render(
             <svg>
                <DoorTool cursorPosition={{ x: 5, z: 0 }} />
             </svg>
        );

        // Simulate global mouseup
        const event = new MouseEvent('mouseup', { button: 0 });
        window.dispatchEvent(event);

        expect(mockHandleClick).toHaveBeenCalled();
    });

    it('does not handle right click', () => {
        render(
             <svg>
                <DoorTool cursorPosition={{ x: 5, z: 0 }} />
             </svg>
        );

        const event = new MouseEvent('mouseup', { button: 2 });
        window.dispatchEvent(event);

        expect(mockHandleClick).not.toHaveBeenCalled();
    });

    it('does not place if invalid', () => {
        (useDoorPlacementHook.useDoorPlacement as jest.Mock).mockReturnValue({
            isActive: true,
            hoveredWall: {
                wall: { from: { x: 0, z: 0 }, to: { x: 10, z: 0 } },
                position: 0.5
            },
            isValid: false,
            handleMouseMove: mockHandleMouseMove,
            handleClick: mockHandleClick
        });

        render(
             <svg>
                <DoorTool cursorPosition={{ x: 5, z: 0 }} />
             </svg>
        );

        const event = new MouseEvent('mouseup', { button: 0 });
        window.dispatchEvent(event);

        expect(mockHandleClick).not.toHaveBeenCalled();
    });

    it('uses red color when invalid', () => {
         (useDoorPlacementHook.useDoorPlacement as jest.Mock).mockReturnValue({
            isActive: true,
            hoveredWall: {
                wall: { from: { x: 0, z: 0 }, to: { x: 10, z: 0 } },
                position: 0.5
            },
            isValid: false, // Invalid
            handleMouseMove: mockHandleMouseMove,
            handleClick: mockHandleClick
        });

        const { container } = render(
             <svg>
                <DoorTool cursorPosition={{ x: 5, z: 0 }} />
             </svg>
        );

        const rect = container.querySelector('rect');
        expect(rect).toHaveAttribute('fill', '#ef4444');
    });

    it('uses green color when valid', () => {
         // Default mock is valid
         const { container } = render(
             <svg>
                <DoorTool cursorPosition={{ x: 5, z: 0 }} />
             </svg>
        );

        const rect = container.querySelector('rect');
        expect(rect).toHaveAttribute('fill', '#22c55e');
    });
});
