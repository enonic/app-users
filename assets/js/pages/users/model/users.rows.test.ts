import { describe, expect, it } from 'vitest';

import type { User } from '../../../entities/principal';
import { toUserRow } from './users.rows';

const user: User = {
  type: 'user',
  key: 'user:ldap:alice',
  displayName: 'Alice Ward',
  login: 'alice',
  email: 'alice.ward@example.com',
  idProvider: 'ldap',
  hasPassword: false,
};

describe('toUserRow', () => {
  it('keys the row by the user key so the route param matches', () => {
    expect(toUserRow(user).key).toBe('user:ldap:alice');
  });

  it('shows the display name over the user name', () => {
    const { title, subtitle } = toUserRow(user);

    expect(title).toBe('Alice Ward');
    expect(subtitle).toBe('alice');
  });

  it('names the provider in its only meta cell', () => {
    expect(toUserRow(user, undefined, () => 'Company directory').meta).toEqual([
      'Company directory',
    ]);
  });

  it('leaves the cell out while the providers have not arrived', () => {
    expect(toUserRow(user).meta).toBeUndefined();
  });

  it('carries the icon the page hands it', () => {
    expect(toUserRow(user, 'icon').icon).toBe('icon');
  });
});
