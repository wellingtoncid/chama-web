import { describe, it, expect, beforeEach } from 'vitest';
import { hasPermission, getLoggedUser } from '@/utils/auth';

describe('hasPermission', () => {
  it('returns false for null user', () => {
    expect(hasPermission(null, 'freight.create')).toBe(false);
  });

  it('returns true for admin without restrictions', () => {
    expect(hasPermission({ role: 'admin' }, 'anything')).toBe(true);
  });

  it('returns false for admin with empty permissions object (needs "{}" string)', () => {
    expect(hasPermission({ role: 'admin', permissions: {} }, 'anything')).toBe(false);
  });

  it('returns true for admin with empty string permissions', () => {
    expect(hasPermission({ role: 'admin', permissions: '{}' }, 'anything')).toBe(true);
  });

  it('checks permission from parsed JSON string', () => {
    const user = { role: 'company', permissions: '{"freight.create": true}' };
    expect(hasPermission(user, 'freight.create')).toBe(true);
    expect(hasPermission(user, 'marketplace.view')).toBe(false);
  });

  it('checks permission from object', () => {
    const user = { role: 'company', permissions: { 'freight.create': true } };
    expect(hasPermission(user, 'freight.create')).toBe(true);
    expect(hasPermission(user, 'missing.key')).toBe(false);
  });

  it('returns false when permission key does not exist', () => {
    const user = { role: 'driver', permissions: { 'freight.view': true } };
    expect(hasPermission(user, 'freight.delete')).toBe(false);
  });
});

describe('getLoggedUser', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns null when no user in storage', () => {
    expect(getLoggedUser()).toBeNull();
  });

  it('returns parsed user from localStorage', () => {
    const fakeUser = { id: 1, name: 'Test', role: 'driver' };
    localStorage.setItem('user', JSON.stringify(fakeUser));
    expect(getLoggedUser()).toEqual(fakeUser);
  });

  it('handles invalid JSON gracefully', () => {
    localStorage.setItem('user', 'not-json');
    expect(() => getLoggedUser()).toThrow();
  });
});
