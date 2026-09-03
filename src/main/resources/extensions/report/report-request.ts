import { hasRole } from '/lib/xp/auth';
import type { Request, Response } from '/lib/xp/core';
import { get as getRepository } from '/lib/xp/repo';

import { generatePermissionReport } from './permission-report';

/** The three names that identify a report; nothing else about the request matters. */
export type ReportRequest = Pick<Request, 'params'>;

const SYSTEM_ADMIN = 'role:system.admin';

/** A user or group carries its provider; a role has no provider to carry. */
const PRINCIPAL_KEY = /^(?:(?:user|group):[^:]+:[^:]+|role:[^:]+)$/;

/**
 * `GET /report?principalKey&repositoryId&branch` — the whole permission report, as a CSV attachment.
 *
 * ! Its own gate. The four sections are open to `system.user.admin` and `system.user.app`, so the
 * ! platform gates that ran before this was reached are wider than the report: it lists the entire
 * ! content tree of a repository, which is not a user administrator's to read. Only a system
 * ! administrator has ever been able to generate one (#113), and that has to be checked here.
 */
export function handleReportRequest(request: ReportRequest): Response {
  if (!hasRole(SYSTEM_ADMIN)) {
    return problem(403, 'A permission report is only available to a system administrator');
  }

  const principalKey = single(request.params.principalKey);
  const repositoryId = single(request.params.repositoryId);
  const branch = single(request.params.branch);

  if (principalKey === undefined || repositoryId === undefined || branch === undefined) {
    return problem(400, 'A report needs a principalKey, a repositoryId and a branch');
  }

  if (!PRINCIPAL_KEY.test(principalKey)) {
    return problem(400, `[${principalKey}] is not a user, group or role key`);
  }

  // ! Everything below can throw — a key naming no principal, an id the platform will not parse, a
  // ! read that fails halfway through the tree. Uncaught, XP answers with an error page, and a caller
  // ! expecting a file would save that instead of being told what went wrong.
  try {
    // Answered here rather than left to the connection: `connect` throws for both, and a 404 saying
    // which of the two is missing is worth the read.
    const repository = getRepository(repositoryId);

    if (repository == null) {
      return problem(404, `No repository answers to [${repositoryId}]`);
    }

    if (repository.branches.indexOf(branch) < 0) {
      return problem(404, `Repository [${repositoryId}] has no branch [${branch}]`);
    }

    return {
      status: 200,
      contentType: 'text/csv; charset=utf-8',
      headers: {
        'Content-Disposition': `attachment; filename="${fileName(principalKey, repositoryId, branch)}"`,
      },
      body: generatePermissionReport({ principalKey, repositoryId, branch }),
    };
  } catch (error) {
    return problem(500, messageOf(error));
  }
}

//
// * Internal
//

/** A repeated query parameter arrives as an array; a report is about one of everything. */
function single(value: string | string[] | undefined): string | undefined {
  const first = Array.isArray(value) ? value[0] : value;

  return first != null && first.length > 0 ? first : undefined;
}

// ! Stripped rather than escaped: the value reaches a response header, and a quote or a newline in it
// ! would let a query parameter write headers of its own.
function fileName(principalKey: string, repositoryId: string, branch: string): string {
  const safe = (value: string): string => value.replace(/[^A-Za-z0-9._-]/g, '');
  const principal = safe(principalKey.replace(/:/g, '_'));

  return `perm-report-${principal}-${safe(repositoryId)}(${safe(branch)}).csv`;
}

function messageOf(error: unknown): string {
  const { message } = (error ?? {}) as { message?: unknown };

  return typeof message === 'string' && message.length > 0
    ? message
    : 'The report could not be generated';
}

/**
 * A refusal the section can show. JSON, because that is the shape the client transport reads a
 * message out of — the CSV body is for the success path alone.
 */
function problem(status: number, message: string): Response {
  return {
    status,
    contentType: 'application/json',
    body: { message },
  };
}
