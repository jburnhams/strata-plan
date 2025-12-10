import React from 'react';
import { render, screen } from '@testing-library/react';
import { Toaster } from '../../../../src/components/ui/toaster';
import { useToast } from '../../../../src/hooks/use-toast';

// Mock useToast hook
jest.mock('../../../../src/hooks/use-toast', () => ({
  useToast: jest.fn(),
}));

// Mock icons
jest.mock('lucide-react', () => ({
  Check: () => <div data-testid="icon-check" />,
  Info: () => <div data-testid="icon-info" />,
  TriangleAlert: () => <div data-testid="icon-warning" />,
  CircleX: () => <div data-testid="icon-error" />,
}));

// Mock Toast components
jest.mock('../../../../src/components/ui/toast', () => ({
  ToastProvider: ({ children }: any) => <div data-testid="toast-provider">{children}</div>,
  Toast: ({ children, variant }: any) => <div data-testid={`toast-${variant}`}>{children}</div>,
  ToastTitle: ({ children }: any) => <div>{children}</div>,
  ToastDescription: ({ children }: any) => <div>{children}</div>,
  ToastClose: () => <button>Close</button>,
  ToastViewport: () => <div data-testid="toast-viewport" />,
}));

describe('Toaster', () => {
  it('renders nothing when no toasts', () => {
    (useToast as jest.Mock).mockReturnValue({ toasts: [] });
    render(<Toaster />);
    expect(screen.getByTestId('toast-provider')).toBeInTheDocument();
    expect(screen.queryByTestId('toast-success')).not.toBeInTheDocument();
    expect(screen.queryByTestId('toast-default')).not.toBeInTheDocument();
  });

  it('renders success toast', () => {
    (useToast as jest.Mock).mockReturnValue({
      toasts: [{ id: '1', title: 'Success', description: 'Done', variant: 'success' }]
    });
    render(<Toaster />);
    expect(screen.getByTestId('toast-success')).toBeInTheDocument();
    expect(screen.getByTestId('icon-check')).toBeInTheDocument();
    expect(screen.getByText('Success')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  it('renders warning toast', () => {
    (useToast as jest.Mock).mockReturnValue({
      toasts: [{ id: '1', title: 'Warning', variant: 'warning' }]
    });
    render(<Toaster />);
    expect(screen.getByTestId('toast-warning')).toBeInTheDocument();
    expect(screen.getByTestId('icon-warning')).toBeInTheDocument();
  });

  it('renders error toast', () => {
    (useToast as jest.Mock).mockReturnValue({
      toasts: [{ id: '1', title: 'Error', variant: 'error' }]
    });
    render(<Toaster />);
    expect(screen.getByTestId('toast-error')).toBeInTheDocument();
    expect(screen.getByTestId('icon-error')).toBeInTheDocument();
  });

  it('renders destructive toast', () => {
    (useToast as jest.Mock).mockReturnValue({
        toasts: [{ id: '1', title: 'Destructive', variant: 'destructive' }]
    });
    render(<Toaster />);
    expect(screen.getByTestId('toast-destructive')).toBeInTheDocument();
    expect(screen.getByTestId('icon-error')).toBeInTheDocument();
  });

  it('renders default toast', () => {
    (useToast as jest.Mock).mockReturnValue({
      toasts: [{ id: '1', title: 'Info', variant: 'default' }]
    });
    render(<Toaster />);
    expect(screen.getByTestId('toast-default')).toBeInTheDocument();
    expect(screen.getByTestId('icon-info')).toBeInTheDocument();
  });
});
