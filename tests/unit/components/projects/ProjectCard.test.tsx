import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProjectCard } from '../../../../src/components/projects/ProjectCard';
import { ProjectMetadata } from '../../../../src/types/floorplan';

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  MoreHorizontal: () => <div data-testid="more-icon" />,
  FileText: () => <div data-testid="file-icon" />,
  Calendar: () => <div data-testid="calendar-icon" />,
  Maximize2: () => <div data-testid="maximize-icon" />,
}));

// Mock Dropdown Menu parts (Radix UI often needs mocking or special handling)
// But since we are using the shadcn wrapper, we might just need to rely on standard queries
// If Radix causes issues, we'll mock the UI components.

describe('ProjectCard', () => {
  const mockProject: ProjectMetadata = {
    id: 'p1',
    name: 'Test Project',
    updatedAt: new Date('2023-01-01'),
    roomCount: 5,
    totalArea: 100,
    thumbnailDataUrl: 'data:image/png;base64,fake',
  };

  const mockHandlers = {
    onOpen: jest.fn(),
    onRename: jest.fn(),
    onDuplicate: jest.fn(),
    onDelete: jest.fn(),
    onExport: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders project details correctly', () => {
    render(<ProjectCard project={mockProject} {...mockHandlers} />);
    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText('5 rooms')).toBeInTheDocument();
    expect(screen.getByText('100 m²')).toBeInTheDocument();
    expect(screen.getByAltText('Test Project')).toHaveAttribute('src', mockProject.thumbnailDataUrl);
  });

  it('calls onOpen when clicked', () => {
    render(<ProjectCard project={mockProject} {...mockHandlers} />);
    // The image container is clickable
    fireEvent.click(screen.getByAltText('Test Project').closest('div')!);
    expect(mockHandlers.onOpen).toHaveBeenCalled();
  });

  // Note: Testing the dropdown menu usually requires integration tests or advanced user-event
  // because of how Radix UI portals the menu content.
  // We will trust the integration test for the menu actions.
});
