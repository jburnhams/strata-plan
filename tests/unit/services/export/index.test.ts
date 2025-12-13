import { generateFilename, downloadBlob, exportFloorplan } from '../../../../src/services/export/index';
import { exportToJSON } from '../../../../src/services/export/jsonExport';
import { exportToGLTF } from '../../../../src/services/export/gltfExport';
import { exportToPDF } from '../../../../src/services/export/pdfExport';
import { Floorplan } from '../../../../src/types/floorplan';

// Mock jsonExport, gltfExport and pdfExport
jest.mock('../../../../src/services/export/jsonExport', () => ({
  exportToJSON: jest.fn()
}));
jest.mock('../../../../src/services/export/gltfExport', () => ({
  exportToGLTF: jest.fn()
}));
jest.mock('../../../../src/services/export/pdfExport', () => ({
  exportToPDF: jest.fn()
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

        const createElementSpy = jest.spyOn(document, 'createElement').mockReturnValue(link);

        downloadBlob(blob, 'test.json');

        expect(URL.createObjectURL).toHaveBeenCalledWith(blob);
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
        (exportToJSON as jest.Mock).mockResolvedValue(mockBlob);
    });

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

    it('should handle gltf export', async () => {
        const link = document.createElement('a');
        jest.spyOn(document, 'createElement').mockReturnValue(link);
        jest.spyOn(document.body, 'appendChild').mockImplementation(() => link);
        jest.spyOn(document.body, 'removeChild').mockImplementation(() => link);
        (exportToGLTF as jest.Mock).mockResolvedValue(mockBlob);

        await exportFloorplan(mockFloorplan, 'gltf');

        expect(exportToGLTF).toHaveBeenCalledWith(mockFloorplan, undefined);
    });

    it('should handle pdf export', async () => {
        const link = document.createElement('a');
        jest.spyOn(document, 'createElement').mockReturnValue(link);
        jest.spyOn(document.body, 'appendChild').mockImplementation(() => link);
        jest.spyOn(document.body, 'removeChild').mockImplementation(() => link);
        (exportToPDF as jest.Mock).mockResolvedValue(mockBlob);

        await exportFloorplan(mockFloorplan, 'pdf');

        expect(exportToPDF).toHaveBeenCalledWith(mockFloorplan, undefined);
    });

    it('should throw for unsupported formats', async () => {
        // @ts-ignore
        await expect(exportFloorplan(mockFloorplan, 'xyz')).rejects.toThrow('Unsupported export format: xyz');
    });
  });
});
