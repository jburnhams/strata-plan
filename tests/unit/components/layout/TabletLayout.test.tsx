import React from 'react';
import { render, screen } from '@testing-library/react';
import { TabletLayout } from '@/components/layout/TabletLayout';
import { useUIStore } from '@/stores/uiStore';

// Mock child components
jest.mock('@/components/layout/TopToolbar', () => ({
  TopToolbar: () => <div data-testid="top-toolbar">TopToolbar</div>,
}));
jest.mock('@/components/layout/LeftSidebar', () => ({
  LeftSidebar: () => <div data-testid="left-sidebar">LeftSidebar</div>,
}));
jest.mock('@/components/layout/PropertiesPanel', () => ({
  PropertiesPanel: () => <div data-testid="properties-panel">PropertiesPanel</div>,
}));
jest.mock('@/components/layout/StatusBar', () => ({
  StatusBar: () => <div data-testid="status-bar">StatusBar</div>,
}));

// Mock store
jest.mock('@/stores/uiStore');

describe('TabletLayout', () => {
  beforeEach(() => {
    (useUIStore as unknown as jest.Mock).mockReturnValue({
      toggleSidebar: jest.fn(),
      togglePropertiesPanel: jest.fn(),
      isSidebarOpen: true,
      isPropertiesPanelOpen: false,
    });
  });

  it('renders all layout components', () => {
    render(
      <TabletLayout>
        <div data-testid="content">Content</div>
      </TabletLayout>
    );

    expect(screen.getByTestId('top-toolbar')).toBeInTheDocument();
    expect(screen.getByTestId('left-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('content')).toBeInTheDocument();
    expect(screen.getByTestId('properties-panel')).toBeInTheDocument();
    expect(screen.getByTestId('status-bar')).toBeInTheDocument();
  });
});
