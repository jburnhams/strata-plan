import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProjectListPage } from '../../../../src/components/pages/ProjectListPage';
import { useNavigation } from '../../../../src/hooks/useNavigation';
import { useProjectList } from '../../../../src/hooks/useProjectList';
import { useDialogStore } from '../../../../src/stores/dialogStore';
import { DIALOG_NEW_PROJECT } from '../../../../src/constants/dialogs';

// Mock dependencies
jest.mock('../../../../src/hooks/useNavigation');
jest.mock('../../../../src/hooks/useProjectList');
jest.mock('../../../../src/stores/dialogStore');

describe('ProjectListPage', () => {
  const mockNavigateTo = jest.fn();
  const mockRefreshProjects = jest.fn();
  const mockOpenDialog = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigation as jest.Mock).mockReturnValue({
      navigateTo: mockNavigateTo,
      openProject: jest.fn(),
    });
    (useProjectList as jest.Mock).mockReturnValue({
      projects: [],
      refresh: mockRefreshProjects, // Changed from refreshProjects to refresh
      reload: mockRefreshProjects, // And reload alias if used
      loading: false,
      error: null,
    });
    (useDialogStore as unknown as jest.Mock).mockReturnValue({
      openDialog: mockOpenDialog,
    });
  });

  it('renders correctly', () => {
    render(<ProjectListPage />);
    expect(screen.getByText('All Projects')).toBeInTheDocument();
  });

  it('navigates back to landing', () => {
    render(<ProjectListPage />);
    fireEvent.click(screen.getByText('← Back'));
    expect(mockNavigateTo).toHaveBeenCalledWith('landing');
  });

  it('opens new project dialog', () => {
    render(<ProjectListPage />);
    fireEvent.click(screen.getByText('New Project'));
    expect(mockOpenDialog).toHaveBeenCalledWith(DIALOG_NEW_PROJECT);
  });
});
