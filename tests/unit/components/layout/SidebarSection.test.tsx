import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SidebarSection } from '../../../../src/components/layout/SidebarSection';

// Mock icons
jest.mock('lucide-react', () => ({
  ChevronDown: () => <div data-testid="chevron-down" />,
  ChevronRight: () => <div data-testid="chevron-right" />,
}));

describe('SidebarSection', () => {
  it('renders title and count', () => {
    render(
      <SidebarSection title="Test Section" count={5}>
        <div>Content</div>
      </SidebarSection>
    );
    expect(screen.getByText('Test Section')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('renders children when open', () => {
    render(
      <SidebarSection title="Test Section" defaultOpen={true}>
        <div data-testid="content">Content</div>
      </SidebarSection>
    );
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  it('does not render children when closed', () => {
    render(
      <SidebarSection title="Test Section" defaultOpen={false}>
        <div data-testid="content">Content</div>
      </SidebarSection>
    );
    expect(screen.queryByTestId('content')).not.toBeInTheDocument();
  });

  it('toggles content on click', () => {
    render(
      <SidebarSection title="Test Section" defaultOpen={false}>
        <div data-testid="content">Content</div>
      </SidebarSection>
    );

    const header = screen.getByRole('button');
    fireEvent.click(header);

    expect(screen.getByTestId('content')).toBeInTheDocument();

    fireEvent.click(header);
    expect(screen.queryByTestId('content')).not.toBeInTheDocument();
  });
});
