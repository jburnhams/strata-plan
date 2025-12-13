import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { LandingPage } from '../../../../src/components/pages/LandingPage';
import { useNavigation } from '../../../../src/hooks/useNavigation';
import { useDialogStore } from '../../../../src/stores/dialogStore';
import { useFloorplanStore } from '../../../../src/stores/floorplanStore';
import { DIALOG_NEW_PROJECT, DIALOG_IMPORT } from '../../../../src/constants/dialogs';
import { loadSampleProject } from '../../../../src/services/import/samples';
import { saveProject } from '../../../../src/services/storage/projectStorage';
import { useToast } from '../../../../src/hooks/use-toast';

// Mock dependencies
jest.mock('../../../../src/hooks/useNavigation');
jest.mock('../../../../src/stores/dialogStore');
jest.mock('../../../../src/stores/floorplanStore');
jest.mock('../../../../src/services/import/samples', () => ({
  SAMPLE_PROJECTS: [
    { id: 'sample-1', name: 'Sample Project 1', filename: 'sample1.json', description: 'Description 1' },
    { id: 'sample-2', name: 'Sample Project 2', filename: 'sample2.json', description: 'Description 2' },
  ],
  loadSampleProject: jest.fn(),
}));
jest.mock('../../../../src/services/storage/projectStorage');
jest.mock('../../../../src/hooks/use-toast');
jest.mock('lucide-react', () => ({
  ChevronDown: () => <div data-testid="chevron-down" />,
  Loader2: () => <div data-testid="loader" />,
}));

// Mock DropdownMenu components to simplify testing
// We mock them as simple divs to avoid dealing with Radix UI portal/trigger logic in unit tests
jest.mock('../../../../src/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => <div data-testid="dropdown-trigger">{children}</div>,
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div data-testid="dropdown-content">{children}</div>,
  DropdownMenuItem: ({ children, onClick }: { children: React.ReactNode; onClick: () => void }) => (
    <div data-testid="dropdown-item" onClick={onClick}>
      {children}
    </div>
  ),
  DropdownMenuLabel: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuSeparator: () => <hr />,
}));

describe('LandingPage', () => {
  const mockCreateProject = jest.fn();
  const mockNavigateTo = jest.fn();
  const mockOpenDialog = jest.fn();
  const mockLoadFloorplan = jest.fn();
  const mockToast = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigation as jest.Mock).mockReturnValue({
      createProject: mockCreateProject,
      navigateTo: mockNavigateTo,
    });
    (useDialogStore as unknown as jest.Mock).mockReturnValue({
      openDialog: mockOpenDialog,
    });
    (useFloorplanStore as unknown as jest.Mock).mockReturnValue({
      loadFloorplan: mockLoadFloorplan,
    });
    (useToast as jest.Mock).mockReturnValue({
      toast: mockToast,
    });
  });

  it('renders correctly', () => {
    render(<LandingPage />);
    expect(screen.getByText('StrataPlan')).toBeInTheDocument();
    expect(screen.getByText('Create New Floorplan')).toBeInTheDocument();
    expect(screen.getByText(/Try a Demo/i)).toBeInTheDocument();
    expect(screen.getByText('Import File')).toBeInTheDocument();
  });

  it('opens new project dialog on click', () => {
    render(<LandingPage />);
    fireEvent.click(screen.getByText('Create New Floorplan'));
    expect(mockOpenDialog).toHaveBeenCalledWith(DIALOG_NEW_PROJECT);
  });

  it('opens import dialog on click', () => {
    render(<LandingPage />);
    fireEvent.click(screen.getByText('Import File'));
    expect(mockOpenDialog).toHaveBeenCalledWith(DIALOG_IMPORT);
  });

  it('navigates to project list on View All', () => {
    render(<LandingPage />);
    fireEvent.click(screen.getByText('View All'));
    expect(mockNavigateTo).toHaveBeenCalledWith('projectList');
  });

  it('renders sample projects in dropdown', () => {
    render(<LandingPage />);
    // Because we mocked DropdownMenu components to always render content,
    // we can query for sample names directly
    expect(screen.getByText('Sample Project 1')).toBeInTheDocument();
    expect(screen.getByText('Sample Project 2')).toBeInTheDocument();
  });

  it('loads sample project when clicked', async () => {
    const mockFloorplan = { id: 'fp-1', name: 'Sample Floorplan' };
    (loadSampleProject as jest.Mock).mockResolvedValue(mockFloorplan);

    render(<LandingPage />);

    // Click the sample item
    fireEvent.click(screen.getByText('Sample Project 1'));

    // Should show loading state
    expect(screen.getByTestId('loader')).toBeInTheDocument();

    await waitFor(() => {
      expect(loadSampleProject).toHaveBeenCalledWith('sample1.json');
      expect(mockLoadFloorplan).toHaveBeenCalledWith(mockFloorplan);
      expect(saveProject).toHaveBeenCalledWith(mockFloorplan);
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Sample Loaded'
      }));
      expect(mockNavigateTo).toHaveBeenCalledWith('editor');
    });
  });

  it('handles sample loading error', async () => {
    (loadSampleProject as jest.Mock).mockRejectedValue(new Error('Failed to load'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<LandingPage />);

    fireEvent.click(screen.getByText('Sample Project 1'));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Error',
        variant: 'destructive'
      }));
    });

    consoleSpy.mockRestore();
  });
});
