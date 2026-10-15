import { describe, expect, it } from 'vitest';

import { splitMembers } from './principal-members';
import type { PrincipalRef } from './principal.types';

const ref = (type: PrincipalRef['type'], key: PrincipalRef['key']): PrincipalRef => ({
  type,
  key,
  displayName: key,
});

describe('splitMembers', () => {
  it('puts each member in its own bucket, keeping the order', () => {
    const su = ref('user', 'user:system:su');
    const bot = ref('user', 'user:system:bot');
    const alice = ref('user', 'user:ldap:alice');
    const bob = ref('user', 'user:ldap:bob');
    const admins = ref('group', 'group:system:administrators');

    expect(splitMembers([su, alice, admins, bot, bob])).toEqual({
      users: [alice, bob],
      serviceAccounts: [su, bot],
      groups: [admins],
    });
  });

  it('gives three empty buckets for no members', () => {
    expect(splitMembers([])).toEqual({ users: [], serviceAccounts: [], groups: [] });
  });
});
