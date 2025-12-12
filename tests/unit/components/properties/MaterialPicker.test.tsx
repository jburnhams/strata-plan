import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MaterialPicker } from '@/components/properties/MaterialPicker';
import { FloorMaterialConfig } from '@/types/materials';

// Mock dependencies
jest.mock('@/components/ui/scroll-area', () => ({
  ScrollArea: ({ children, className }: any) => <div className={className}>{children}</div>
}));

jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children, defaultValue, className }: any) => <div data-testid="tabs" data-default={defaultValue} className={className}>{children}</div>,
  TabsList: ({ children, className }: any) => <div className={className}>{children}</div>,
  TabsTrigger: ({ children, value, onClick }: any) => (
    <button onClick={onClick} data-value={value}>{children}</button>
  ),
  TabsContent: ({ children, value }: any) => <div data-content-value={value}>{children}</div>,
}));

describe('MaterialPicker', () => {
  const mockMaterials: Record<string, FloorMaterialConfig> = {
    'wood-oak': {
      id: 'wood-oak',
      name: 'Oak Wood',
      category: 'wood',
      defaultColor: '#8B5A2B',
      roughness: 0.5,
      reflectivity: 0.1
    } as any, // casting to avoid strict typing issues in tests if full type not matched
    'tile-white': {
      id: 'tile-white',
      name: 'White Tile',
      category: 'tile',
      defaultColor: '#FFFFFF',
      roughness: 0.2,
      reflectivity: 0.5
    } as any
  };

  const defaultProps = {
    type: 'floor' as const,
    value: 'wood-oak',
    materials: mockMaterials,
    onChange: jest.fn(),
    onCustomColorChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with categories', () => {
    render(<MaterialPicker {...defaultProps} />);

    expect(screen.getByText('Floor Material')).toBeInTheDocument();
    // Check if category tabs are rendered
    expect(screen.getByText('Wood')).toBeInTheDocument();
    expect(screen.getByText('Tile')).toBeInTheDocument();
  });

  it('renders material options within categories', () => {
    render(<MaterialPicker {...defaultProps} />);

    // We mocked TabsContent to just render, so we should see both materials if we rendered all tabs
    // Note: Radix Tabs usually only render active content. Our mock renders all for simplicity or we need to simulate state.
    // However, our mock implementation above simply outputs divs. To test real interaction we need a better mock or just check existence.
    // In our mock: <div data-content-value={value}>{children}</div>
    // So both contents are in the DOM.

    expect(screen.getByText('Oak Wood')).toBeInTheDocument();
    expect(screen.getByText('White Tile')).toBeInTheDocument();
  });

  it('calls onChange when a material is selected', () => {
    render(<MaterialPicker {...defaultProps} />);

    const oakButton = screen.getByLabelText('Select Oak Wood');
    fireEvent.click(oakButton);

    expect(defaultProps.onChange).toHaveBeenCalledWith('wood-oak');
  });

  it('displays custom color indicator if provided', () => {
    render(<MaterialPicker {...defaultProps} customColor="#FF0000" />);

    expect(screen.getByText('Custom Color')).toBeInTheDocument();
    // Verification of the color dot color is hard with inline styles in JSDOM sometimes, but we can try
    // The button has a child div with the style.
  });
});
