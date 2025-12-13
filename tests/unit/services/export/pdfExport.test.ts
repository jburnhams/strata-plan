import { exportToPDF } from '../../../../src/services/export/pdfExport';
import { Floorplan } from '../../../../src/types/floorplan';
import { jsPDF } from 'jspdf';
import { mockFloorplan, mockRoom } from '../../../utils/mockData';

// Mock jsPDF
jest.mock('jspdf', () => {
  return {
    jsPDF: jest.fn().mockImplementation(() => ({
      internal: {
        pageSize: {
          getWidth: jest.fn().mockReturnValue(210),
          getHeight: jest.fn().mockReturnValue(297),
        },
      },
      text: jest.fn(),
      rect: jest.fn(),
      line: jest.fn(),
      setFont: jest.fn(),
      setFontSize: jest.fn(),
      setTextColor: jest.fn(),
      setDrawColor: jest.fn(),
      addPage: jest.fn(),
      setPage: jest.fn(),
      getNumberOfPages: jest.fn().mockReturnValue(1),
      output: jest.fn().mockReturnValue(new Blob(['pdf-content'], { type: 'application/pdf' })),
    })),
  };
});

describe('exportToPDF', () => {
  const mockDoc = {
    internal: {
      pageSize: {
        getWidth: jest.fn().mockReturnValue(210),
        getHeight: jest.fn().mockReturnValue(297),
      },
    },
    text: jest.fn(),
    rect: jest.fn(),
    line: jest.fn(),
    setFont: jest.fn(),
    setFontSize: jest.fn(),
    setTextColor: jest.fn(),
    setDrawColor: jest.fn(),
    addPage: jest.fn(),
    setPage: jest.fn(),
    getNumberOfPages: jest.fn().mockReturnValue(1),
    output: jest.fn().mockReturnValue(new Blob(['pdf-content'], { type: 'application/pdf' })),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (jsPDF as unknown as jest.Mock).mockImplementation(() => mockDoc);
  });

  it('should create a PDF with the correct title and summary', async () => {
    const floorplan: Floorplan = {
      ...mockFloorplan(),
      name: 'Test Project',
      units: 'meters',
      rooms: [
        { ...mockRoom('1'), length: 5, width: 4, height: 3, name: 'Room 1' }, // Area 20, Vol 60
        { ...mockRoom('2'), length: 3, width: 3, height: 3, name: 'Room 2' }, // Area 9, Vol 27
      ],
    };

    const blob = await exportToPDF(floorplan);

    expect(jsPDF).toHaveBeenCalledWith({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    expect(mockDoc.text).toHaveBeenCalledWith('Test Project', expect.any(Number), expect.any(Number));

    // Check summary calculations
    // Total Area: 29.00 m²
    // Total Volume: 87.00 m³
    expect(mockDoc.text).toHaveBeenCalledWith(
      expect.stringContaining('Total Area: 29.00 m²'),
      expect.any(Number),
      expect.any(Number)
    );
    expect(mockDoc.text).toHaveBeenCalledWith(
      expect.stringContaining('Total Volume: 87.00 m³'),
      expect.any(Number),
      expect.any(Number)
    );
    expect(mockDoc.text).toHaveBeenCalledWith(
      expect.stringContaining('Rooms: 2'),
      expect.any(Number),
      expect.any(Number)
    );

    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('application/pdf');
  });

  it('should handle feet units correctly', async () => {
    const floorplan: Floorplan = {
      ...mockFloorplan(),
      units: 'feet',
      rooms: [
        { ...mockRoom('1'), length: 10, width: 10, height: 8 },
      ],
    };

    await exportToPDF(floorplan);

    expect(mockDoc.text).toHaveBeenCalledWith(
      expect.stringContaining('Total Area: 100.00 sq ft'),
      expect.any(Number),
      expect.any(Number)
    );
  });

  it('should include room table by default', async () => {
    const floorplan = { ...mockFloorplan(), rooms: [mockRoom('1')] };
    await exportToPDF(floorplan);

    expect(mockDoc.text).toHaveBeenCalledWith('Room Details', expect.any(Number), expect.any(Number));
  });

  it('should not include room table if option is false', async () => {
    const floorplan = { ...mockFloorplan(), rooms: [mockRoom('1')] };
    await exportToPDF(floorplan, { includeTable: false });

    expect(mockDoc.text).not.toHaveBeenCalledWith('Room Details', expect.any(Number), expect.any(Number));
  });

  it('should add pages if content exceeds page height', async () => {
    // Mock page height to be small to force pagination
    mockDoc.internal.pageSize.getHeight.mockReturnValue(50);

    const floorplan: Floorplan = {
      ...mockFloorplan(),
      rooms: Array(10).fill(mockRoom('1')),
    };

    await exportToPDF(floorplan, { includeTable: true, include2DView: false });

    expect(mockDoc.addPage).toHaveBeenCalled();
  });
});
