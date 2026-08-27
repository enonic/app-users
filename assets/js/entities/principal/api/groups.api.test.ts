import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { setGraphQlEndpoint } from '../../../shared/api';
import type { PrincipalKey } from '../model/principal.types';
import {
  fetchGroupDetail,
  fetchGroupMemberships,
  GROUPS_ROOT,
  sendGroupCreation,
  sendGroupUpdate,
  toGroups,
} from './groups.api';

let sent: { query?: string; variables?: unknown } | undefined;

function respondWith(body: unknown): void {
  globalThis.fetch = vi.fn((_url: unknown, options?: { body?: string }) => {
    sent = JSON.parse(options?.body ?? '{}') as { query?: string; variables?: unknown };
    return Promise.resolve(new Response(JSON.stringify(body)));
  }) as unknown as typeof globalThis.fetch;
}

function wireGroup(overrides: Record<string, unknown> = {}) {
  return {
    key: 'group:system:administrators',
    displayName: 'Administrators',
    description: 'The admins',
    ...overrides,
  };
}

const ENDPOINT = '/admin/tool/_/admin:extension/app:users/graphql';

describe('GROUPS_ROOT', () => {
  // ! Two calls per group, `getMembers` plus `getMemberships`, and neither has a count to ask for instead.
  // ! Groups are the half of this that could not wait: roles are bounded, groups are not.
  it('asks for neither members nor roles', () => {
    expect(GROUPS_ROOT.selection).not.toContain('members');
    expect(GROUPS_ROOT.selection).not.toContain('roles');
  });
});

describe('toGroups', () => {
  it('maps the wire payload to the domain group', () => {
    expect(toGroups([wireGroup()])).toEqual([
      {
        type: 'group',
        key: 'group:system:administrators',
        displayName: 'Administrators',
        description: 'The admins',
      },
    ]);
  });

  it('reports a null description as absent', () => {
    const [group] = toGroups([wireGroup({ description: null })]);

    expect(group?.description).toBeUndefined();
  });

  it('reports an empty description as absent, so the panel omits the field', () => {
    const [group] = toGroups([wireGroup({ description: '' })]);

    expect(group?.description).toBeUndefined();
  });

  it('answers an empty list when the instance carries no groups', () => {
    expect(toGroups([])).toEqual([]);
  });
});

describe('fetchGroupDetail', () => {
  beforeEach(() => {
    setGraphQlEndpoint(ENDPOINT);
    sent = undefined;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('asks by key through a variable, never through the query text', async () => {
    respondWith({ data: { group: { ...wireGroup(), members: [], roles: [], groups: [] } } });

    await fetchGroupDetail('group:system:administrators', false);

    expect(sent?.variables).toEqual({ key: 'group:system:administrators', transitive: false });
    expect(sent?.query).not.toContain('group:system:administrators');
  });

  it('carries the transitive choice as a variable', async () => {
    respondWith({ data: { group: { ...wireGroup(), members: [], roles: [], groups: [] } } });

    await fetchGroupDetail('group:system:administrators', true);

    expect(sent?.variables).toEqual({ key: 'group:system:administrators', transitive: true });
    expect(sent?.query).toContain('roles(transitive: $transitive)');
    expect(sent?.query).toContain('groups(transitive: $transitive)');
  });

  it('maps the members, the roles and the parent groups separately', async () => {
    respondWith({
      data: {
        group: {
          ...wireGroup(),
          members: [{ key: 'user:system:su', type: 'user', displayName: 'Super User' }],
          roles: [{ key: 'role:system.admin', type: 'role', displayName: 'Administrator' }],
          groups: [{ key: 'group:system:staff', type: 'group', displayName: 'Staff' }],
        },
      },
    });

    const group = (await fetchGroupDetail('group:system:administrators', false))._unsafeUnwrap();

    expect(group?.members).toEqual([
      { key: 'user:system:su', type: 'user', displayName: 'Super User' },
    ]);
    expect(group?.roles).toEqual([
      { key: 'role:system.admin', type: 'role', displayName: 'Administrator' },
    ]);
    expect(group?.groups).toEqual([
      { key: 'group:system:staff', type: 'group', displayName: 'Staff' },
    ]);
  });

  it('answers nothing for a key no group answers to', async () => {
    respondWith({ data: { group: null } });

    const result = await fetchGroupDetail('group:system:gone', false);

    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap()).toBeUndefined();
  });

  it('fails when the field could not be read', async () => {
    respondWith({ errors: [{ message: 'Memberships are unreadable' }] });

    const result = await fetchGroupDetail('group:system:administrators', false);

    expect(result.isErr()).toBe(true);
  });
});

describe('fetchGroupMemberships', () => {
  beforeEach(() => {
    setGraphQlEndpoint(ENDPOINT);
    sent = undefined;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('asks for the memberships alone, leaving the members the panel already shows', async () => {
    respondWith({ data: { group: { roles: [], groups: [] } } });

    await fetchGroupMemberships('group:system:administrators', true);

    expect(sent?.variables).toEqual({ key: 'group:system:administrators', transitive: true });
    expect(sent?.query).not.toContain('members');
  });

  it('answers nothing for a key no group answers to', async () => {
    respondWith({ data: { group: null } });

    const result = await fetchGroupMemberships('group:system:gone', true);

    expect(result._unsafeUnwrap()).toBeUndefined();
  });
});

describe('sendGroupCreation', () => {
  beforeEach(() => {
    setGraphQlEndpoint(ENDPOINT);
    sent = undefined;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sends every value as a variable, never through the query text', async () => {
    respondWith({ data: { createGroup: wireGroup({ key: 'group:store:managers' }) } });

    await sendGroupCreation('store', 'managers', {
      displayName: 'Managers',
      description: 'Runs the shops',
      members: ['user:store:alice' as PrincipalKey],
      roles: ['role:cms.admin' as PrincipalKey],
    });

    expect(sent?.variables).toEqual({
      idProvider: 'store',
      name: 'managers',
      displayName: 'Managers',
      description: 'Runs the shops',
      members: ['user:store:alice'],
      roles: ['role:cms.admin'],
    });
    expect(sent?.query).not.toContain('Managers');
  });

  it('maps the group the server wrote', async () => {
    respondWith({ data: { createGroup: wireGroup({ key: 'group:store:managers' }) } });

    const group = (
      await sendGroupCreation('store', 'managers', {
        displayName: 'Managers',
        members: [],
        roles: [],
      })
    )._unsafeUnwrap();

    expect(group).toEqual({
      type: 'group',
      key: 'group:store:managers',
      displayName: 'Administrators',
      description: 'The admins',
    });
  });

  // ! Unlike a read, a null here says nothing about whether the group exists now.
  it('fails when the field came back null', async () => {
    respondWith({ data: { createGroup: null } });

    const result = await sendGroupCreation('store', 'managers', {
      displayName: 'Managers',
      members: [],
      roles: [],
    });

    expect(result.isErr()).toBe(true);
  });

  it('fails with the message the server gave', async () => {
    respondWith({ errors: [{ message: 'No ID provider answers to [gone]' }] });

    const result = await sendGroupCreation('gone', 'managers', {
      displayName: 'Managers',
      members: [],
      roles: [],
    });

    expect(result._unsafeUnwrapErr().message).toBe('No ID provider answers to [gone]');
  });
});

describe('sendGroupUpdate', () => {
  beforeEach(() => {
    setGraphQlEndpoint(ENDPOINT);
    sent = undefined;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function changes(overrides: Record<string, unknown> = {}) {
    return {
      displayName: 'Managers',
      addMembers: [],
      removeMembers: [],
      addRoles: [],
      removeRoles: [],
      ...overrides,
    };
  }

  it('sends the key and the four change lists', async () => {
    respondWith({ data: { updateGroup: wireGroup() } });

    await sendGroupUpdate(
      'group:store:managers',
      changes({
        addMembers: ['user:store:bob' as PrincipalKey],
        removeMembers: ['user:store:alice' as PrincipalKey],
        addRoles: ['role:cms.expert' as PrincipalKey],
        removeRoles: ['role:cms.admin' as PrincipalKey],
      }),
    );

    expect(sent?.variables).toEqual({
      key: 'group:store:managers',
      displayName: 'Managers',
      description: undefined,
      addMembers: ['user:store:bob'],
      removeMembers: ['user:store:alice'],
      addRoles: ['role:cms.expert'],
      removeRoles: ['role:cms.admin'],
    });
  });

  it('carries no key at all for an edit that touched neither list', async () => {
    respondWith({ data: { updateGroup: wireGroup() } });

    await sendGroupUpdate('group:store:managers', changes({ description: 'Just this' }));

    expect(sent?.variables).toMatchObject({
      addMembers: [],
      removeMembers: [],
      addRoles: [],
      removeRoles: [],
    });
  });

  it('fails when the field came back null', async () => {
    respondWith({ data: { updateGroup: null } });

    const result = await sendGroupUpdate('group:store:gone', changes());

    expect(result.isErr()).toBe(true);
  });
});
