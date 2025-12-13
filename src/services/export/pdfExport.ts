import { jsPDF } from 'jspdf';
import { Floorplan } from '../../types/floorplan';
import { Room } from '../../types/room';

export interface PDFExportOptions {
  pageSize?: 'a4' | 'letter';
  orientation?: 'portrait' | 'landscape';
  includeTable?: boolean;
  include2DView?: boolean;
  include3DView?: boolean;
}

const DEFAULT_OPTIONS: PDFExportOptions = {
  pageSize: 'a4',
  orientation: 'portrait',
  includeTable: true,
  include2DView: true,
  include3DView: false,
};

export const exportToPDF = async (
  floorplan: Floorplan,
  options: PDFExportOptions = {}
): Promise<Blob> => {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  const doc = new jsPDF({
    orientation: mergedOptions.orientation,
    unit: 'mm',
    format: mergedOptions.pageSize,
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  let cursorY = margin;

  // Header
  doc.setFontSize(24);
  doc.text(floorplan.name || 'Untitled Project', margin, cursorY);
  cursorY += 10;

  doc.setFontSize(10);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, margin, cursorY);
  cursorY += 15;

  // Summary
  const { totalArea, totalVolume, roomCount } = calculateSummary(floorplan);

  doc.setFontSize(14);
  doc.text('Summary', margin, cursorY);
  cursorY += 8;

  doc.setFontSize(10);
  doc.text(`Total Area: ${totalArea.toFixed(2)} ${floorplan.units === 'feet' ? 'sq ft' : 'm²'}`, margin, cursorY);
  cursorY += 5;
  doc.text(`Total Volume: ${totalVolume.toFixed(2)} ${floorplan.units === 'feet' ? 'cu ft' : 'm³'}`, margin, cursorY);
  cursorY += 5;
  doc.text(`Rooms: ${roomCount}`, margin, cursorY);
  cursorY += 15;

  // 2D Floorplan Placeholder
  if (mergedOptions.include2DView) {
    doc.setFontSize(14);
    doc.text('2D Floorplan Diagram', margin, cursorY);
    cursorY += 10;

    // Placeholder rectangle
    doc.setDrawColor(200, 200, 200);
    doc.rect(margin, cursorY, contentWidth, 80);
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text('(2D Floorplan Image Placeholder)', margin + contentWidth / 2, cursorY + 40, { align: 'center' });
    doc.setTextColor(0, 0, 0);

    cursorY += 90;
  }

  // Room Table
  if (mergedOptions.includeTable) {
    if (cursorY + 40 > pageHeight) {
      doc.addPage();
      cursorY = margin;
    }

    doc.setFontSize(14);
    doc.text('Room Details', margin, cursorY);
    cursorY += 10;

    // Table Header
    const colX = [margin, margin + 40, margin + 80, margin + 110, margin + 140];
    const headers = ['Name', 'Dimensions', 'Height', 'Area'];

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(headers[0], colX[0], cursorY);
    doc.text(headers[1], colX[1], cursorY);
    doc.text(headers[2], colX[2], cursorY);
    doc.text(headers[3], colX[3], cursorY);

    doc.line(margin, cursorY + 2, margin + contentWidth, cursorY + 2);
    cursorY += 8;

    doc.setFont('helvetica', 'normal');

    floorplan.rooms.forEach((room) => {
      if (cursorY > pageHeight - margin) {
        doc.addPage();
        cursorY = margin;
        // Reprint header?
        // For simplicity, just continue content
      }

      const area = (room.length * room.width).toFixed(2);
      const unitLabel = floorplan.units === 'feet' ? 'ft' : 'm';
      const areaLabel = floorplan.units === 'feet' ? 'sq ft' : 'm²';

      doc.text(room.name || 'Unnamed', colX[0], cursorY);
      doc.text(`${room.length} x ${room.width} ${unitLabel}`, colX[1], cursorY);
      doc.text(`${room.height} ${unitLabel}`, colX[2], cursorY);
      doc.text(`${area} ${areaLabel}`, colX[3], cursorY);

      cursorY += 7;
    });
  }

  // Add footer with page numbers
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  return doc.output('blob');
};

function calculateSummary(floorplan: Floorplan) {
  let totalArea = 0;
  let totalVolume = 0;

  floorplan.rooms.forEach(room => {
    const area = room.length * room.width;
    const volume = area * room.height;
    totalArea += area;
    totalVolume += volume;
  });

  return {
    totalArea,
    totalVolume,
    roomCount: floorplan.rooms.length
  };
}
