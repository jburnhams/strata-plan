import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DeleteProjectDialog } from '../../../../src/components/dialogs/DeleteProjectDialog';

describe('DeleteProjectDialog', () => {
  const mockDelete = jest.fn().mockResolvedValue(undefined);
  const mockOnOpenChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    render(
      <DeleteProjectDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        projectName="Test Project"
        onDelete={mockDelete}
      />
    );
    expect(screen.getByText(/Test Project/)).toBeInTheDocument();
    // Use getAllByText because title and button share the text
    expect(screen.getAllByText('Delete Project')).toHaveLength(2);
  });

  it('calls onDelete when confirmed', async () => {
    render(
      <DeleteProjectDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        projectName="Test Project"
        onDelete={mockDelete}
      />
    );

    // Click the button, not the title
    fireEvent.click(screen.getByRole('button', { name: 'Delete Project' }));

    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalled();
    });
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });
});
