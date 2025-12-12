import { renderHook, act } from '@testing-library/react';
import { useRoomInteraction } from '../../../src/hooks/useRoomInteraction';
import { useFloorplanStore } from '../../../src/stores/floorplanStore';

// Mock the store
jest.mock('../../../src/stores/floorplanStore', () => ({
  useFloorplanStore: jest.fn(),
}));

describe('useRoomInteraction', () => {
  const mockSelectRoom = jest.fn();
  const mockClearSelection = jest.fn();
  const mockEditorMode = 'select';

  beforeEach(() => {
    jest.clearAllMocks();

    (useFloorplanStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = {
        selectRoom: mockSelectRoom,
        clearSelection: mockClearSelection,
        editorMode: mockEditorMode,
      };
      return selector(state);
    });
  });

  it('handleBackgroundClick calls clearSelection', () => {
    const { result } = renderHook(() => useRoomInteraction());

    const mockEvent = {
      preventDefault: jest.fn(),
      stopPropagation: jest.fn(),
    } as unknown as React.MouseEvent;

    result.current.handleBackgroundClick(mockEvent);

    expect(mockClearSelection).toHaveBeenCalled();
  });
});
