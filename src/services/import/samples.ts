import { Floorplan } from '../../types';
import { validateImportedFloorplan } from './validation';

export interface SampleProject {
  id: string;
  name: string;
  description: string;
  filename: string;
  image?: string;
}

export const SAMPLE_PROJECTS: SampleProject[] = [
  {
    id: 'sample-studio',
    name: 'Studio Apartment',
    description: 'A compact living space with attached bathroom.',
    filename: 'studio-apartment.json'
  },
  {
    id: 'sample-2bed',
    name: 'Two Bedroom Apartment',
    description: 'Family apartment with living area, kitchen, and two bedrooms.',
    filename: 'two-bedroom.json'
  },
  {
    id: 'sample-office',
    name: 'Office Space',
    description: 'Open plan office layout with meeting rooms.',
    filename: 'office-space.json'
  }
];

/**
 * Loads a sample project from the public folder.
 *
 * @param filename The filename of the sample project
 * @returns Promise resolving to the floorplan
 */
export async function loadSampleProject(filename: string): Promise<Floorplan> {
  try {
    const response = await fetch(`/samples/${filename}`);

    if (!response.ok) {
      throw new Error(`Failed to load sample project: ${response.statusText}`);
    }

    const data = await response.json();

    // Validate the sample
    const validation = validateImportedFloorplan(data);
    if (!validation.valid) {
      throw new Error(`Sample project validation failed: ${validation.errors.join(', ')}`);
    }

    // Parse dates
    const floorplan = data as Floorplan;
    floorplan.createdAt = new Date(floorplan.createdAt);
    floorplan.updatedAt = new Date(floorplan.updatedAt);

    return floorplan;
  } catch (error) {
    console.error(`Error loading sample ${filename}:`, error);
    throw error;
  }
}
