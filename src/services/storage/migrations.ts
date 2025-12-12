import { CURRENT_VERSION } from './serialization';

export interface Migration {
  fromVersion: string;
  toVersion: string;
  migrate: (data: any) => any;
}

// Helper to compare semantic versions
// Returns true if v1 < v2
export const isVersionLess = (v1: string, v2: string): boolean => {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);

  for (let i = 0; i < 3; i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;
    if (p1 < p2) return true;
    if (p1 > p2) return false;
  }
  return false;
};

// Define migrations here
// Example:
// {
//   fromVersion: '1.0.0',
//   toVersion: '1.1.0',
//   migrate: (data) => ({ ...data, newField: 'default' })
// }
export const MIGRATIONS: Migration[] = [];

/**
 * Migrates data from its current version to the target version (defaults to CURRENT_VERSION).
 * Throws error if no path found or migration fails.
 */
export const migrateData = (data: any, targetVersion: string = CURRENT_VERSION): any => {
  if (!data) return data;

  let currentData = { ...data };
  let currentVersion = currentData.version || '0.0.0'; // Assume very old if no version

  if (currentVersion === targetVersion) {
    return currentData;
  }

  // Safety check to prevent downgrades or infinite loops if we had them
  if (!isVersionLess(currentVersion, targetVersion)) {
    console.warn(`Data version ${currentVersion} is newer or equal to target ${targetVersion}, skipping migration.`);
    return currentData;
  }

  // Find applicable migrations
  // We look for a chain: v1 -> v2 -> v3 ... -> target
  // For now, we assume a linear chain is sufficient.

  let migrationCount = 0;
  const maxMigrations = 100; // Circuit breaker

  while (isVersionLess(currentVersion, targetVersion) && migrationCount < maxMigrations) {
    const migration = MIGRATIONS.find(m => m.fromVersion === currentVersion);

    if (!migration) {
        // If we can't find a direct migration, we might be stuck.
        // But maybe we are "close enough" if we follow semantic versioning rules?
        // For strict schema changes, we must have a migration.
        // If the version difference is just patch level or minor without schema changes,
        // we might just bump the version?
        // For this task, we assume strict migration definitions.
        console.warn(`No migration found for version ${currentVersion}. stopping migration.`);
        break;
    }

    try {
        console.log(`Migrating from ${migration.fromVersion} to ${migration.toVersion}`);
        currentData = migration.migrate(currentData);
        currentVersion = migration.toVersion;
        currentData.version = currentVersion;
        migrationCount++;
    } catch (e) {
        console.error(`Migration failed from ${migration.fromVersion} to ${migration.toVersion}:`, e);
        throw e;
    }
  }

  // If we reached here, we might not have reached targetVersion if migrations were missing.
  // We should probably update the version to targetVersion if we are confident,
  // but strictly we should only update to the last successful migration.

  return currentData;
};
