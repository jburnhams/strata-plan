import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Canvas2D } from '../../../../src/components/editor/Canvas2D';

// Mocks
jest.mock('../../../../src/components/editor/CanvasViewport', () => ({
  CanvasViewport: ({ children, onCursorMove }: any) => (
    <div data-testid="mock-viewport" onMouseMove={() => onCursorMove && onCursorMove({ x: 1, z: 1 })}>
      {children}
    </div>
  ),
}));
jest.mock('../../../../src/components/editor/RoomLayer', () => ({
  RoomLayer: () => <div data-testid="mock-room-layer" />,
}));
jest.mock('../../../../src/components/editor/Grid', () => ({
  Grid: () => <div data-testid="mock-grid" />,
}));
jest.mock('../../../../src/components/editor/ConnectionLines', () => ({
  ConnectionLines: () => <div data-testid="mock-connections" />,
}));
jest.mock('../../../../src/components/editor/SelectionOverlay', () => ({
  SelectionOverlay: () => <div data-testid="mock-selection" />,
}));
jest.mock('../../../../src/components/editor/SnapIndicator', () => ({
  SnapIndicator: ({ cursorPosition }: any) => (
    <div data-testid="mock-snap-indicator" data-pos={JSON.stringify(cursorPosition)} />
  ),
}));
jest.mock('../../../../src/components/editor/EditorToolbar', () => ({
  EditorToolbar: () => <div data-testid="mock-toolbar" />,
}));

describe('Canvas2D', () => {
  it('renders all child components', () => {
    render(<Canvas2D />);

    expect(screen.getByTestId('mock-toolbar')).toBeInTheDocument();
    expect(screen.getByTestId('mock-viewport')).toBeInTheDocument();
    expect(screen.getByTestId('mock-grid')).toBeInTheDocument();
    expect(screen.getByTestId('mock-connections')).toBeInTheDocument();
    expect(screen.getByTestId('mock-room-layer')).toBeInTheDocument();
    expect(screen.getByTestId('mock-selection')).toBeInTheDocument();
    expect(screen.getByTestId('mock-snap-indicator')).toBeInTheDocument();
  });

  it('passes cursor position from Viewport to SnapIndicator', () => {
    render(<Canvas2D />);

    const viewport = screen.getByTestId('mock-viewport');
    // Simulate move to trigger callback
    fireEvent.mouseMove(viewport);

    const snapIndicator = screen.getByTestId('mock-snap-indicator');
    expect(snapIndicator).toHaveAttribute('data-pos', JSON.stringify({ x: 1, z: 1 }));
  });
});
