import { openDB, DBSchema, IDBPDatabase } from 'idb';

import { SerializedFloorplan } from './serialization';

export interface StoredProject {
  id: string;
  name: string;
  data: SerializedFloorplan;
  thumbnail?: string; // base64 data URL
  createdAt: Date;
  updatedAt: Date;
  version: string; // schema version
}

export interface StoredSettings {
    key: string;
    value: unknown;
}

export interface StrataPlanDB extends DBSchema {
  projects: {
    key: string; // project ID
    value: StoredProject;
    indexes: {
      'by-updated': Date;
      'by-name': string;
    };
  };
  settings: {
    key: string;
    value: StoredSettings;
  };
}

const DB_NAME = 'strataplan-db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<StrataPlanDB>> | null = null;

export const initDatabase = (): Promise<IDBPDatabase<StrataPlanDB>> => {
  if (!dbPromise) {
    dbPromise = openDB<StrataPlanDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion, transaction) {
        // Create projects store if it doesn't exist
        if (!db.objectStoreNames.contains('projects')) {
          const projectStore = db.createObjectStore('projects', {
            keyPath: 'id',
          });
          projectStore.createIndex('by-updated', 'updatedAt');
          projectStore.createIndex('by-name', 'name');
        }

        // Create settings store if it doesn't exist
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', {
            keyPath: 'key',
          });
        }
      },
    });
  }
  return dbPromise;
};

// For testing purposes
export const _resetDatabaseInstance = async () => {
    if (dbPromise) {
        const db = await dbPromise;
        // In some mock environments, close might not be available or behaves differently
        if (db && typeof db.close === 'function') {
             db.close();
        }
        dbPromise = null;
    }
};
