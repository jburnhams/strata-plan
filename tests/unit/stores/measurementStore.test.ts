import { useMeasurementStore } from '../../../src/stores/measurementStore';
import { generateUUID } from '../../../src/services/geometry/uuid';

// Mock generateUUID to return predictable IDs
jest.mock('../../../src/services/geometry/uuid', () => ({
  generateUUID: jest.fn(() => 'mock-id'),
}));

describe('measurementStore', () => {
  beforeEach(() => {
    useMeasurementStore.setState({
      activeMeasurement: null,
      measurements: [],
    });
  });

  it('sets active measurement', () => {
    const measurement = {
      startPoint: { x: 0, z: 0 },
      endPoint: { x: 1, z: 1 },
      distance: 1.41
    };

    useMeasurementStore.getState().setActiveMeasurement(measurement);

    expect(useMeasurementStore.getState().activeMeasurement).toEqual(measurement);
  });

  it('adds a measurement', () => {
    const measurement = {
      startPoint: { x: 0, z: 0 },
      endPoint: { x: 2, z: 0 },
      distance: 2
    };

    useMeasurementStore.getState().addMeasurement(measurement);

    const measurements = useMeasurementStore.getState().measurements;
    expect(measurements).toHaveLength(1);
    expect(measurements[0]).toEqual({
      ...measurement,
      id: 'mock-id'
    });
  });

  it('removes a measurement', () => {
    const measurement = {
      startPoint: { x: 0, z: 0 },
      endPoint: { x: 2, z: 0 },
      distance: 2
    };

    useMeasurementStore.getState().addMeasurement(measurement);
    useMeasurementStore.getState().removeMeasurement('mock-id');

    expect(useMeasurementStore.getState().measurements).toHaveLength(0);
  });

  it('clears all measurements', () => {
    useMeasurementStore.getState().addMeasurement({ startPoint: { x: 0, z: 0 }, endPoint: { x: 1, z: 0 }, distance: 1 });
    useMeasurementStore.getState().addMeasurement({ startPoint: { x: 0, z: 0 }, endPoint: { x: 2, z: 0 }, distance: 2 });

    expect(useMeasurementStore.getState().measurements).toHaveLength(2);

    useMeasurementStore.getState().clearMeasurements();

    expect(useMeasurementStore.getState().measurements).toHaveLength(0);
  });
});
