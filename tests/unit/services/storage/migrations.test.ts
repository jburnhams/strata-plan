import { migrateData, MIGRATIONS, isVersionLess, Migration } from '@/services/storage/migrations';
import { CURRENT_VERSION } from '@/services/storage/serialization';

describe('Storage Migrations', () => {
  // Clear migrations before each test to ensure isolation
  const originalMigrations = [...MIGRATIONS];

  beforeEach(() => {
    // Reset MIGRATIONS array
    MIGRATIONS.length = 0;
  });

  afterEach(() => {
    // Restore MIGRATIONS
    MIGRATIONS.length = 0;
    MIGRATIONS.push(...originalMigrations);
  });

  describe('isVersionLess', () => {
    it('correctly compares versions', () => {
      expect(isVersionLess('1.0.0', '1.0.1')).toBe(true);
      expect(isVersionLess('1.0.0', '1.1.0')).toBe(true);
      expect(isVersionLess('1.0.0', '2.0.0')).toBe(true);
      expect(isVersionLess('1.0.1', '1.0.0')).toBe(false);
      expect(isVersionLess('1.0.0', '1.0.0')).toBe(false);
      expect(isVersionLess('0.9.0', '1.0.0')).toBe(true);
    });
  });

  describe('migrateData', () => {
    it('returns data unchanged if version matches target', () => {
      const data = { version: CURRENT_VERSION, foo: 'bar' };
      const result = migrateData(data);
      expect(result).toEqual(data);
    });

    it('returns data unchanged if version is newer than target', () => {
      const data = { version: '9.9.9', foo: 'bar' };
      const result = migrateData(data, '1.0.0');
      expect(result).toEqual(data);
    });

    it('runs single migration correctly', () => {
      const startData = { version: '1.0.0', value: 1 };

      const migration: Migration = {
        fromVersion: '1.0.0',
        toVersion: '1.1.0',
        migrate: (d) => ({ ...d, value: d.value + 1 })
      };
      MIGRATIONS.push(migration);

      const result = migrateData(startData, '1.1.0');

      expect(result.version).toBe('1.1.0');
      expect(result.value).toBe(2);
    });

    it('runs multiple migrations in sequence', () => {
      const startData = { version: '1.0.0', value: 1 };

      MIGRATIONS.push(
        {
          fromVersion: '1.0.0',
          toVersion: '1.1.0',
          migrate: (d) => ({ ...d, value: d.value + 1 })
        },
        {
          fromVersion: '1.1.0',
          toVersion: '1.2.0',
          migrate: (d) => ({ ...d, value: d.value * 2 })
        }
      );

      const result = migrateData(startData, '1.2.0');

      expect(result.version).toBe('1.2.0');
      expect(result.value).toBe(4); // (1 + 1) * 2 = 4
    });

    it('stops if no migration found', () => {
      const startData = { version: '1.0.0', value: 1 };

      // Migration from 1.0.0 -> 1.1.0 exists
      MIGRATIONS.push({
        fromVersion: '1.0.0',
        toVersion: '1.1.0',
        migrate: (d) => ({ ...d, value: d.value + 1 })
      });
      // But 1.1.0 -> 1.2.0 is missing

      const result = migrateData(startData, '1.2.0');

      // Should stop at 1.1.0
      expect(result.version).toBe('1.1.0');
      expect(result.value).toBe(2);
    });

    it('handles legacy data with missing version', () => {
       const startData = { value: 1 }; // No version implies 0.0.0

       MIGRATIONS.push({
           fromVersion: '0.0.0',
           toVersion: '1.0.0',
           migrate: (d) => ({ ...d, version: '1.0.0', migrated: true })
       });

       const result = migrateData(startData, '1.0.0');
       expect(result.version).toBe('1.0.0');
       expect(result.migrated).toBe(true);
    });
  });
});
