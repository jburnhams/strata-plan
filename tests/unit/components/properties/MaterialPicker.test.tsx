import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MaterialPicker } from '@/components/properties/MaterialPicker';
import { FLOOR_MATERIALS } from '@/constants/materialConfigs';

describe('MaterialPicker', () => {
  const mockOnChange = jest.fn();
  const mockOnCustomColorChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly for floor materials', () => {
    render(
      <MaterialPicker
        type="floor"
        value="hardwood"
        onChange={mockOnChange}
        onCustomColorChange={mockOnCustomColorChange}
      />
    );

    // Should show category headers
    expect(screen.getByText('wood')).toBeInTheDocument();

    // Should show material names
    expect(screen.getByText('Hardwood Floor')).toBeInTheDocument();

    // Should show custom color input
    expect(screen.getByLabelText('Custom Color')).toBeInTheDocument();
  });

  it('calls onChange when a material is selected', () => {
    render(
      <MaterialPicker
        type="floor"
        value="hardwood"
        onChange={mockOnChange}
        onCustomColorChange={mockOnCustomColorChange}
      />
    );

    const tileButton = screen.getByLabelText('Select Ceramic Tile');
    fireEvent.click(tileButton);

    expect(mockOnChange).toHaveBeenCalledWith('tile-ceramic');
  });

  it('calls onCustomColorChange when color input changes', () => {
    render(
      <MaterialPicker
        type="floor"
        value="hardwood"
        onChange={mockOnChange}
        onCustomColorChange={mockOnCustomColorChange}
      />
    );

    const colorInput = screen.getByLabelText('Custom Color');
    fireEvent.change(colorInput, { target: { value: '#ff0000' } });

    expect(mockOnCustomColorChange).toHaveBeenCalledWith('#ff0000');
  });

  it('highlights the selected material', () => {
    render(
      <MaterialPicker
        type="floor"
        value="hardwood"
        onChange={mockOnChange}
        onCustomColorChange={mockOnCustomColorChange}
      />
    );

    const selectedButton = screen.getByLabelText('Select Hardwood Floor');
    expect(selectedButton).toHaveClass('ring-primary');

    const unselectedButton = screen.getByLabelText('Select Ceramic Tile');
    expect(unselectedButton).not.toHaveClass('ring-primary');
  });

  it('displays custom color in inputs if provided', () => {
    const customColor = '#123456';
    render(
      <MaterialPicker
        type="floor"
        value="hardwood"
        customColor={customColor}
        onChange={mockOnChange}
        onCustomColorChange={mockOnCustomColorChange}
      />
    );

    const colorInput = screen.getByLabelText('Custom Color') as HTMLInputElement;
    expect(colorInput.value).toBe(customColor);

    const textInput = screen.getByPlaceholderText('No custom color') as HTMLInputElement;
    expect(textInput.value).toBe(customColor);
  });

  it('renders wall materials correctly', () => {
    render(
        <MaterialPicker
          type="wall"
          value="drywall-white"
          onChange={mockOnChange}
          onCustomColorChange={mockOnCustomColorChange}
        />
      );

      // Should show standard category (default for walls since they don't have explicit categories in config yet)
      expect(screen.getByText('Standard')).toBeInTheDocument();
      expect(screen.getByText('White Drywall')).toBeInTheDocument();
  });
});
