import React from 'react';
import { render, screen } from '@testing-library/react';
import { Toaster } from '@/components/ui/toaster';
import * as useToastHook from '@/hooks/use-toast';
import '@testing-library/jest-dom';

// Mock useToast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn(),
}));

describe('Toaster', () => {
  it('renders toasts', () => {
    (useToastHook.useToast as jest.Mock).mockReturnValue({
      toasts: [
        {
          id: '1',
          title: 'Test Toast',
          description: 'Description',
          open: true,
          action: null,
        },
      ],
    });

    render(<Toaster />);
    expect(screen.getByText('Test Toast')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
  });
});
