import { afterEach, describe, expect, it, vi } from 'vitest';

import type { Repository } from '../../../entities/repository';
import {
  defaultBranchOf,
  downloadPermissionReport,
  reportFileName,
  reportTargets,
  reportUrl,
} from './permission-report';

const BASE_URL =
  '/admin/com.enonic.xp.app.settings/main/_/admin:extension/com.enonic.xp.app.users:users';

const TARGET = {
  principalKey: 'user:system:jdoe',
  repositoryId: 'com.enonic.cms.default',
  branch: 'master',
};

function repository(id: string, branches: string[] = ['master', 'draft']): Repository {
  return { id, branches };
}

describe('reportUrl', () => {
  it('asks the section prefix the transport already talks to', () => {
    expect(reportUrl(BASE_URL, TARGET)).toBe(
      `${BASE_URL}/report?principalKey=user%3Asystem%3Ajdoe&repositoryId=com.enonic.cms.default&branch=master`,
    );
  });

  it('escapes a principal key rather than pasting it into the query', () => {
    expect(reportUrl(BASE_URL, { ...TARGET, principalKey: 'group:my idp:a&b' })).toContain(
      'principalKey=group%3Amy+idp%3Aa%26b',
    );
  });
});

describe('reportFileName', () => {
  it('names the file the way the legacy report did', () => {
    expect(reportFileName(TARGET)).toBe('perm-report-com.enonic.cms.default(master).csv');
  });
});

describe('defaultBranchOf', () => {
  it('takes the first branch, which the server has already put master at', () => {
    expect(defaultBranchOf(repository('com.enonic.cms.default'))).toBe('master');
  });
});

describe('reportTargets', () => {
  const repositories = [
    repository('com.enonic.cms.default'),
    repository('com.enonic.cms.intranet'),
  ];

  it('reports on the picked repositories in the order they are shown', () => {
    const targets = reportTargets(
      'user:system:jdoe',
      repositories,
      ['com.enonic.cms.intranet', 'com.enonic.cms.default'],
      {},
    );

    expect(targets.map(({ repositoryId }) => repositoryId)).toEqual([
      'com.enonic.cms.default',
      'com.enonic.cms.intranet',
    ]);
  });

  it('takes the branch the row picked, and the default for the rest', () => {
    const targets = reportTargets(
      'user:system:jdoe',
      repositories,
      ['com.enonic.cms.default', 'com.enonic.cms.intranet'],
      { 'com.enonic.cms.default': 'draft' },
    );

    expect(targets.map(({ branch }) => branch)).toEqual(['draft', 'master']);
  });

  it('drops a pick the list no longer holds', () => {
    expect(reportTargets('user:system:jdoe', repositories, ['com.enonic.cms.gone'], {})).toEqual(
      [],
    );
  });
});

/**
 * Both failures, and neither reaches the DOM: the environment is `node`, so there is no document to
 * save into — which is what the second case leans on. What matters is that either way the section is
 * handed a value it can show, rather than a rejected promise or a file holding an error.
 */
describe('downloadPermissionReport', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fails as a value when the browser cannot save the file', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(new Response('Path, Read\n/,X'));

    const result = await downloadPermissionReport(BASE_URL, TARGET);

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr().message).toBe('The report could not be saved');
  });

  it('fails with the message the endpoint refused with', async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValue(new Response('{"message":"not yours"}', { status: 403 }));

    const result = await downloadPermissionReport(BASE_URL, TARGET);

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr().message).toBe('not yours');
  });
});
