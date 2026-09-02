import { getMemberships, hasRole } from '/lib/xp/auth';
import { get as getRepository } from '/lib/xp/repo';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { get, hits, query } from '../../../../../test/mocks/lib-xp-node';
import { handleReportRequest } from './report-request';

const PARAMS = {
  principalKey: 'user:system:jdoe',
  repositoryId: 'com.enonic.cms.default',
  branch: 'master',
};

function ask(params: Record<string, string | string[] | undefined> = PARAMS) {
  return handleReportRequest({ params });
}

beforeEach(() => {
  vi.mocked(hasRole).mockReturnValue(true);
  vi.mocked(getRepository).mockReturnValue({
    id: 'com.enonic.cms.default',
    branches: ['master', 'draft'],
    transient: false,
  });
  vi.mocked(getMemberships).mockReturnValue([]);
  vi.mocked(query).mockReturnValue(hits([]));
  vi.mocked(get).mockReturnValue([]);
});

afterEach(() => {
  vi.resetAllMocks();
});

describe('handleReportRequest', () => {
  it('answers the report as a csv attachment', () => {
    const response = ask();

    expect(response.status).toBe(200);
    expect(response.contentType).toBe('text/csv; charset=utf-8');
    expect(response.headers).toEqual({
      'Content-Disposition':
        'attachment; filename="perm-report-com.enonic.cms.default(master).csv"',
    });
    // The tree is empty here, so the whole file is its header — the generator has its own tests.
    expect(response.body).toBe(
      'Path, Read, Create, Modify, Delete, Publish, ReadPerm., WritePerm.',
    );
  });

  it('refuses anyone but a system administrator', () => {
    vi.mocked(hasRole).mockReturnValue(false);

    expect(ask().status).toBe(403);
    expect(vi.mocked(hasRole)).toHaveBeenCalledWith('role:system.admin');
  });

  it('reads nothing at all once it has refused', () => {
    vi.mocked(hasRole).mockReturnValue(false);

    ask();

    expect(vi.mocked(getRepository)).not.toHaveBeenCalled();
    expect(vi.mocked(query)).not.toHaveBeenCalled();
  });

  it('needs all three parameters', () => {
    expect(ask({ ...PARAMS, branch: undefined }).status).toBe(400);
    expect(ask({ ...PARAMS, repositoryId: '' }).status).toBe(400);
  });

  it('takes the first of a repeated parameter', () => {
    expect(ask({ ...PARAMS, branch: ['master', 'draft'] }).status).toBe(200);
  });

  it('refuses a key that names no principal it can report on', () => {
    expect(ask({ ...PARAMS, principalKey: 'system' }).status).toBe(400);
    expect(ask({ ...PARAMS, principalKey: 'user:system' }).status).toBe(400);
  });

  it('accepts a role key, which carries no id provider', () => {
    expect(ask({ ...PARAMS, principalKey: 'role:system.admin' }).status).toBe(200);
  });

  it('answers 404 for a repository that does not exist', () => {
    vi.mocked(getRepository).mockReturnValue(null);

    const response = ask();

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: 'No repository answers to [com.enonic.cms.default]',
    });
  });

  it('answers 404 for a branch the repository does not have', () => {
    expect(ask({ ...PARAMS, branch: 'nope' }).status).toBe(404);
  });

  it('answers a failed read as a message rather than as a file', () => {
    vi.mocked(getMemberships).mockImplementation(() => {
      throw new Error('Principal [user:system:jdoe] not found');
    });

    const response = ask();

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ message: 'Principal [user:system:jdoe] not found' });
  });

  it('keeps a header injection out of the file name', () => {
    vi.mocked(getRepository).mockReturnValue({
      id: 'evil"\r\nX-Injected: 1',
      branches: ['master'],
      transient: false,
    });

    const response = ask({ ...PARAMS, repositoryId: 'evil"\r\nX-Injected: 1' });

    expect(response.headers).toEqual({
      'Content-Disposition': 'attachment; filename="perm-report-evilX-Injected1(master).csv"',
    });
  });
});
