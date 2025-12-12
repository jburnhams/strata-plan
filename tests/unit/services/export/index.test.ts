import { generateFilename, downloadBlob, exportFloorplan } from '../../../../src/services/export/index';
import { exportToJSON } from '../../../../src/services/export/jsonExport';
import { Floorplan } from '../../../../src/types/floorplan';

// Mock jsonExport
jest.mock('../../../../src/services/export/jsonExport', () => ({
  exportToJSON: jest.fn()
}));

describe('Export Service', () => {
  describe('generateFilename', () => {
    beforeAll(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2024-01-15'));
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    it('should generate filename with date', () => {
      const filename = generateFilename('My Project', 'json');
      expect(filename).toBe('My_Project_2024-01-15.json');
    });

    it('should sanitize special characters', () => {
      const filename = generateFilename('Project #1 (Draft)', 'json');
      // "Project #1 (Draft)" -> "Project 1 Draft" -> "Project_1_Draft"
      // Based on implementation: replace(/[^a-z0-9\s-]/gi, '') -> "Project 1 Draft"
      // .trim().replace(/\s+/g, '_') -> "Project_1_Draft"
      expect(filename).toBe('Project_1_Draft_2024-01-15.json');
    });

    it('should handle empty project name', () => {
      const filename = generateFilename('', 'json');
      expect(filename).toBe('project_2024-01-15.json');
    });

    it('should handle format with or without dot', () => {
        expect(generateFilename('Test', '.pdf')).toBe('Test_2024-01-15.pdf');
        expect(generateFilename('Test', 'pdf')).toBe('Test_2024-01-15.pdf');
    });
  });

  describe('downloadBlob', () => {
    let originalCreateObjectURL: typeof URL.createObjectURL;
    let originalRevokeObjectURL: typeof URL.revokeObjectURL;

    beforeAll(() => {
        originalCreateObjectURL = URL.createObjectURL;
        originalRevokeObjectURL = URL.revokeObjectURL;
        URL.createObjectURL = jest.fn(() => 'blob:url');
        URL.revokeObjectURL = jest.fn();
    });

    afterAll(() => {
        URL.createObjectURL = originalCreateObjectURL;
        URL.revokeObjectURL = originalRevokeObjectURL;
    });

    it('should create link and trigger click', () => {
        const blob = new Blob(['test']);
        const link = document.createElement('a');
        const clickSpy = jest.spyOn(link, 'click');
        const appendSpy = jest.spyOn(document.body, 'appendChild').mockImplementation(() => link);
        const removeSpy = jest.spyOn(document.body, 'removeChild').mockImplementation(() => link);

        // Mock createElement to return our spyable link
        const createElementSpy = jest.spyOn(document, 'createElement').mockReturnValue(link);

        downloadBlob(blob, 'test.json');

        expect(URL.createObjectURL).toHaveBeenCalledWith(blob);
        expect(link.href).toBe('blob:url'); // JSDOM might resolve this fully, but we check if it was assigned
        expect(link.download).toBe('test.json');
        expect(appendSpy).toHaveBeenCalledWith(link);
        expect(clickSpy).toHaveBeenCalled();
        expect(removeSpy).toHaveBeenCalledWith(link);
        expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:url');

        createElementSpy.mockRestore();
    });
  });

  describe('exportFloorplan', () => {
    const mockFloorplan = { name: 'Test' } as Floorplan;
    const mockBlob = new Blob(['{}']);

    beforeEach(() => {
        jest.clearAllMocks();
        // We need to mock generateFilename and downloadBlob logic inside exportFloorplan?
        // No, we are testing the function itself.
        // But downloadBlob creates DOM elements which we mocked above.

        // Let's spy on the module's exportToJSON (which is mocked at top)
        (exportToJSON as jest.Mock).mockResolvedValue(mockBlob);

        // Since downloadBlob and generateFilename are in the same file as exportFloorplan,
        // we can't easily mock them unless we separate them or use a spy if they were exported methods on an object.
        // But they are standalone functions.
        // However, downloadBlob relies on DOM, so we need the DOM mocks from above.
    });

    // Re-setup DOM mocks for this block
    beforeAll(() => {
        URL.createObjectURL = jest.fn(() => 'blob:url');
        URL.revokeObjectURL = jest.fn();
    });

    it('should handle json export', async () => {
        const link = document.createElement('a');
        jest.spyOn(document, 'createElement').mockReturnValue(link);
        jest.spyOn(document.body, 'appendChild').mockImplementation(() => link);
        jest.spyOn(document.body, 'removeChild').mockImplementation(() => link);

        await exportFloorplan(mockFloorplan, 'json');

        expect(exportToJSON).toHaveBeenCalledWith(mockFloorplan);
    });

    it('should throw for unsupported formats', async () => {
        await expect(exportFloorplan(mockFloorplan, 'gltf')).rejects.toThrow('GLTF export not implemented yet');
        await expect(exportFloorplan(mockFloorplan, 'pdf')).rejects.toThrow('PDF export not implemented yet');
    });
  });
});
