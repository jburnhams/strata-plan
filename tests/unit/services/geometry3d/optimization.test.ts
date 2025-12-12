import * as THREE from 'three';
import { getLODGeometry, PerformanceMonitor } from '../../../../src/services/geometry3d/optimization';

describe('Optimization Service', () => {
  describe('getLODGeometry', () => {
    it('returns the same geometry for now (stub)', () => {
      const geo = new THREE.BoxGeometry();
      const result = getLODGeometry(geo, 10);
      expect(result).toBe(geo);
    });
  });

  describe('PerformanceMonitor', () => {
    let renderer: THREE.WebGLRenderer;
    let monitor: PerformanceMonitor;

    beforeEach(() => {
      // Create a mock renderer object directly instead of instantiating THREE.WebGLRenderer
      // because JSDOM doesn't support WebGL contexts natively without canvas package
      renderer = {
        info: {
          render: { calls: 10, triangles: 100, frame: 1, lines: 0, points: 0 },
          memory: { geometries: 5, textures: 2 },
          programs: [],
          autoReset: true,
          reset: jest.fn()
        }
      } as unknown as THREE.WebGLRenderer;

      monitor = new PerformanceMonitor(renderer);
    });

    it('initializes with zero FPS', () => {
      expect(monitor.getMetrics().fps).toBe(0);
    });

    it('calculates FPS after 1 second', () => {
      const start = performance.now();

      // Simulate frames
      monitor.update(); // frame 1
      monitor.update(); // frame 2

      const originalNow = performance.now;
      global.performance.now = jest.fn(() => start + 1001);

      monitor.update(); // frame 3, triggers update

      expect(monitor.getMetrics().fps).toBe(3);
      expect(monitor.getMetrics().drawCalls).toBe(10);

      global.performance.now = originalNow;
    });
  });
});
