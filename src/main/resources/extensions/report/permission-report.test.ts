import { getMemberships, type Group, type Role } from '/lib/xp/auth';
import { connect, type AccessControlEntry, type Node } from '/lib/xp/node';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { get, hits, query } from '../../../../../test/mocks/lib-xp-node';
import { generatePermissionReport } from './permission-report';

const HEADER = 'Path, Read, Create, Modify, Delete, Publish, ReadPerm., WritePerm.';

const MODIFIED = '2026-08-01T10:00:00Z';

function node(path: string, permissions: AccessControlEntry[] = []): Node {
  return { _path: path, _permissions: permissions } as Node;
}

function group(key: string): Group {
  return { type: 'group', key: key as Group['key'], displayName: key, modifiedTime: MODIFIED };
}

function role(key: string): Role {
  return { type: 'role', key: key as Role['key'], displayName: key, modifiedTime: MODIFIED };
}

/** A repository small enough for the whole tree to come back from one read. */
function tree(nodes: Node[]): void {
  vi.mocked(query).mockReturnValue(hits(nodes.map((_, index) => String(index))));
  vi.mocked(get).mockReturnValue(nodes);
}

function report(principalKey = 'user:system:jdoe'): string[] {
  return generatePermissionReport({
    principalKey,
    repositoryId: 'com.enonic.cms.default',
    branch: 'master',
  }).split('\n');
}

afterEach(() => {
  vi.resetAllMocks();
});

describe('generatePermissionReport', () => {
  it('writes the legacy header before anything else', () => {
    vi.mocked(getMemberships).mockReturnValue([]);
    tree([]);

    expect(report()).toEqual([HEADER]);
  });

  it('connects to the repository and branch asked for', () => {
    vi.mocked(getMemberships).mockReturnValue([]);
    tree([]);

    report();

    expect(vi.mocked(connect)).toHaveBeenCalledWith({
      repoId: 'com.enonic.cms.default',
      branch: 'master',
    });
  });

  it('marks a permission granted to the principal by name', () => {
    vi.mocked(getMemberships).mockReturnValue([]);
    tree([node('/content/news', [{ principal: 'user:system:jdoe', allow: ['READ', 'PUBLISH'] }])]);

    expect(report()[1]).toBe('/news,X,,,,X,,');
  });

  it('marks a permission granted through a transitive membership', () => {
    vi.mocked(getMemberships).mockReturnValue([group('group:system:editors')]);
    tree([node('/content/news', [{ principal: 'group:system:editors', allow: ['MODIFY'] }])]);

    expect(report()[1]).toBe('/news,,,X,,,,');
    expect(vi.mocked(getMemberships)).toHaveBeenCalledWith('user:system:jdoe', true);
  });

  it('counts the roles the platform grants a user without storing them', () => {
    vi.mocked(getMemberships).mockReturnValue([]);
    tree([
      node('/content/public', [{ principal: 'role:system.everyone', allow: ['READ'] }]),
      node('/content/members', [{ principal: 'role:system.authenticated', allow: ['READ'] }]),
    ]);

    // Sorted by path, which is why `/members` leads a tree that came back the other way round.
    expect(report().slice(1)).toEqual(['/members,X,,,,,,', '/public,X,,,,,,']);
  });

  it('leaves the authenticated role out for anonymous', () => {
    vi.mocked(getMemberships).mockReturnValue([]);
    tree([node('/content/members', [{ principal: 'role:system.authenticated', allow: ['READ'] }])]);

    expect(report('user:system:anonymous')[1]).toBe('/members,,,,,,,');
  });

  it('asks for no memberships when the report is about a role', () => {
    tree([node('/content/news', [{ principal: 'role:cms.expert', allow: ['READ'] }])]);

    expect(report('role:cms.expert')[1]).toBe('/news,X,,,,,,');
    expect(vi.mocked(getMemberships)).not.toHaveBeenCalled();
  });

  it('lets a deny anywhere in the closure beat a grant elsewhere', () => {
    vi.mocked(getMemberships).mockReturnValue([group('group:system:editors')]);
    tree([
      node('/content/news', [
        { principal: 'group:system:editors', allow: ['READ', 'DELETE'] },
        { principal: 'user:system:jdoe', deny: ['DELETE'] },
      ]),
    ]);

    expect(report()[1]).toBe('/news,X,,,,,,');
  });

  it('ignores entries naming a principal outside the closure', () => {
    vi.mocked(getMemberships).mockReturnValue([]);
    tree([node('/content/news', [{ principal: 'user:system:other', allow: ['READ'] }])]);

    expect(report()[1]).toBe('/news,,,,,,,');
  });

  it('shows the content root as /', () => {
    vi.mocked(getMemberships).mockReturnValue([]);
    tree([node('/content', [{ principal: 'user:system:jdoe', allow: ['READ'] }])]);

    expect(report()[1]).toBe('/,X,,,,,,');
  });

  it('quotes a path holding a separator', () => {
    vi.mocked(getMemberships).mockReturnValue([]);
    tree([node('/content/a,b')]);

    expect(report()[1]).toBe('"/a,b",,,,,,,');
  });

  describe('for a system administrator', () => {
    it('grants every column without reading a single access control entry', () => {
      vi.mocked(getMemberships).mockReturnValue([role('role:system.admin')]);
      tree([node('/content/news')]);

      expect(report()[1]).toBe('/news,X,X,X,X,X,X,X');
    });

    it('walks the repository unfiltered', () => {
      vi.mocked(getMemberships).mockReturnValue([role('role:system.admin')]);
      tree([]);

      report();

      expect(vi.mocked(query).mock.calls[0]?.[0]).toMatchObject({ filters: undefined });
    });
  });

  describe('reading the tree', () => {
    it('filters on read access for everyone else', () => {
      vi.mocked(getMemberships).mockReturnValue([group('group:system:editors')]);
      tree([]);

      report();

      expect(vi.mocked(query).mock.calls[0]?.[0]).toMatchObject({
        filters: {
          hasValue: {
            field: '_permissions.read',
            values: [
              'user:system:jdoe',
              'group:system:editors',
              'role:system.everyone',
              'role:system.authenticated',
            ],
          },
        },
      });
    });

    it('asks the search for the whole tree, once', () => {
      vi.mocked(getMemberships).mockReturnValue([]);
      tree([node('/content/news')]);

      report();

      expect(vi.mocked(query)).toHaveBeenCalledTimes(1);
      expect(vi.mocked(query).mock.calls[0]?.[0]).toMatchObject({ count: -1 });
    });

    it('reads the nodes in batches rather than one at a time', () => {
      const nodes = Array.from({ length: 2500 }, (_, index) => node(`/content/${index}`));

      vi.mocked(getMemberships).mockReturnValue([]);
      vi.mocked(query).mockReturnValue(hits(nodes.map((_, index) => String(index))));
      vi.mocked(get).mockImplementation((keys) => nodes.slice(0, keys.length));

      report();

      expect(vi.mocked(get)).toHaveBeenCalledTimes(3);
      expect(vi.mocked(get).mock.calls[0]?.[0]).toHaveLength(1000);
      expect(vi.mocked(get).mock.calls[2]?.[0]).toHaveLength(500);
    });

    it('survives a repository holding a single content, which comes back unwrapped', () => {
      vi.mocked(getMemberships).mockReturnValue([]);
      vi.mocked(query).mockReturnValue(hits(['0']));
      vi.mocked(get).mockReturnValue(node('/content/only'));

      expect(report()[1]).toBe('/only,,,,,,,');
    });
  });
});
