import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { NewProjectDialog } from '../../../../src/components/dialogs/NewProjectDialog';
import { useNavigation } from '../../../../src/hooks/useNavigation';

// Mock dependencies
jest.mock('../../../../src/hooks/useNavigation');

describe('NewProjectDialog', () => {
  const mockCreateProject = jest.fn();
  const mockOnOpenChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigation as jest.Mock).mockReturnValue({
      createProject: mockCreateProject,
    });
  });

  it('renders correctly when open', () => {
    render(<NewProjectDialog open={true} onOpenChange={mockOnOpenChange} />);
    expect(screen.getByText('Create New Project')).toBeInTheDocument();
  });

  it('updates name input', () => {
    render(<NewProjectDialog open={true} onOpenChange={mockOnOpenChange} />);
    const input = screen.getByLabelText('Name');
    fireEvent.change(input, { target: { value: 'Test Project' } });
    expect(input).toHaveValue('Test Project');
  });

  it('creates project on submit', () => {
    render(<NewProjectDialog open={true} onOpenChange={mockOnOpenChange} />);

    // Set name
    const input = screen.getByLabelText('Name');
    fireEvent.change(input, { target: { value: 'New Home' } });

    // Click create
    fireEvent.click(screen.getByText('Create Project'));

    expect(mockCreateProject).toHaveBeenCalledWith('New Home', 'meters');
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('validates empty name', () => {
    render(<NewProjectDialog open={true} onOpenChange={mockOnOpenChange} />);

    // Clear name (default is "My Floorplan")
    const input = screen.getByLabelText('Name');
    fireEvent.change(input, { target: { value: '' } });

    // Button should be disabled
    expect(screen.getByText('Create Project')).toBeDisabled();
  });
});
