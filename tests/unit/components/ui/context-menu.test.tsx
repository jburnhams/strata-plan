import React from 'react';
import { render } from '@testing-library/react';
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuLabel,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuRadioGroup,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
  ContextMenuShortcut
} from '../../../../src/components/ui/context-menu';

// Mock Radix UI Context Menu primitive
// Shadcn wraps these.
// We need to mock the primitive to avoid ResizeObserver errors and pointer events issues in JSDOM
jest.mock('@radix-ui/react-context-menu', () => ({
  Root: ({ children }: any) => <div>{children}</div>,
  Trigger: ({ children, ...props }: any) => <div data-testid="trigger" {...props}>{children}</div>,
  Content: ({ children, ...props }: any) => <div data-testid="content" {...props}>{children}</div>,
  Item: ({ children, ...props }: any) => <div data-testid="item" {...props}>{children}</div>,
  Separator: ({ ...props }: any) => <div data-testid="separator" {...props} />,
  Label: ({ children, ...props }: any) => <div data-testid="label" {...props}>{children}</div>,
  CheckboxItem: ({ children, ...props }: any) => <div data-testid="checkbox-item" {...props}>{children}</div>,
  RadioItem: ({ children, ...props }: any) => <div data-testid="radio-item" {...props}>{children}</div>,
  RadioGroup: ({ children, ...props }: any) => <div data-testid="radio-group" {...props}>{children}</div>,
  Sub: ({ children }: any) => <div>{children}</div>,
  SubTrigger: ({ children, ...props }: any) => <div data-testid="sub-trigger" {...props}>{children}</div>,
  SubContent: ({ children, ...props }: any) => <div data-testid="sub-content" {...props}>{children}</div>,
  Portal: ({ children }: any) => <div>{children}</div>,
  ItemIndicator: ({ children }: any) => <span>{children}</span>,
}));

describe('ContextMenu UI', () => {
  it('renders all components without crashing', () => {
    render(
      <ContextMenu>
        <ContextMenuTrigger>Right click here</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Item 1</ContextMenuItem>
          <ContextMenuItem disabled>Item 2</ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuLabel>Label</ContextMenuLabel>
          <ContextMenuCheckboxItem checked>Checkbox</ContextMenuCheckboxItem>
          <ContextMenuRadioGroup value="1">
             <ContextMenuRadioItem value="1">Radio 1</ContextMenuRadioItem>
             <ContextMenuRadioItem value="2">Radio 2</ContextMenuRadioItem>
          </ContextMenuRadioGroup>
          <ContextMenuSub>
            <ContextMenuSubTrigger>Sub Menu</ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuItem>Sub Item</ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
          <ContextMenuItem>
            Save <ContextMenuShortcut>⌘S</ContextMenuShortcut>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );
  });
});
