import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectGroup,
} from '@/components/ui/select';
import '@testing-library/jest-dom';

describe('Select', () => {
  it('renders trigger', () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
            <SelectGroup>
                <SelectLabel>Fruits</SelectLabel>
                <SelectItem value="apple">Apple</SelectItem>
            </SelectGroup>
        </SelectContent>
      </Select>
    );

    expect(screen.getByText('Select an option')).toBeInTheDocument();
  });
});
