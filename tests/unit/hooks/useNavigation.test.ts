import { renderHook, act } from '@testing-library/react';
import { useNavigation } from '../../../src/hooks/useNavigation';
import { useFloorplanStore } from '../../../src/stores/floorplanStore';

// Mock dependencies
jest.mock('../../../src/stores/floorplanStore');

describe('useNavigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useFloorplanStore as unknown as jest.Mock).mockImplementation((selector) => {
      // Mock the selector returning basic state or actions
      const state = {
        createFloorplan: jest.fn(),
        setFloorplan: jest.fn(),
      };
      return selector(state);
    });
  });

  it('should initialize with landing view', () => {
    const { result } = renderHook(() => useNavigation());
    expect(result.current.currentView).toBe('landing');
  });

  it('should navigate to different views', () => {
    const { result } = renderHook(() => useNavigation());

    act(() => {
      result.current.navigateTo('projectList');
    });
    expect(result.current.currentView).toBe('projectList');

    act(() => {
      result.current.navigateTo('editor');
    });
    expect(result.current.currentView).toBe('editor');
  });

  it('should create project and navigate to editor', () => {
    const createFloorplanMock = jest.fn();
    (useFloorplanStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({ createFloorplan: createFloorplanMock })
    );

    const { result } = renderHook(() => useNavigation());

    act(() => {
      result.current.createProject('Test Project', 'meters');
    });

    expect(createFloorplanMock).toHaveBeenCalledWith('Test Project', 'meters');
    expect(result.current.currentView).toBe('editor');
  });

  it('should close project and navigate to landing', () => {
    const { result } = renderHook(() => useNavigation());

    // First navigate to editor
    act(() => {
      result.current.navigateTo('editor');
    });

    act(() => {
      result.current.closeProject();
    });

    expect(result.current.currentView).toBe('landing');
  });
});
