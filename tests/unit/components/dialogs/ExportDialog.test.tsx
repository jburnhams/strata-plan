import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ExportDialog } from '../../../../src/components/dialogs/ExportDialog';
import { useFloorplanStore } from '../../../../src/stores/floorplanStore';
import { useToast } from '../../../../src/hooks/use-toast';
import * as jsonExport from '../../../../src/services/export/jsonExport';
import * as gltfExport from '../../../../src/services/export/gltfExport';
import * as pdfExport from '../../../../src/services/export/pdfExport';
import userEvent from '@testing-library/user-event';

// Mock exports
jest.mock('../../../../src/services/export/jsonExport');
jest.mock('../../../../src/services/export/gltfExport');
jest.mock('../../../../src/services/export/pdfExport');
jest.mock('../../../../src/hooks/use-toast');

// Mock Radix UI components (simplified)
// Since shadcn uses radix, which renders portals, we need userEvent or special handling.
// But for unit tests, we can interact with what's in the DOM.

describe('ExportDialog', () => {
    const mockOnOpenChange = jest.fn();
    const mockToast = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
        useFloorplanStore.setState({
            currentFloorplan: {
                id: 'fp-1',
                name: 'My Project',
                rooms: [],
                connections: [],
                walls: [],
                units: 'meters',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        });

        // Mock download implementations
        (jsonExport.exportToJSON as jest.Mock).mockReturnValue(new Blob(['{}'], { type: 'application/json' }));
        (gltfExport.exportToGLTF as jest.Mock).mockResolvedValue(new Blob(['buffer'], { type: 'model/gltf-binary' }));
        (pdfExport.exportToPDF as jest.Mock).mockResolvedValue(new Blob(['pdf'], { type: 'application/pdf' }));

        // Mock URL
        global.URL.createObjectURL = jest.fn(() => 'blob:url');
        global.URL.revokeObjectURL = jest.fn();
    });

    it('renders when open', () => {
        render(<ExportDialog open={true} onOpenChange={mockOnOpenChange} />);
        expect(screen.getByText('Export Project')).toBeInTheDocument();
    });

    it('populates filename from project name', () => {
        render(<ExportDialog open={true} onOpenChange={mockOnOpenChange} />);
        const input = screen.getByLabelText('Filename') as HTMLInputElement;
        expect(input.value).toMatch(/^My Project-\d{4}-\d{2}-\d{2}$/);
    });

    it('exports JSON (default)', async () => {
        const user = userEvent.setup();
        render(<ExportDialog open={true} onOpenChange={mockOnOpenChange} />);

        const exportBtn = screen.getByRole('button', { name: 'Export' });
        await user.click(exportBtn);

        expect(jsonExport.exportToJSON).toHaveBeenCalled();
        expect(mockOnOpenChange).toHaveBeenCalledWith(false);
        expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Export Successful' }));
    });

    it('switches format and exports GLTF', async () => {
        const user = userEvent.setup();
        render(<ExportDialog open={true} onOpenChange={mockOnOpenChange} />);

        // Open select
        const trigger = screen.getByRole('combobox');
        await user.click(trigger);

        // Select GLTF
        const gltfOption = await screen.findByText('glTF / GLB (3D Model)');
        await user.click(gltfOption);

        // Check extension updated
        expect(screen.getByText('.glb')).toBeInTheDocument();

        // Export
        const exportBtn = screen.getByRole('button', { name: 'Export' });
        await user.click(exportBtn);

        expect(gltfExport.exportToGLTF).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({ binary: true, includeTextures: true })
        );
    });

    it('handles GLTF texture option', async () => {
        const user = userEvent.setup();
        render(<ExportDialog open={true} onOpenChange={mockOnOpenChange} />);

        // Switch to GLTF
        await user.click(screen.getByRole('combobox'));
        await user.click(await screen.findByText('glTF / GLB (3D Model)'));

        // Uncheck textures
        const checkbox = screen.getByLabelText('Include textures in export');
        await user.click(checkbox);

        // Export
        await user.click(screen.getByRole('button', { name: 'Export' }));

        expect(gltfExport.exportToGLTF).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({ includeTextures: false })
        );
    });

    it('exports PDF', async () => {
        const user = userEvent.setup();
        render(<ExportDialog open={true} onOpenChange={mockOnOpenChange} />);

        // Switch to PDF
        await user.click(screen.getByRole('combobox'));
        await user.click(await screen.findByText('PDF (Report)'));

        // Export
        await user.click(screen.getByRole('button', { name: 'Export' }));

        expect(pdfExport.exportToPDF).toHaveBeenCalled();
    });

    it('handles export errors', async () => {
        const user = userEvent.setup();
        (jsonExport.exportToJSON as jest.Mock).mockImplementation(() => {
            throw new Error('JSON Error');
        });

        render(<ExportDialog open={true} onOpenChange={mockOnOpenChange} />);

        await user.click(screen.getByRole('button', { name: 'Export' }));

        expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
            title: 'Export Failed',
            description: 'JSON Error'
        }));

        // Should NOT close dialog on error
        expect(mockOnOpenChange).not.toHaveBeenCalled();
    });
});
