import { getMemberships, type GroupKey, type UserKey } from '/lib/xp/auth';
import type { Filter } from '/lib/xp/core';
import {
  connect,
  type AccessControlEntry,
  type Node,
  type Permission,
  type RepoConnection,
} from '/lib/xp/node';

export type PermissionReportParams = {
  /** A user, group or role — the principal the report answers for. */
  principalKey: string;
  repositoryId: string;
  branch: string;
};

/**
 * The columns, in the order the report has always written them. The header keeps the spacing the
 * legacy report shipped with (`enonic/xp#6403`), because a spreadsheet somewhere is keyed on it.
 */
const PERMISSIONS: readonly Permission[] = [
  'READ',
  'CREATE',
  'MODIFY',
  'DELETE',
  'PUBLISH',
  'READ_PERMISSIONS',
  'WRITE_PERMISSIONS',
];

const HEADER = 'Path, Read, Create, Modify, Delete, Publish, ReadPerm., WritePerm.';

/** Only the content tree is reported on; `/issues` and the other roots are not permissions a person reads. */
const CONTENT_ROOT = '/content';

const SYSTEM_ADMIN = 'role:system.admin';
const EVERYONE = 'role:system.everyone';
const AUTHENTICATED = 'role:system.authenticated';
const ANONYMOUS = 'user:system:anonymous';

const CONTENT_QUERY = { like: { field: '_path', value: `${CONTENT_ROOT}*` } };

/** `NodeSearchService.GET_ALL_SIZE_FLAG`, honoured in `SearchExecutor`: the report is a full listing. */
const ALL = -1;

/**
 * How many nodes are read per round trip. The search answers with ids alone; the permissions live on
 * the nodes, so those have to be read — and read one id at a time, as this did until now, a repository
 * of any size is one round trip per content on the app's single JS thread.
 */
const BATCH = 1000;

/**
 * What the principal may do to every content it can see, as CSV — one row per path, one column per
 * permission, `X` where the permission holds.
 *
 * The answer is not readable off any single ACL: an entry matches a principal by key, and a person
 * arrives under several — their own, every group and role they hold transitively, and the two roles
 * the platform grants without storing them anywhere. This resolves that closure once and applies it
 * to every node.
 */
export function generatePermissionReport({
  principalKey,
  repositoryId,
  branch,
}: PermissionReportParams): string {
  const keys = effectiveKeys(principalKey);
  const connection = connect({ repoId: repositoryId, branch });

  // A system administrator passes every permission check the repository can make, so there is nothing
  // to filter and nothing to read: every node, every column (#123).
  if (keys.indexOf(SYSTEM_ADMIN) >= 0) {
    return write(connection, undefined, undefined);
  }

  return write(
    connection,
    { hasValue: { field: '_permissions.read', values: keys } },
    new Set(keys),
  );
}

//
// * Internal
//

/**
 * Every key an access control entry can name and still be about this principal.
 *
 * ! Transitive, and that is the whole point of the feature: a permission granted to a group two
 * ! levels up is as real as one granted by name, and only the closure shows it.
 */
function effectiveKeys(principalKey: string): string[] {
  const keys = [principalKey];

  // A role holds no memberships — it is what others hold — and asking would throw.
  if (!principalKey.startsWith('role:')) {
    for (const membership of getMemberships(principalKey as GroupKey | UserKey, true)) {
      keys.push(membership.key);
    }
  }

  // ! Neither role is stored on the user, so neither comes back from `getMemberships`: the platform
  // ! adds them to the authenticated context at login. A report leaving them out would miss every
  // ! permission granted to "everyone", which is most of a default installation's read access.
  if (principalKey.startsWith('user:')) {
    keys.push(EVERYONE);

    if (principalKey !== ANONYMOUS) {
      keys.push(AUTHENTICATED);
    }
  }

  return keys;
}

/**
 * Walks the content tree and writes a row per node. `matching` absent means the administrator case:
 * no filter was applied and no ACL is read, so every column is granted.
 *
 * ? Rows are sorted at the end rather than by the search. A node query orders by score, and every hit
 * ? here matches a filter rather than a query, so they all score alike and the order is the index's to
 * ? choose — while a report is read as a tree, top down. Every row begins with its path, so sorting
 * ? the lines is sorting by path, and the file is held whole in memory either way.
 */
function write(
  connection: RepoConnection,
  filters: Filter | undefined,
  matching: ReadonlySet<string> | undefined,
): string {
  const { hits } = connection.query({ count: ALL, query: CONTENT_QUERY, filters });
  const rows: string[] = [];

  for (let from = 0; from < hits.length; from += BATCH) {
    for (const node of read(connection, hits.slice(from, from + BATCH))) {
      rows.push(row(node, matching));
    }
  }

  return [HEADER, ...rows.sort()].join('\n');
}

function read(connection: RepoConnection, hits: readonly { id: string }[]): Node[] {
  const nodes = connection.get(hits.map(({ id }) => id));

  if (nodes == null) {
    return [];
  }

  return Array.isArray(nodes) ? nodes : [nodes];
}

function row(node: Node, matching: ReadonlySet<string> | undefined): string {
  const granted = matching === undefined ? undefined : granting(node._permissions, matching);

  const columns = PERMISSIONS.map((permission) =>
    granted === undefined || granted.has(permission) ? 'X' : '',
  );

  return [field(contentPath(node._path)), ...columns].join(',');
}

/** A deny anywhere in the closure wins: one group's refusal is not undone by another's grant. */
function granting(
  entries: readonly AccessControlEntry[],
  matching: ReadonlySet<string>,
): ReadonlySet<Permission> {
  const allowed = new Set<Permission>();
  const denied = new Set<Permission>();

  for (const entry of entries) {
    if (!matching.has(entry.principal)) {
      continue;
    }

    for (const permission of entry.allow ?? []) {
      allowed.add(permission);
    }

    for (const permission of entry.deny ?? []) {
      denied.add(permission);
    }
  }

  for (const permission of denied) {
    allowed.delete(permission);
  }

  return allowed;
}

/** The tree as the administrator navigates it, so the paths line up with what Content Studio shows (#430). */
function contentPath(nodePath: string): string {
  const path = nodePath.slice(CONTENT_ROOT.length);

  return path.length === 0 ? '/' : path;
}

// ? XP normalizes a content name down to letters, digits and `-_.`, so a separator inside a path is
// ? not reachable today. Quoted anyway when it appears: one stray comma silently shifts every column
// ? after it, and a report nobody can trust is worse than no report.
function field(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}
