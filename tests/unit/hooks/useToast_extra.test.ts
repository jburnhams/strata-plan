import { renderHook } from '@testing-library/react';
import { useToast } from '../../../src/hooks/useToast';
import * as useShadcnToast from '../../../src/hooks/use-toast';

jest.mock('../../../src/hooks/use-toast');

describe('useToast wrapper', () => {
  const mockToast = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useShadcnToast.useToast as jest.Mock).mockReturnValue({
      toast: mockToast,
      dismiss: jest.fn(),
      toasts: []
    });
  });

  it('should expose helper methods', () => {
    const { result } = renderHook(() => useToast());

    result.current.toastSuccess('Success', 'desc');
    expect(mockToast).toHaveBeenCalledWith({ variant: 'success', title: 'Success', description: 'desc' });

    result.current.toastError('Error', 'desc');
    expect(mockToast).toHaveBeenCalledWith({ variant: 'error', title: 'Error', description: 'desc' });

    result.current.toastWarning('Warning', 'desc');
    expect(mockToast).toHaveBeenCalledWith({ variant: 'warning', title: 'Warning', description: 'desc' });

    result.current.toastInfo('Info', 'desc');
    expect(mockToast).toHaveBeenCalledWith({ variant: 'default', title: 'Info', description: 'desc' });
  });
});
