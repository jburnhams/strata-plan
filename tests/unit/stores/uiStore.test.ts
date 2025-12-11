/**
 * Unit tests for UI store
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { useUIStore } from '../../../src/stores/uiStore';

describe('UI Store', () => {
  beforeEach(() => {
    // Reset to defaults
    const store = useUIStore.getState();
    store.setTheme('system');
    store.resetZoom();
    store.resetPan();
  });

  describe('Theme', () => {
    it('should change theme correctly', () => {
      useUIStore.getState().setTheme('dark');
      expect(useUIStore.getState().theme).toBe('dark');

      useUIStore.getState().setTheme('light');
      expect(useUIStore.getState().theme).toBe('light');
    });
  });

  describe('Toggle functions', () => {
    it('should toggle sidebar', () => {
      const initial = useUIStore.getState().sidebarOpen;
      useUIStore.getState().toggleSidebar();
      expect(useUIStore.getState().sidebarOpen).toBe(!initial);
    });

    it('should toggle properties panel', () => {
      const initial = useUIStore.getState().propertiesPanelOpen;
      useUIStore.getState().togglePropertiesPanel();
      expect(useUIStore.getState().propertiesPanelOpen).toBe(!initial);
    });

    it('should toggle grid', () => {
      const initial = useUIStore.getState().showGrid;
      useUIStore.getState().toggleGrid();
      expect(useUIStore.getState().showGrid).toBe(!initial);
    });

    it('should toggle snap to grid', () => {
      const initial = useUIStore.getState().snapToGrid;
      useUIStore.getState().toggleSnapToGrid();
      expect(useUIStore.getState().snapToGrid).toBe(!initial);
    });

    it('should toggle room labels', () => {
      const initial = useUIStore.getState().showRoomLabels;
      useUIStore.getState().toggleRoomLabels();
      expect(useUIStore.getState().showRoomLabels).toBe(!initial);
    });

    it('should toggle measurements', () => {
      const initial = useUIStore.getState().showMeasurements;
      useUIStore.getState().toggleMeasurements();
      expect(useUIStore.getState().showMeasurements).toBe(!initial);
    });
  });

  describe('Grid size', () => {
    it('should set grid size', () => {
      useUIStore.getState().setGridSize(1.0);
      expect(useUIStore.getState().gridSize).toBe(1.0);

      useUIStore.getState().setGridSize(0.1);
      expect(useUIStore.getState().gridSize).toBe(0.1);
    });
  });

  describe('Zoom', () => {
    it('should stay within bounds (0.25-4.0)', () => {
      useUIStore.getState().setZoom(10);
      expect(useUIStore.getState().zoomLevel).toBe(4.0);

      useUIStore.getState().setZoom(0.1);
      expect(useUIStore.getState().zoomLevel).toBe(0.25);
    });

    it('should allow valid zoom levels', () => {
      useUIStore.getState().setZoom(1.5);
      expect(useUIStore.getState().zoomLevel).toBe(1.5);
    });

    it('should zoom in with correct increment', () => {
      useUIStore.getState().setZoom(1.0);
      useUIStore.getState().zoomIn();

      const expected = 1.0 * 1.25;
      expect(useUIStore.getState().zoomLevel).toBe(expected);
    });

    it('should zoom out with correct increment', () => {
      useUIStore.getState().setZoom(1.0);
      useUIStore.getState().zoomOut();

      const expected = 1.0 / 1.25;
      expect(useUIStore.getState().zoomLevel).toBe(expected);
    });

    it('should not exceed max zoom when zooming in', () => {
      useUIStore.getState().setZoom(3.8);
      useUIStore.getState().zoomIn();
      useUIStore.getState().zoomIn();

      expect(useUIStore.getState().zoomLevel).toBe(4.0);
    });

    it('should not go below min zoom when zooming out', () => {
      useUIStore.getState().setZoom(0.3);
      useUIStore.getState().zoomOut();
      useUIStore.getState().zoomOut();

      expect(useUIStore.getState().zoomLevel).toBe(0.25);
    });

    it('should reset zoom to 1.0', () => {
      useUIStore.getState().setZoom(2.5);
      useUIStore.getState().resetZoom();

      expect(useUIStore.getState().zoomLevel).toBe(1.0);
    });
  });

  describe('Pan', () => {
    it('should set pan offset', () => {
      useUIStore.getState().setPan({ x: 100, z: 50 });

      const state = useUIStore.getState();
      expect(state.panOffset.x).toBe(100);
      expect(state.panOffset.z).toBe(50);
    });

    it('should reset pan to origin', () => {
      useUIStore.getState().setPan({ x: 100, z: 50 });
      useUIStore.getState().resetPan();

      const state = useUIStore.getState();
      expect(state.panOffset.x).toBe(0);
      expect(state.panOffset.z).toBe(0);
    });
  });

  describe('Save status', () => {
    it('should update save status', () => {
      useUIStore.getState().setSaveStatus('saving');
      expect(useUIStore.getState().saveStatus).toBe('saving');

      useUIStore.getState().setSaveStatus('saved');
      expect(useUIStore.getState().saveStatus).toBe('saved');

      useUIStore.getState().setSaveStatus('error');
      expect(useUIStore.getState().saveStatus).toBe('error');
    });

    it('should update lastSaveTime when status is saved', () => {
      const before = new Date();
      useUIStore.getState().setSaveStatus('saved');
      const after = new Date();

      const lastSaveTime = useUIStore.getState().lastSaveTime;
      expect(lastSaveTime).toBeInstanceOf(Date);
      expect(lastSaveTime!.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(lastSaveTime!.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should not update lastSaveTime for other statuses', () => {
      useUIStore.getState().setSaveStatus('saved');
      const savedTime = useUIStore.getState().lastSaveTime;

      useUIStore.getState().setSaveStatus('saving');
      expect(useUIStore.getState().lastSaveTime).toBe(savedTime);

      useUIStore.getState().setSaveStatus('error');
      expect(useUIStore.getState().lastSaveTime).toBe(savedTime);
    });
  });

  describe('Hovered Room', () => {
    it('should set hovered room id', () => {
      useUIStore.getState().setHoveredRoom('room-123');
      expect(useUIStore.getState().hoveredRoomId).toBe('room-123');

      useUIStore.getState().setHoveredRoom(null);
      expect(useUIStore.getState().hoveredRoomId).toBeNull();
    });
  });

  describe('Viewer Settings', () => {
    it('should set viewer brightness', () => {
      useUIStore.getState().setViewerBrightness(1.5);
      expect(useUIStore.getState().viewerBrightness).toBe(1.5);
    });

    it('should set viewer shadow quality', () => {
      useUIStore.getState().setViewerShadowQuality('high');
      expect(useUIStore.getState().viewerShadowQuality).toBe('high');
    });

    it('should set viewer wall opacity', () => {
      useUIStore.getState().setViewerWallOpacity(0.5);
      expect(useUIStore.getState().viewerWallOpacity).toBe(0.5);
    });
  });
});
