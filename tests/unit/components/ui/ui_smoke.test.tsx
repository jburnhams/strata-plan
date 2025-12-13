import React from 'react';
import { render } from '@testing-library/react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../../../../src/components/ui/accordion';
import { Button } from '../../../../src/components/ui/button';
import { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from '../../../../src/components/ui/card';
import { Checkbox } from '../../../../src/components/ui/checkbox';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '../../../../src/components/ui/dialog';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../../../../src/components/ui/dropdown-menu';
import { Input } from '../../../../src/components/ui/input';
import { Label } from '../../../../src/components/ui/label';
import { Progress } from '../../../../src/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '../../../../src/components/ui/radio-group';
import { ScrollArea } from '../../../../src/components/ui/scroll-area';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../../src/components/ui/select';
import { Separator } from '../../../../src/components/ui/separator';
import { Slider } from '../../../../src/components/ui/slider';
import { Switch } from '../../../../src/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../../src/components/ui/tabs';
import { Toast, ToastProvider, ToastViewport } from '../../../../src/components/ui/toast';
import { Toaster } from '../../../../src/components/ui/toaster';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '../../../../src/components/ui/tooltip';

// Mock Radix primitives if needed (some are already mocked in setup or by component mocks)
// Assuming setup.ts handles most.

describe('UI Components Smoke Test', () => {
  it('renders Accordion', () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>Trigger</AccordionTrigger>
          <AccordionContent>Content</AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  });

  it('renders Button', () => {
    render(<Button>Click me</Button>);
  });

  it('renders Card', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Description</CardDescription>
        </CardHeader>
        <CardContent>Content</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>
    );
  });

  it('renders Checkbox', () => {
    render(<Checkbox />);
  });

  it('renders Dialog', () => {
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Title</DialogTitle>
            <DialogDescription>Desc</DialogDescription>
          </DialogHeader>
          <DialogFooter>Footer</DialogFooter>
        </DialogContent>
      </Dialog>
    );
  });

  // DropdownMenu might need Radix mock if not already present
  it('renders DropdownMenu', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  });

  it('renders Input', () => {
    render(<Input />);
  });

  it('renders Label', () => {
    render(<Label>Label</Label>);
  });

  it('renders Progress', () => {
    render(<Progress value={50} />);
  });

  it('renders RadioGroup', () => {
    render(
      <RadioGroup defaultValue="1">
        <RadioGroupItem value="1" />
        <RadioGroupItem value="2" />
      </RadioGroup>
    );
  });

  it('renders ScrollArea', () => {
    render(
      <ScrollArea className="h-[200px] w-[350px] rounded-md border p-4">
        <div>Content</div>
      </ScrollArea>
    );
  });

  it('renders Select', () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1">Item 1</SelectItem>
        </SelectContent>
      </Select>
    );
  });

  it('renders Separator', () => {
    render(<Separator />);
  });

  it('renders Slider', () => {
    render(<Slider defaultValue={[50]} max={100} step={1} />);
  });

  it('renders Switch', () => {
    render(<Switch />);
  });

  it('renders Tabs', () => {
    render(
      <Tabs defaultValue="1">
        <TabsList>
          <TabsTrigger value="1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="1">Content 1</TabsContent>
      </Tabs>
    );
  });

  it('renders Tooltip', () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover</TooltipTrigger>
          <TooltipContent>Tip</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  });
});
