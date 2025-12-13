import React, { useState } from 'react';
import { useNavigation } from '../../hooks/useNavigation';
import { useDialogStore } from '../../stores/dialogStore';
import { DIALOG_NEW_PROJECT, DIALOG_IMPORT } from '../../constants/dialogs';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { SAMPLE_PROJECTS, loadSampleProject } from '../../services/import/samples';
import { useFloorplanStore } from '../../stores/floorplanStore';
import { useToast } from '../../hooks/use-toast';
import { saveProject } from '../../services/storage/projectStorage';
import { ChevronDown, Loader2 } from 'lucide-react';

export function LandingPage() {
  const { createProject, navigateTo } = useNavigation();
  const { openDialog } = useDialogStore();
  const { loadFloorplan } = useFloorplanStore();
  const { toast } = useToast();

  const [isLoadingSample, setIsLoadingSample] = useState(false);

  const handleLoadSample = async (filename: string, name: string) => {
    setIsLoadingSample(true);
    try {
      const floorplan = await loadSampleProject(filename);

      // Update store
      loadFloorplan(floorplan);

      // Save to storage
      await saveProject(floorplan);

      toast({
        title: "Sample Loaded",
        description: `Loaded "${name}" successfully.`,
      });

      // Navigate to editor
      navigateTo('editor');
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to load sample project",
        variant: "destructive",
      });
    } finally {
      setIsLoadingSample(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl w-full bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="p-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">StrataPlan</h1>
          <p className="text-xl text-gray-600 mb-8">
            Create professional 3D floorplans by entering room measurements
          </p>

          <div className="flex flex-col gap-4 max-w-md mx-auto mb-12">
            <Button
              size="lg"
              className="w-full text-lg h-14"
              onClick={() => {
                openDialog(DIALOG_NEW_PROJECT);
              }}
              disabled={isLoadingSample}
            >
              Create New Floorplan
            </Button>

            <div className="flex gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex-1" disabled={isLoadingSample}>
                    {isLoadingSample ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        Try a Demo <ChevronDown className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Sample Projects</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {SAMPLE_PROJECTS.map((sample) => (
                    <DropdownMenuItem
                      key={sample.id}
                      onClick={() => handleLoadSample(sample.filename, sample.name)}
                    >
                      {sample.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="outline"
                className="flex-1"
                onClick={() => openDialog(DIALOG_IMPORT)}
                disabled={isLoadingSample}
              >
                Import File
              </Button>
            </div>
          </div>

          <div className="border-t pt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-700">Recent Projects</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateTo('projectList')}
                disabled={isLoadingSample}
              >
                View All
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              <div className="p-6 border rounded-lg bg-gray-50 text-center text-gray-500">
                No recent projects
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
