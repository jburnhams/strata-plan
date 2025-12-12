import { getStorageInfo, isStorageLow, formatBytes, QUOTA_WARNING_THRESHOLD } from '@/services/storage/quota';

describe('Storage Quota Service', () => {
  const originalNavigator = global.navigator;

  beforeEach(() => {
    // Reset navigator mock
    Object.defineProperty(global, 'navigator', {
        value: {
            storage: {
                estimate: jest.fn()
            }
        },
        writable: true
    });
  });

  afterAll(() => {
    Object.defineProperty(global, 'navigator', {
        value: originalNavigator,
        writable: true
    });
  });

  describe('getStorageInfo', () => {
    it('returns estimate from navigator.storage', async () => {
      (navigator.storage.estimate as jest.Mock).mockResolvedValue({
        usage: 500,
        quota: 1000
      });

      const info = await getStorageInfo();
      expect(info.used).toBe(500);
      expect(info.quota).toBe(1000);
      expect(info.percentUsed).toBe(50);
    });

    it('handles zero quota gracefully', async () => {
      (navigator.storage.estimate as jest.Mock).mockResolvedValue({
        usage: 500,
        quota: 0
      });

      const info = await getStorageInfo();
      expect(info.percentUsed).toBe(0);
    });

    it('returns defaults if API fails', async () => {
      (navigator.storage.estimate as jest.Mock).mockRejectedValue(new Error('Failed'));

      const info = await getStorageInfo();
      expect(info.used).toBe(0);
    });

    it('returns defaults if API missing', async () => {
       // Remove storage API
       Object.defineProperty(global, 'navigator', { value: {} });

       const info = await getStorageInfo();
       expect(info.used).toBe(0);
    });
  });

  describe('isStorageLow', () => {
      it('returns true if usage exceeds threshold', async () => {
          (navigator.storage.estimate as jest.Mock).mockResolvedValue({
              usage: 810,
              quota: 1000
          });

          expect(await isStorageLow()).toBe(true);
      });

      it('returns false if usage is below threshold', async () => {
          (navigator.storage.estimate as jest.Mock).mockResolvedValue({
              usage: 500,
              quota: 1000
          });

          expect(await isStorageLow()).toBe(false);
      });

      it('returns false if quota is 0 (unknown)', async () => {
          (navigator.storage.estimate as jest.Mock).mockResolvedValue({
              usage: 500,
              quota: 0
          });

          expect(await isStorageLow()).toBe(false);
      });
  });

  describe('formatBytes', () => {
      it('formats correctly', () => {
          expect(formatBytes(0)).toBe('0 Bytes');
          expect(formatBytes(1024)).toBe('1 KB');
          expect(formatBytes(1024 * 1024)).toBe('1 MB');
          expect(formatBytes(1500)).toBe('1.46 KB');
      });
  });
});
