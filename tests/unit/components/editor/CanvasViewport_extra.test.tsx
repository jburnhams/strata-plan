import React from 'react';
import { render, screen, fireEvent, createEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CanvasViewport } from '@/components/editor/CanvasViewport';
import { useUIStore } from '@/stores/uiStore';
import { useRoomInteraction } from '@/hooks/useRoomInteraction';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock dependencies
jest.mock('@/stores/uiStore', () => {
    const { jest } = require('@jest/globals');
    return {
        useUIStore: jest.fn()
    };
});
jest.mock('@/hooks/useRoomInteraction', () => {
    const { jest } = require('@jest/globals');
    return {
        useRoomInteraction: jest.fn()
    };
});

// Mock Ruler to avoid canvas issues
jest.mock('@/components/editor/Ruler', () => ({
    Ruler: () => <div data-testid="ruler" />
}));

// Mock ResizeObserver
const mockResizeObserver = jest.fn();
const mockDisconnect = jest.fn();
const mockObserve = jest.fn();

beforeEach(() => {
    jest.clearAllMocks();
    global.ResizeObserver = jest.fn().mockImplementation((callback: any) => {
        mockResizeObserver.mockReturnValue(callback);
        return {
            observe: (element: any) => {
                mockObserve(element);
                // Simulate initial resize to give dimensions
                callback([{ contentRect: { width: 800, height: 600 } }]);
            },
            disconnect: mockDisconnect,
            unobserve: jest.fn(),
        };
    }) as any;
});

describe('CanvasViewport Extra Coverage', () => {
    const mockSetZoom = jest.fn();
    const mockSetPan = jest.fn();
    const mockHandleBackgroundClick = jest.fn();
    const mockOnCursorMove = jest.fn();

    beforeEach(() => {
        (useUIStore as unknown as jest.Mock).mockReturnValue({
            zoomLevel: 1,
            panOffset: { x: 0, z: 0 },
            setZoom: mockSetZoom,
            setPan: mockSetPan
        });

        (useRoomInteraction as unknown as jest.Mock).mockReturnValue({
            handleBackgroundClick: mockHandleBackgroundClick
        });
    });

    it('handles mouse wheel zoom in', () => {
        render(<CanvasViewport />);
        const viewport = screen.getByTestId('canvas-viewport');

        // Simulate wheel event
        fireEvent.wheel(viewport, { deltaY: -100, clientX: 400, clientY: 300 });

        expect(mockSetZoom).toHaveBeenCalled();
        const zoomCall = mockSetZoom.mock.calls[0][0];
        expect(zoomCall).toBeGreaterThan(1); // Zoomed in
        expect(mockSetPan).toHaveBeenCalled();
    });

    it('handles mouse wheel zoom out', () => {
        render(<CanvasViewport />);
        const viewport = screen.getByTestId('canvas-viewport');

        fireEvent.wheel(viewport, { deltaY: 100, clientX: 400, clientY: 300 });

        expect(mockSetZoom).toHaveBeenCalled();
        const zoomCall = mockSetZoom.mock.calls[0][0];
        expect(zoomCall).toBeLessThan(1); // Zoomed out
    });

    it('handles middle click drag to pan', () => {
        render(<CanvasViewport />);
        const viewport = screen.getByTestId('canvas-viewport');

        // Middle click down (button 1)
        fireEvent.mouseDown(viewport, { button: 1, clientX: 100, clientY: 100 });

        // Move
        fireEvent.mouseMove(viewport, { clientX: 150, clientY: 150 });

        expect(mockSetPan).toHaveBeenCalled();

        // Mouse up
        fireEvent.mouseUp(viewport);
    });

    it('handles alt+left click drag to pan', () => {
        render(<CanvasViewport />);
        const viewport = screen.getByTestId('canvas-viewport');

        // Alt + Left click (button 0)
        fireEvent.mouseDown(viewport, { button: 0, altKey: true, clientX: 100, clientY: 100 });

        // Move
        fireEvent.mouseMove(viewport, { clientX: 150, clientY: 150 });

        expect(mockSetPan).toHaveBeenCalled();
    });

    it('calls onCursorMove when mouse moves', () => {
        render(<CanvasViewport onCursorMove={mockOnCursorMove} />);
        const viewport = screen.getByTestId('canvas-viewport');

        fireEvent.mouseMove(viewport, { clientX: 100, clientY: 100 });
        expect(mockOnCursorMove).toHaveBeenCalled();
    });

    it('calls onCursorMove(null) on mouse leave', () => {
        render(<CanvasViewport onCursorMove={mockOnCursorMove} />);
        const viewport = screen.getByTestId('canvas-viewport');

        fireEvent.mouseLeave(viewport);
        expect(mockOnCursorMove).toHaveBeenCalledWith(null);
    });

    it('prevents context menu', () => {
        render(<CanvasViewport />);
        const viewport = screen.getByTestId('canvas-viewport');
        const preventDefault = jest.fn();

        const event = createEvent.contextMenu(viewport);
        event.preventDefault = preventDefault;

        fireEvent(viewport, event);
        expect(preventDefault).toHaveBeenCalled();
    });

    it('handles background click via onClick (not drag)', () => {
        render(<CanvasViewport />);
        const viewport = screen.getByTestId('canvas-viewport');

        // Mouse down, up without move
        fireEvent.mouseDown(viewport, { button: 0, clientX: 100, clientY: 100 });
        fireEvent.mouseUp(viewport, { button: 0, clientX: 100, clientY: 100 });
        fireEvent.click(viewport, { button: 0 });

        expect(mockHandleBackgroundClick).toHaveBeenCalled();
    });

    it('does not trigger background click if dragged', () => {
        render(<CanvasViewport />);
        const viewport = screen.getByTestId('canvas-viewport');

        // Drag sequence
        fireEvent.mouseDown(viewport, { button: 0, clientX: 100, clientY: 100 });
        fireEvent.mouseMove(viewport, { clientX: 200, clientY: 200 }); // Large move
        fireEvent.mouseUp(viewport);
        fireEvent.click(viewport);

        expect(mockHandleBackgroundClick).not.toHaveBeenCalled();
    });
});
