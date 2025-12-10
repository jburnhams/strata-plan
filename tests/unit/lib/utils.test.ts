import { cn, formatRelativeTime } from '../../../src/lib/utils';

describe('cn utility', () => {
  it('should merge class names correctly', () => {
    const result = cn('text-red-500', 'bg-blue-500');
    expect(result).toBe('text-red-500 bg-blue-500');
  });

  it('should handle conditional classes', () => {
    const result = cn('text-red-500', true && 'bg-blue-500', false && 'hidden');
    expect(result).toBe('text-red-500 bg-blue-500');
  });

  it('should resolve tailwind conflicts', () => {
    const result = cn('text-red-500', 'text-blue-500');
    expect(result).toBe('text-blue-500');
  });
});

describe('formatRelativeTime utility', () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2023-01-01T12:00:00Z'));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('should return "Just now" for less than 60 seconds', () => {
    const date = new Date('2023-01-01T11:59:30Z');
    expect(formatRelativeTime(date)).toBe('Just now');
  });

  it('should return minutes ago for less than 1 hour', () => {
    const date = new Date('2023-01-01T11:30:00Z');
    expect(formatRelativeTime(date)).toBe('30 mins ago');
  });

  it('should return hours ago for less than 24 hours', () => {
    const date = new Date('2023-01-01T09:00:00Z');
    expect(formatRelativeTime(date)).toBe('3 hours ago');
  });

  it('should return date string for more than 24 hours', () => {
    const date = new Date('2022-12-30T12:00:00Z');
    expect(formatRelativeTime(date)).not.toMatch(/ago|Just now/);
  });
});
