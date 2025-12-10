import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { NewProjectDialog } from '@/components/dialogs/NewProjectDialog';
import { useDialog } from '@/hooks/useDialog';
import userEvent from '@testing-library/user-event';

jest.mock('@/hooks/useDialog');

// Mock PointerEvent for Radix UI
// @ts-ignore
window.PointerEvent = class PointerEvent extends Event {
  constructor(type: string, props: any) {
    super(type, props);
  }
};

describe('NewProjectDialog', () => {
  const mockClose = jest.fn();

  beforeEach(() => {
    (useDialog as jest.Mock).mockReturnValue({
      isOpen: true,
      closeDialog: mockClose,
      openDialog: jest.fn(),
    });
    mockClose.mockClear();
  });

  it('renders correctly when open', () => {
    render(<NewProjectDialog />);
    expect(screen.getByRole('heading', { name: 'New Project' })).toBeInTheDocument();
  });

  it('validates name input', async () => {
    const user = userEvent.setup();
    render(<NewProjectDialog />);

    const createButton = screen.getByRole('button', { name: /create project/i });
    expect(createButton).toBeDisabled();

    const input = screen.getByLabelText(/name/i);
    await user.type(input, 'My Project');

    expect(createButton).toBeEnabled();
  });

  it('calls closeDialog on cancel', async () => {
    const user = userEvent.setup();
    render(<NewProjectDialog />);

    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(mockClose).toHaveBeenCalled();
  });
});
