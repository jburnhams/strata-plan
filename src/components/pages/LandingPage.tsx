import React from 'react';
import { useNavigation } from '../../hooks/useNavigation';
import { useDialogStore } from '../../stores/dialogStore';
import { DIALOG_NEW_PROJECT } from '../../constants/dialogs';
import { Button } from '../ui/button';

export function LandingPage() {
  const { createProject, navigateTo } = useNavigation();
  const { openDialog } = useDialogStore();

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
            >
              Create New Floorplan
            </Button>

            <div className="flex gap-4">
              <Button variant="outline" className="flex-1" onClick={() => createProject('Demo Project', 'meters')}>
                Try Demo
              </Button>
              <Button variant="outline" className="flex-1">
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
