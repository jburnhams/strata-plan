import React from 'react';
import { ProjectMetadata } from '../../types/floorplan';
import { Card, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { MoreHorizontal, FileText, Calendar, Maximize2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../ui/dropdown-menu';

interface ProjectCardProps {
  project: ProjectMetadata;
  onOpen: () => void;
  onRename: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onExport: () => void;
}

export function ProjectCard({
  project,
  onOpen,
  onRename,
  onDuplicate,
  onDelete,
  onExport,
}: ProjectCardProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date));
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow group relative">
      <div
        className="aspect-[4/3] bg-gray-100 relative cursor-pointer group-hover:opacity-95 transition-opacity"
        onClick={onOpen}
      >
        {project.thumbnailDataUrl ? (
          <img
            src={project.thumbnailDataUrl}
            alt={project.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <FileText size={48} />
          </div>
        )}

        {/* Hover overlay with quick open button */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
            <Button variant="secondary" size="sm" className="shadow-sm">
                Open Project
            </Button>
        </div>
      </div>

      <CardContent className="p-4 pb-2">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-semibold truncate flex-1" title={project.name}>
            {project.name}
          </h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 -mt-1 -mr-2">
                <MoreHorizontal size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onOpen}>Open</DropdownMenuItem>
              <DropdownMenuItem onClick={onRename}>Rename</DropdownMenuItem>
              <DropdownMenuItem onClick={onDuplicate}>Duplicate</DropdownMenuItem>
              <DropdownMenuItem onClick={onExport}>Export...</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onDelete}
                className="text-red-600 focus:text-red-600 focus:bg-red-50"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 text-xs text-gray-500 flex justify-between">
        <div className="flex items-center gap-1">
          <Maximize2 size={12} />
          <span>{project.roomCount} rooms</span>
          <span>•</span>
          <span>{project.totalArea} m²</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar size={12} />
          <span>{formatDate(project.updatedAt)}</span>
        </div>
      </CardFooter>
    </Card>
  );
}
