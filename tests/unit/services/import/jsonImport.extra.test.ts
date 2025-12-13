import { importFromJSON } from '../../../../src/services/import/jsonImport';
import * as fileReader from '../../../../src/services/import/fileReader';
import * as migrations from '../../../../src/services/storage/migrations';
import * as validation from '../../../../src/services/import/validation';

jest.mock('../../../../src/services/import/fileReader');
jest.mock('../../../../src/services/storage/migrations');
jest.mock('../../../../src/services/import/validation');

// Polyfill structuredClone
global.structuredClone = (val: any) => JSON.parse(JSON.stringify(val));

describe('importFromJSON Extra Coverage', () => {
    const mockFile = new File(['{}'], 'test.json', { type: 'application/json' });

    beforeEach(() => {
        jest.clearAllMocks();
        (fileReader.readFileAsText as jest.Mock).mockResolvedValue('{}');
        (migrations.migrateData as jest.Mock).mockImplementation(data => data);
        (validation.validateImportedFloorplan as jest.Mock).mockReturnValue({ valid: true, errors: [], warnings: [] });
    });

    it('returns error for invalid JSON syntax', async () => {
        (fileReader.readFileAsText as jest.Mock).mockResolvedValue('{ invalid json');
        const result = await importFromJSON(mockFile);
        expect(result.success).toBe(false);
        expect(result.errors).toContain('Invalid JSON syntax');
    });

    it('handles wrapped floorplan format', async () => {
        const wrappedData = JSON.stringify({ floorplan: { id: 'fp-1' } });
        (fileReader.readFileAsText as jest.Mock).mockResolvedValue(wrappedData);

        // Mock migration to just return what it gets (assumed to be the unwrapped floorplan)
        (migrations.migrateData as jest.Mock).mockImplementation(data => data);

        await importFromJSON(mockFile);

        // Verify validateImportedFloorplan was called with the inner object
        expect(validation.validateImportedFloorplan).toHaveBeenCalledWith(expect.objectContaining({ id: 'fp-1' }));
    });

    it('returns error if migration fails', async () => {
        (migrations.migrateData as jest.Mock).mockImplementation(() => {
            throw new Error('Migration crashed');
        });
        const result = await importFromJSON(mockFile);
        expect(result.success).toBe(false);
        expect(result.errors[0]).toMatch(/Migration failed/);
    });

    it('returns validation errors', async () => {
        (validation.validateImportedFloorplan as jest.Mock).mockReturnValue({
            valid: false,
            errors: ['Missing rooms'],
            warnings: []
        });
        const result = await importFromJSON(mockFile);
        expect(result.success).toBe(false);
        expect(result.errors).toContain('Missing rooms');
    });

    it('regenerates IDs if requested', async () => {
        const originalData = {
            id: 'fp-old',
            rooms: [{ id: 'room-old' }],
            doors: [{ id: 'door-old', roomId: 'room-old' }],
            windows: [{ id: 'win-old', roomId: 'room-old' }],
            connections: [{ id: 'conn-old', room1Id: 'room-old', room2Id: 'room-other' }],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        (fileReader.readFileAsText as jest.Mock).mockResolvedValue(JSON.stringify(originalData));
        (migrations.migrateData as jest.Mock).mockReturnValue(originalData);

        // Ensure validation passes, despite data not fully matching schema
        (validation.validateImportedFloorplan as jest.Mock).mockReturnValue({
            valid: true,
            errors: [],
            warnings: []
        });

        const result = await importFromJSON(mockFile, { generateNewIds: true });

        // If it failed, log the errors to debug
        if (!result.success) {
            console.error(result.errors);
        }

        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.floorplan.id).not.toBe('fp-old');
            expect(result.floorplan.rooms[0].id).not.toBe('room-old');
            expect(result.floorplan.doors[0].id).not.toBe('door-old');
            expect(result.floorplan.doors[0].roomId).toBe(result.floorplan.rooms[0].id); // Should point to new room ID
        }
    });

    it('catches unknown errors', async () => {
        (fileReader.readFileAsText as jest.Mock).mockRejectedValue(new Error('File read failed'));
        const result = await importFromJSON(mockFile);
        expect(result.success).toBe(false);
        expect(result.errors[0]).toBe('File read failed');
    });
});
