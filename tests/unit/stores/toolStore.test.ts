import { act } from '@testing-library/react';
import { useToolStore } from '../../../src/stores/toolStore';

describe('toolStore', () => {
  it('has default tool as select', () => {
    expect(useToolStore.getState().activeTool).toBe('select');
  });

  it('sets tool correctly', () => {
    const { setTool } = useToolStore.getState();

    act(() => {
      setTool('wall');
    });

    expect(useToolStore.getState().activeTool).toBe('wall');
  });
});
