import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RenameProjectDialog } from '../../../../src/components/dialogs/RenameProjectDialog';

describe('RenameProjectDialog', () => {
  const mockRename = jest.fn().mockResolvedValue(undefined);
  const mockOnOpenChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with current name', () => {
    render(
      <RenameProjectDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        currentName="Old Name"
        onRename={mockRename}
      />
    );
    expect(screen.getByLabelText('Name')).toHaveValue('Old Name');
  });

  it('calls onRename when submitted', async () => {
    render(
      <RenameProjectDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        currentName="Old Name"
        onRename={mockRename}
      />
    );

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'New Name' } });
    fireEvent.click(screen.getByText('Rename'));

    await waitFor(() => {
      expect(mockRename).toHaveBeenCalledWith('New Name');
    });
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });
});
