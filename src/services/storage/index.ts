import * as database from './database';
import * as serialization from './serialization';
import * as projectStorage from './projectStorage';
import * as settingsStorage from './settingsStorage';
import * as thumbnails from './thumbnails';
import * as saveOperations from './saveOperations';
import * as migrations from './migrations';
import * as quota from './quota';

export const storageService = {
  db: database,
  serialization,
  projects: projectStorage,
  settings: settingsStorage,
  thumbnails,
  ops: saveOperations,
  migrations,
  quota,

  /**
   * Initializes the storage layer.
   * Can be called on app startup.
   */
  init: async () => {
      try {
          await database.initDatabase();
          // Pre-load settings into cache if needed, or migration check
          // For now just ensuring DB is ready
      } catch (error) {
          console.error('Storage initialization failed:', error);
          // In offline-first app, this is critical.
          // We might want to bubble this up or set a global error state.
      }
  }
};

export default storageService;
