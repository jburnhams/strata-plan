import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { EditorToolbar } from '../../../../src/components/editor/EditorToolbar';
import { useToolStore } from '../../../../src/stores/toolStore';

// Mock Tool Store
jest.mock('../../../../src/stores/toolStore', () => ({
  useToolStore: jest.fn(),
}));

// Mock lucide-react
jest.mock('lucide-react', () => ({
  MousePointer2: () => <div data-testid="icon-mouse" />,
  Hand: () => <div data-testid="icon-hand" />,
  BrickWall: () => <div data-testid="icon-wall" />,
  Ruler: () => <div data-testid="icon-ruler" />,
  DoorOpen: () => <div data-testid="icon-door" />,
  AppWindow: () => <div data-testid="icon-window" />,
}));

describe('EditorToolbar', () => {
  const setTool = jest.fn();

  beforeEach(() => {
    (useToolStore as unknown as jest.Mock).mockReturnValue({
      activeTool: 'select',
      setTool,
    });
    setTool.mockClear();
  });

  it('renders all tool buttons', () => {
    render(<EditorToolbar />);

    expect(screen.getByTestId('tool-select')).toBeInTheDocument();
    expect(screen.getByTestId('tool-pan')).toBeInTheDocument();
    expect(screen.getByTestId('tool-wall')).toBeInTheDocument();
    expect(screen.getByTestId('tool-measure')).toBeInTheDocument();
    expect(screen.getByTestId('tool-door')).toBeInTheDocument();
    expect(screen.getByTestId('tool-window')).toBeInTheDocument();
  });

  it('calls setTool when button clicked', () => {
    render(<EditorToolbar />);
    fireEvent.click(screen.getByTestId('tool-pan'));
    expect(setTool).toHaveBeenCalledWith('pan');
  });

  it('responds to keyboard shortcuts', () => {
    render(<EditorToolbar />);

    fireEvent.keyDown(window, { key: 'w' });
    expect(setTool).toHaveBeenCalledWith('wall');

    fireEvent.keyDown(window, { key: 'h' });
    expect(setTool).toHaveBeenCalledWith('pan');
  });

  it('ignores keyboard shortcuts when typing in input', () => {
    render(<EditorToolbar />);

    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    // Dispatch event on input (target will be input)
    fireEvent.keyDown(input, { key: 'w', bubbles: true });

    expect(setTool).not.toHaveBeenCalled();

    document.body.removeChild(input);
  });
});
