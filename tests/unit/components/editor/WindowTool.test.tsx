import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { WindowTool } from '../../../../src/components/editor/WindowTool';
import { useWindowPlacement } from '../../../../src/hooks/useWindowPlacement';
import { Position2D } from '../../../../src/types';

// Mock hook
jest.mock('../../../../src/hooks/useWindowPlacement');
const mockUseWindowPlacement = useWindowPlacement as jest.Mock;

describe('WindowTool', () => {
  const mockHandleMouseMove = jest.fn();
  const mockHandleClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when not active', () => {
    mockUseWindowPlacement.mockReturnValue({
      isActive: false,
      hoveredWall: null,
      isValid: false,
      handleMouseMove: mockHandleMouseMove,
      handleClick: mockHandleClick,
    });

    const { container } = render(<WindowTool cursorPosition={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when active but no wall hovered', () => {
    mockUseWindowPlacement.mockReturnValue({
      isActive: true,
      hoveredWall: null,
      isValid: false,
      handleMouseMove: mockHandleMouseMove,
      handleClick: mockHandleClick,
    });

    const { container } = render(<WindowTool cursorPosition={{ x: 0, z: 0 }} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders window preview when active and hovering wall', () => {
    mockUseWindowPlacement.mockReturnValue({
      isActive: true,
      hoveredWall: {
        roomId: 'room1',
        wall: { from: { x: 0, z: 0 }, to: { x: 10, z: 0 }, wallSide: 'north' },
        position: 0.5,
      },
      isValid: true,
      handleMouseMove: mockHandleMouseMove,
      handleClick: mockHandleClick,
    });

    // Wrap in svg because WindowTool returns <g>
    const { container } = render(
      <svg>
        <WindowTool cursorPosition={{ x: 5, z: 0 }} />
      </svg>
    );

    expect(container.querySelector('g')).toBeInTheDocument();
    // Check for frame rects
    expect(container.querySelectorAll('rect').length).toBe(2);
    // Check for glass/divider lines
    expect(container.querySelectorAll('line').length).toBe(2);
  });

  it('calls handleMouseMove on cursor update', () => {
    mockUseWindowPlacement.mockReturnValue({
      isActive: true,
      hoveredWall: null,
      isValid: false,
      handleMouseMove: mockHandleMouseMove,
      handleClick: mockHandleClick,
    });

    const cursorPosition = { x: 10, z: 20 };
    render(
      <svg>
        <WindowTool cursorPosition={cursorPosition} />
      </svg>
    );

    expect(mockHandleMouseMove).toHaveBeenCalledWith(cursorPosition);
  });

  it('calls handleClick on valid mouse up', () => {
    mockUseWindowPlacement.mockReturnValue({
      isActive: true,
      hoveredWall: {
        roomId: 'room1',
        wall: { from: { x: 0, z: 0 }, to: { x: 10, z: 0 }, wallSide: 'north' },
        position: 0.5,
      },
      isValid: true,
      handleMouseMove: mockHandleMouseMove,
      handleClick: mockHandleClick,
    });

    render(
      <svg>
        <WindowTool cursorPosition={null} />
      </svg>
    );

    // Simulate mouseup on window
    const event = new MouseEvent('mouseup', { button: 0 });
    fireEvent(window, event);

    expect(mockHandleClick).toHaveBeenCalled();
  });

  it('does not call handleClick if invalid', () => {
    mockUseWindowPlacement.mockReturnValue({
      isActive: true,
      hoveredWall: {
        roomId: 'room1',
        wall: { from: { x: 0, z: 0 }, to: { x: 10, z: 0 }, wallSide: 'north' },
        position: 0.5,
      },
      isValid: false, // Invalid
      handleMouseMove: mockHandleMouseMove,
      handleClick: mockHandleClick,
    });

    render(
      <svg>
        <WindowTool cursorPosition={null} />
      </svg>
    );

    const event = new MouseEvent('mouseup', { button: 0 });
    fireEvent(window, event);

    expect(mockHandleClick).not.toHaveBeenCalled();
  });
});
