import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '../../../../src/components/ui/tooltip';

// Mock ResizeObserver for Radix UI
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('Tooltip', () => {
  it('renders tooltip on hover', async () => {
    const user = userEvent.setup();
    render(
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Tooltip Content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

    expect(screen.queryByText('Tooltip Content')).not.toBeInTheDocument();

    await user.hover(screen.getByText('Hover me'));

    // Wait for tooltip
    expect(await screen.findByRole('tooltip', { hidden: true })).toHaveTextContent('Tooltip Content');
  });
});
