import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LandingPage } from '../../../../src/components/pages/LandingPage';
import { useNavigation } from '../../../../src/hooks/useNavigation';
import { useDialogStore } from '../../../../src/stores/dialogStore';
import { DIALOG_NEW_PROJECT } from '../../../../src/constants/dialogs';

// Mock dependencies
jest.mock('../../../../src/hooks/useNavigation');
jest.mock('../../../../src/stores/dialogStore');

describe('LandingPage', () => {
  const mockCreateProject = jest.fn();
  const mockNavigateTo = jest.fn();
  const mockOpenDialog = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigation as jest.Mock).mockReturnValue({
      createProject: mockCreateProject,
      navigateTo: mockNavigateTo,
    });
    (useDialogStore as unknown as jest.Mock).mockReturnValue({
      openDialog: mockOpenDialog,
    });
  });

  it('renders correctly', () => {
    render(<LandingPage />);
    expect(screen.getByText('StrataPlan')).toBeInTheDocument();
    expect(screen.getByText('Create New Floorplan')).toBeInTheDocument();
  });

  it('navigates to create project on click', () => {
    render(<LandingPage />);
    fireEvent.click(screen.getByText('Create New Floorplan'));
    // Updated expectation: It opens the dialog now
    expect(mockOpenDialog).toHaveBeenCalledWith(DIALOG_NEW_PROJECT);
  });

  it('navigates to demo project', () => {
    render(<LandingPage />);
    fireEvent.click(screen.getByText('Try Demo'));
    expect(mockCreateProject).toHaveBeenCalledWith('Demo Project', 'meters');
  });

  it('navigates to project list', () => {
    render(<LandingPage />);
    fireEvent.click(screen.getByText('View All'));
    expect(mockNavigateTo).toHaveBeenCalledWith('projectList');
  });
});
