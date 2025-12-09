import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SidebarSection } from '@/components/layout/SidebarSection';

describe('SidebarSection', () => {
  it('renders correctly with title and children', () => {
    render(
      <SidebarSection title="Test Section">
        <div>Content</div>
      </SidebarSection>
    );

    expect(screen.getByText('Test Section')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('toggles content visibility when clicked', () => {
    render(
      <SidebarSection title="Test Section">
        <div>Content</div>
      </SidebarSection>
    );

    const button = screen.getByRole('button');

    // Initially open (default)
    expect(screen.getByText('Content')).toBeVisible();

    // Click to close
    fireEvent.click(button);
    expect(screen.queryByText('Content')).not.toBeInTheDocument();

    // Click to open
    fireEvent.click(button);
    expect(screen.getByText('Content')).toBeVisible();
  });

  it('renders count badge when count > 0', () => {
    render(
      <SidebarSection title="Test Section" count={5}>
        <div>Content</div>
      </SidebarSection>
    );

    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('does not render count badge when count is 0', () => {
    render(
      <SidebarSection title="Test Section" count={0}>
        <div>Content</div>
      </SidebarSection>
    );

    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('respects defaultOpen prop', () => {
    render(
      <SidebarSection title="Test Section" defaultOpen={false}>
        <div>Content</div>
      </SidebarSection>
    );

    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });
});
