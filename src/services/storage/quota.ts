
export interface StorageInfo {
  used: number;     // in bytes
  quota: number;    // in bytes (approximate)
  percentUsed: number;
}

/**
 * Gets current storage usage and quota estimation.
 * Uses the StorageManager API if available.
 */
export const getStorageInfo = async (): Promise<StorageInfo> => {
  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
    try {
      const estimate = await navigator.storage.estimate();
      const used = estimate.usage || 0;
      const quota = estimate.quota || 0; // 0 means unknown/unlimited effectively (or error)

      // Avoid division by zero
      const percentUsed = quota > 0 ? (used / quota) * 100 : 0;

      return { used, quota, percentUsed };
    } catch (e) {
      console.warn('Failed to estimate storage:', e);
    }
  }

  // Fallback if API not available or fails
  return { used: 0, quota: 0, percentUsed: 0 };
};

export const QUOTA_WARNING_THRESHOLD = 80; // 80%

/**
 * Checks if storage usage is approaching the quota.
 * Returns true if usage > threshold.
 */
export const isStorageLow = async (): Promise<boolean> => {
    const info = await getStorageInfo();
    // Only warn if we have a valid quota estimate
    return info.quota > 0 && info.percentUsed > QUOTA_WARNING_THRESHOLD;
};

// Formatting helper
export const formatBytes = (bytes: number, decimals = 2): string => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};
