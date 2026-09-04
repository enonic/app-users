import { Result, type ResultAsync } from 'neverthrow';

import type { Repository } from '../../../entities/repository';
import { AppError, requestText } from '../../../shared/api';

/** One report: what a principal may do in one branch of one repository. */
export type ReportTarget = {
  principalKey: string;
  repositoryId: string;
  branch: string;
};

/**
 * ? Beside `/graphql` under the section's own prefix rather than a field on it. The body is a file the
 * ? browser saves — routing it through a GraphQL envelope would encode a megabyte of CSV as a JSON
 * ? string on the way out and decode it on the way in, for nothing.
 */
export function reportUrl(baseUrl: string, target: ReportTarget): string {
  const params = new URLSearchParams({
    principalKey: target.principalKey,
    repositoryId: target.repositoryId,
    branch: target.branch,
  });

  return `${baseUrl}/report?${params.toString()}`;
}

// ! `:` replaced by hand: Windows refuses it in a file name, and each browser substitutes its own.
export function reportFileName({ principalKey, repositoryId, branch }: ReportTarget): string {
  return `perm-report-${principalKey.replace(/:/g, '_')}-${repositoryId}(${branch}).csv`;
}

/** The branch a repository starts on: the server puts `master` first where the repository has one. */
export function defaultBranchOf({ branches }: Repository): string {
  return branches[0] ?? 'master';
}

/**
 * What the button generates, in the order the rows are shown. A picked repository the list no longer
 * holds is dropped rather than reported on a guess.
 */
export function reportTargets(
  principalKey: string,
  repositories: readonly Repository[],
  picked: readonly string[],
  branchOf: Readonly<Record<string, string>>,
): ReportTarget[] {
  return repositories
    .filter(({ id }) => picked.includes(id))
    .map((repository) => ({
      principalKey,
      repositoryId: repository.id,
      branch: branchOf[repository.id] ?? defaultBranchOf(repository),
    }));
}

/**
 * ! Saving is inside the chain, not after it. `ResultAsync.map` lets a throw from its own callback
 * ! reject the promise — and building a blob out of a report is exactly where a browser gives up on a
 * ! large one. Rejected, it escapes the caller's `isErr` check and takes the button's "Generating…"
 * ! with it; as a value, a failed save reads like a failed request.
 */
export function downloadPermissionReport(
  baseUrl: string,
  target: ReportTarget,
): ResultAsync<void, AppError> {
  return requestText(reportUrl(baseUrl, target)).andThen((csv) => saved(csv, target));
}

//
// * Internal
//

const saved = Result.fromThrowable(
  (csv: string, target: ReportTarget) => {
    save(csv, reportFileName(target));
  },
  (error) => new AppError('The report could not be saved', error),
);

function save(csv: string, fileName: string): void {
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = fileName;

  document.body.append(anchor);
  anchor.click();
  anchor.remove();

  setTimeout(() => URL.revokeObjectURL(url), 0);
}
