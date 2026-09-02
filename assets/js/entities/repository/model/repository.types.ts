/**
 * A content repository, as a permission report picks one. The only reason this app knows repositories
 * exist: permissions are set on content, and content lives in one repository per project.
 */
export type Repository = {
  /** Also what the UI shows: a repository has no display name of its own. */
  id: string;
  /** Never empty, `master` first where the repository has one. */
  branches: readonly string[];
};
