import { create } from 'zustand';
import { Position2D } from '../types';
import { generateUUID } from '../services/geometry/uuid';

export interface Measurement {
  id: string;
  startPoint: Position2D;
  endPoint: Position2D;
  distance: number;
}

interface MeasurementState {
  // Temporary active measurement (being drawn)
  activeMeasurement: Partial<Measurement> | null;
  // Completed measurements (persisted until cleared)
  measurements: Measurement[];

  setActiveMeasurement: (measurement: Partial<Measurement> | null) => void;
  addMeasurement: (measurement: Omit<Measurement, 'id'>) => void;
  removeMeasurement: (id: string) => void;
  clearMeasurements: () => void;
}

export const useMeasurementStore = create<MeasurementState>((set) => ({
  activeMeasurement: null,
  measurements: [],

  setActiveMeasurement: (measurement) => set({ activeMeasurement: measurement }),

  addMeasurement: (measurement) => set((state) => ({
    measurements: [
      ...state.measurements,
      { ...measurement, id: generateUUID() }
    ]
  })),

  removeMeasurement: (id) => set((state) => ({
    measurements: state.measurements.filter(m => m.id !== id)
  })),

  clearMeasurements: () => set({ measurements: [] }),
}));
