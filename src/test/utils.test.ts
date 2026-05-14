import { describe, it, expect } from 'vitest';
import { cn, getImageUrl } from '@/lib/utils';

describe('cn() utility', () => {
  it('merges tailwind classes correctly', () => {
    expect(cn('px-4', 'py-2')).toBe('px-4 py-2');
  });

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'visible')).toBe('base visible');
  });

  it('resolves conflicts (last wins)', () => {
    expect(cn('px-4', 'px-6')).toBe('px-6');
  });

  it('accepts multiple arguments', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c');
  });

  it('returns empty string for no args', () => {
    expect(cn()).toBe('');
  });
});

describe('getImageUrl()', () => {
  it('returns placeholder for null', () => {
    expect(getImageUrl(null)).toBe('/placeholder.jpg');
  });

  it('returns placeholder for undefined', () => {
    expect(getImageUrl(undefined)).toBe('/placeholder.jpg');
  });

  it('returns URL as-is for absolute URLs', () => {
    expect(getImageUrl('https://example.com/img.jpg')).toBe('https://example.com/img.jpg');
  });

  it('strips leading slash from relative paths', () => {
    const result = getImageUrl('/uploads/photo.jpg');
    expect(result).toBe('http://127.0.0.1:8000/api/uploads/photo.jpg');
  });

  it('handles relative paths without leading slash', () => {
    const result = getImageUrl('uploads/photo.jpg');
    expect(result).toBe('http://127.0.0.1:8000/api/uploads/photo.jpg');
  });
});
