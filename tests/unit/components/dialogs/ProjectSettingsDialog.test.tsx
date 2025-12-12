import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProjectSettingsDialog } from '../../../../src/components/dialogs/ProjectSettingsDialog';
import { ProjectMetadata } from '../../../../src/types/floorplan';

describe('ProjectSettingsDialog', () => {
  const mockSave = jest.fn().mockResolvedValue(undefined);
  const mockOnOpenChange = jest.fn();

  const mockProject: ProjectMetadata = {
    id: 'p1',
    name: 'My Project',
    updatedAt: new Date('2023-01-01'),
    roomCount: 4,
    totalArea: 100,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with project data', () => {
    render(
      <ProjectSettingsDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        project={mockProject}
        onSave={mockSave}
      />
    );
    expect(screen.getByLabelText('Name')).toHaveValue('My Project');
    expect(screen.getByText('100 m²')).toBeInTheDocument();
  });

  it('calls onSave with updates', async () => {
    render(
      <ProjectSettingsDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        project={mockProject}
        onSave={mockSave}
      />
    );

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'New Name' } });
    fireEvent.click(screen.getByText('Save Changes'));

    await waitFor(() => {
      expect(mockSave).toHaveBeenCalledWith({ name: 'New Name', units: 'meters' });
    });
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });
});
