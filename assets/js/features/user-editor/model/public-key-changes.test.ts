import { describe, expect, it } from 'vitest';

import {
  hasPublicKeyChanges,
  publicKeyChangeCounts,
  visiblePublicKeys,
} from './public-key-changes';
import type { UserForm } from './user-form';

const FORM: UserForm = {
  idProvider: 'system',
  name: 'jane',
  displayName: 'Jane Doe',
  email: 'jane@example.com',
  roles: [],
  groups: [],
  keyAdditions: [],
  keyRemovals: [],
};

const STORED = [
  { kid: 'kid-1', label: 'Laptop', creationTime: '2026-01-01T00:00:00Z' },
  { kid: 'kid-2' },
];

describe('visiblePublicKeys', () => {
  it('reads the stored keys as they are while nothing is staged', () => {
    const rows = visiblePublicKeys(STORED, FORM);

    expect(rows.map(({ id, state }) => [id, state])).toEqual([
      ['kid-1', 'stored'],
      ['kid-2', 'stored'],
    ]);
  });

  it('keeps a revoked key in place, marked', () => {
    const rows = visiblePublicKeys(STORED, { ...FORM, keyRemovals: ['kid-1'] });

    expect(rows[0]).toMatchObject({ id: 'kid-1', state: 'removed' });
    expect(rows).toHaveLength(2);
  });

  it('appends the keys waiting to be written, without a kid', () => {
    const rows = visiblePublicKeys(STORED, {
      ...FORM,
      keyAdditions: [{ id: 'local-1', label: 'Phone', publicKey: 'pem', privateKey: 'secret' }],
    });

    expect(rows[2]).toEqual({
      id: 'local-1',
      state: 'pending',
      label: 'Phone',
      publicKey: 'pem',
    });
  });

  it('never carries the private half of a pending pair', () => {
    const rows = visiblePublicKeys([], {
      ...FORM,
      keyAdditions: [{ id: 'local-1', publicKey: 'pem', privateKey: 'sekret-42!' }],
    });

    expect(JSON.stringify(rows)).not.toContain('sekret-42!');
  });
});

describe('publicKeyChangeCounts', () => {
  it('counts what the save will do', () => {
    const counts = publicKeyChangeCounts({
      ...FORM,
      keyAdditions: [{ id: 'local-1', publicKey: 'pem' }],
      keyRemovals: ['kid-1', 'kid-2'],
    });

    expect(counts).toEqual({ added: 1, removed: 2 });
  });
});

describe('hasPublicKeyChanges', () => {
  it('is false while nothing is staged', () => {
    expect(hasPublicKeyChanges(FORM)).toBe(false);
  });

  it('is true for an addition alone', () => {
    expect(hasPublicKeyChanges({ ...FORM, keyAdditions: [{ id: 'a', publicKey: 'pem' }] })).toBe(
      true,
    );
  });

  it('is true for a removal alone', () => {
    expect(hasPublicKeyChanges({ ...FORM, keyRemovals: ['kid-1'] })).toBe(true);
  });
});
