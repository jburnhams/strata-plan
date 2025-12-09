import React from 'react';
import { render, screen } from '@testing-library/react';
import { Switch } from '@/components/ui/switch';
import userEvent from '@testing-library/user-event';

describe('Switch component', () => {
  it('renders correctly', () => {
    render(<Switch />);
    const switchEl = screen.getByRole('switch');
    expect(switchEl).toBeInTheDocument();
  });

  it('toggles state on click', async () => {
    const user = userEvent.setup();
    render(<Switch />);
    const switchEl = screen.getByRole('switch');

    expect(switchEl).not.toBeChecked();
    await user.click(switchEl);
    expect(switchEl).toBeChecked();
    await user.click(switchEl);
    expect(switchEl).not.toBeChecked();
  });

  it('can be disabled', () => {
    render(<Switch disabled />);
    const switchEl = screen.getByRole('switch');
    expect(switchEl).toBeDisabled();
  });
});
