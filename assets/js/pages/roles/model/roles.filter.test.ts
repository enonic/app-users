import { describe, expect, it } from 'vitest';

import type { Role } from '../../../entities/principal';
import { visibleEntries } from '../../../widgets/browse-list/browse-filter';
import {
  bucketOf,
  CUSTOM_BUCKET,
  filterRolesByBucket,
  projectBucketId,
  roleBuckets,
  searchRoles,
  SYSTEM_BUCKET,
} from './roles.filter';

function role(key: string, displayName: string, description?: string): Role {
  return {
    type: 'role',
    key: key as Role['key'],
    displayName,
    description,
    modifiedTime: '2026-07-21T08:05:00Z',
  };
}

const admin = role('role:system.admin', 'Administrator', 'Full access to everything');
const store = role('role:store.manager', 'Store Manager', 'Manage products and orders');
const expert = role('role:cms.expert', 'Expert');
const intranetEditor = role('role:cms.project.intranet.editor', 'Company intranet - Editor');
const intranetOwner = role('role:cms.project.intranet.owner', 'Company intranet - Owner');

const roles = [admin, store, expert];

const labels = { system: 'System', custom: 'Custom' };

describe('searchRoles', () => {
  it('returns every role for an empty or blank query', () => {
    expect(searchRoles(roles, '')).toEqual(roles);
    expect(searchRoles(roles, '   ')).toEqual(roles);
  });

  it('matches the display name whatever the case', () => {
    expect(searchRoles(roles, 'store')).toEqual([store]);
    expect(searchRoles(roles, 'ADMINISTRATOR')).toEqual([admin]);
  });

  it('matches the description too', () => {
    expect(searchRoles(roles, 'orders')).toEqual([store]);
  });

  it('matches on part of a word', () => {
    expect(searchRoles(roles, 'admin')).toEqual([admin]);
  });

  it('survives a role without a description', () => {
    expect(searchRoles(roles, 'expert')).toEqual([expert]);
  });

  it('matches the name read off the key, which the row shows as its subtitle', () => {
    expect(searchRoles(roles, 'system.admin')).toEqual([admin]);
  });

  it('finds a project role by the project id, which differs from its display name', () => {
    expect(searchRoles([intranetEditor, store], 'intranet')).toEqual([intranetEditor]);
  });

  it('returns nothing when nothing matches', () => {
    expect(searchRoles(roles, 'nope')).toEqual([]);
  });

  it('leaves the roles it was given alone', () => {
    const original = [...roles];
    searchRoles(roles, 'store');

    expect(roles).toEqual(original);
  });
});

describe('bucketOf', () => {
  it('reports a system role as platform', () => {
    expect(bucketOf('role:system.admin')).toBe(SYSTEM_BUCKET);
  });

  it('reports a cms role the platform owns as platform, not custom', () => {
    expect(bucketOf('role:cms.admin')).toBe(SYSTEM_BUCKET);
    expect(bucketOf('role:cms.cm.app')).toBe(SYSTEM_BUCKET);
    expect(bucketOf('role:cms.expert')).toBe(SYSTEM_BUCKET);
  });

  it('reports a project role under its project', () => {
    expect(bucketOf('role:cms.project.intranet.editor')).toBe(projectBucketId('intranet'));
  });

  it('reads a project id that itself contains dots', () => {
    expect(bucketOf('role:cms.project.intranet.no.viewer')).toBe(projectBucketId('intranet.no'));
  });

  // ! Its own bucket, not custom: bucket identity may not depend on a separately loaded project list,
  // ! or a failed load reclassifies every project role and strands a ticked bucket.
  it("keeps a role of an unknown project in that project's bucket", () => {
    expect(bucketOf('role:cms.project.gone.editor')).toBe(projectBucketId('gone'));
  });

  it('reports an administrator-made role as custom', () => {
    expect(bucketOf('role:store.manager')).toBe(CUSTOM_BUCKET);
  });
});

describe('filterRolesByBucket', () => {
  const all = [admin, store, expert, intranetEditor, intranetOwner];

  it('narrows nothing when no bucket is ticked', () => {
    expect(filterRolesByBucket(all, new Set())).toEqual(all);
  });

  it('keeps only the ticked bucket', () => {
    expect(filterRolesByBucket(all, new Set([CUSTOM_BUCKET]))).toEqual([store]);
  });

  it('keeps the union of several ticked buckets', () => {
    const selected = new Set([SYSTEM_BUCKET, projectBucketId('intranet')]);

    expect(filterRolesByBucket(all, selected)).toEqual([
      admin,
      expert,
      intranetEditor,
      intranetOwner,
    ]);
  });

  it('leaves the roles it was given alone', () => {
    const original = [...all];
    filterRolesByBucket(all, new Set([SYSTEM_BUCKET]));

    expect(all).toEqual(original);
  });
});

describe('roleBuckets', () => {
  const all = [admin, store, expert, intranetEditor, intranetOwner];

  it('offers system first, custom second, then the projects', () => {
    expect(roleBuckets(all, all, labels).map(({ id }) => id)).toEqual([
      SYSTEM_BUCKET,
      CUSTOM_BUCKET,
      projectBucketId('intranet'),
    ]);
  });

  it('labels the fixed buckets from the phrases and a project from its id', () => {
    expect(roleBuckets(all, all, labels).map(({ label }) => label)).toEqual([
      'System',
      'Custom',
      'intranet',
    ]);
  });

  it('counts the roles of each bucket', () => {
    expect(roleBuckets(all, all, labels).map(({ count }) => count)).toEqual([2, 1, 2]);
  });

  it('counts the matched roles, so the counts follow the query', () => {
    const searched = searchRoles(all, 'intranet');

    expect(roleBuckets(all, searched, labels).map(({ count }) => count)).toEqual([0, 0, 2]);
  });

  // ! The bucket comes from the role keys alone, so a ticked one cannot vanish from the menu while it
  // ! goes on narrowing the list.
  it('offers a project bucket the roles name, and keeps it visible when ticked', () => {
    const offered = roleBuckets(all, all, labels);

    expect(offered.at(-1)).toEqual({
      id: projectBucketId('intranet'),
      label: 'intranet',
      count: 2,
    });
    expect(
      visibleEntries(offered, new Set([projectBucketId('intranet')])).map(({ id }) => id),
    ).toContain(projectBucketId('intranet'));
  });
});
