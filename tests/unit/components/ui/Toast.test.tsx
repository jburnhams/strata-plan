import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  Toast,
  ToastProvider,
  ToastViewport,
  ToastTitle,
  ToastDescription,
  ToastAction,
  ToastClose,
} from '@/components/ui/toast';
import '@testing-library/jest-dom';

describe('Toast Component', () => {
  it('renders correctly', () => {
    render(
      <ToastProvider>
        <Toast>
          <ToastTitle>Title</ToastTitle>
          <ToastDescription>Description</ToastDescription>
          <ToastAction altText="Action">Action</ToastAction>
          <ToastClose />
        </Toast>
        <ToastViewport />
      </ToastProvider>
    );

    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
  });
});
