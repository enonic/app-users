import { hasRole } from '/lib/xp/auth';
import { list } from '/lib/xp/repo';

/** A repository as the permission report needs it: what to connect to, and on which branch. */
export type RepositorySource = {
  id: string;
  branches: string[];
};

const SYSTEM_ADMIN = 'role:system.admin';

/**
 * ! Content repositories only, by the id XP gives them. The report walks `/content*`, so every other
 * ! repository — `system-repo` above all — would answer with a header and nothing under it. Offering
 * ! those would be offering an empty file.
 */
const CONTENT_REPOSITORY = /^com\.enonic\.cms\./;

/** The branch a report defaults to: what is published is what an audit usually asks about (#131). */
const DEFAULT_BRANCH = 'master';

/**
 * The repositories a permission report can be generated from, or null where the caller may not ask.
 *
 * ! `repo.list` is administrator-only in the platform and throws otherwise, so the gate is not
 * ! decoration: the four sections are open to `system.user.admin` and `system.user.app`, and the
 * ! report — this field's only consumer — is not.
 */
export function listContentRepositories(): RepositorySource[] | null {
  if (!hasRole(SYSTEM_ADMIN)) {
    return null;
  }

  return list()
    .filter(({ id }) => CONTENT_REPOSITORY.test(id))
    .map(({ id, branches }) => ({ id, branches: [...branches].sort(byBranch) }))
    .sort((a, b) => a.id.localeCompare(b.id));
}

//
// * Internal
//

function byBranch(a: string, b: string): number {
  if (a === b) {
    return 0;
  }

  if (a === DEFAULT_BRANCH || b === DEFAULT_BRANCH) {
    return a === DEFAULT_BRANCH ? -1 : 1;
  }

  return a.localeCompare(b);
}
