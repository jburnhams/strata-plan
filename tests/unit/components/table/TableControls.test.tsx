import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TableControls } from '../../../../src/components/table/TableControls';

describe('TableControls', () => {
  const defaultProps = {
    onAutoLayout: jest.fn(),
    searchTerm: '',
    onSearchChange: jest.fn(),
    filterType: 'all' as const,
    onFilterTypeChange: jest.fn(),
  };

  it('renders search and filter controls', () => {
    render(<TableControls {...defaultProps} />);
    expect(screen.getByPlaceholderText('Search rooms...')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText('Re-layout')).toBeInTheDocument();
  });

  it('calls onSearchChange when search input changes', () => {
    render(<TableControls {...defaultProps} />);
    const input = screen.getByPlaceholderText('Search rooms...');
    fireEvent.change(input, { target: { value: 'test' } });
    expect(defaultProps.onSearchChange).toHaveBeenCalledWith('test');
  });

  it('calls onFilterTypeChange when filter type changes', () => {
    render(<TableControls {...defaultProps} />);
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'bedroom' } });
    expect(defaultProps.onFilterTypeChange).toHaveBeenCalledWith('bedroom');
  });

  it('calls onAutoLayout when re-layout button is clicked', () => {
    render(<TableControls {...defaultProps} />);
    const button = screen.getByText('Re-layout');
    fireEvent.click(button);
    expect(defaultProps.onAutoLayout).toHaveBeenCalled();
  });

  it('renders validation errors when present', () => {
    render(
      <TableControls
        {...defaultProps}
        validationSummary={{ errors: 2, warnings: 0 }}
      />
    );
    const badge = screen.getByText('2 Errors');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('text-red-800');
    expect(badge).toHaveClass('bg-red-100');
    expect(screen.queryByText(/Warning/)).not.toBeInTheDocument();
  });

  it('renders validation warnings when present', () => {
    render(
      <TableControls
        {...defaultProps}
        validationSummary={{ errors: 0, warnings: 3 }}
      />
    );
    const badge = screen.getByText('3 Warnings');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('text-yellow-800');
    expect(badge).toHaveClass('bg-yellow-100');
    expect(screen.queryByText(/Error/)).not.toBeInTheDocument();
  });

  it('renders both errors and warnings when present', () => {
    render(
      <TableControls
        {...defaultProps}
        validationSummary={{ errors: 1, warnings: 1 }}
      />
    );
    expect(screen.getByText('1 Error')).toBeInTheDocument();
    expect(screen.getByText('1 Warning')).toBeInTheDocument();
  });

  it('does not render validation badges when count is 0', () => {
    render(
      <TableControls
        {...defaultProps}
        validationSummary={{ errors: 0, warnings: 0 }}
      />
    );
    expect(screen.queryByText(/Error/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Warning/)).not.toBeInTheDocument();
  });

  it('calls onValidationClick when error badge is clicked', () => {
    const onValidationClick = jest.fn();
    render(
      <TableControls
        {...defaultProps}
        validationSummary={{ errors: 1, warnings: 0 }}
        onValidationClick={onValidationClick}
      />
    );
    fireEvent.click(screen.getByText('1 Error'));
    expect(onValidationClick).toHaveBeenCalled();
  });
});
