import { hasRole } from '/lib/xp/auth';
import { list, type Repository } from '/lib/xp/repo';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { listContentRepositories } from './repository.source';

function repository(id: string, branches: string[] = ['master']): Repository {
  return { id, branches, transient: false };
}

beforeEach(() => {
  vi.mocked(hasRole).mockReturnValue(true);
});

afterEach(() => {
  vi.resetAllMocks();
});

describe('listContentRepositories', () => {
  it('offers the content repositories, sorted by id', () => {
    vi.mocked(list).mockReturnValue([
      repository('com.enonic.cms.intranet'),
      repository('com.enonic.cms.default'),
    ]);

    expect(listContentRepositories()?.map(({ id }) => id)).toEqual([
      'com.enonic.cms.default',
      'com.enonic.cms.intranet',
    ]);
  });

  it('leaves out the repositories that hold no content tree', () => {
    vi.mocked(list).mockReturnValue([
      repository('system-repo'),
      repository('com.enonic.cms.default'),
    ]);

    expect(listContentRepositories()).toEqual([
      { id: 'com.enonic.cms.default', branches: ['master'] },
    ]);
  });

  it('puts master first, whatever order the platform lists the branches in', () => {
    vi.mocked(list).mockReturnValue([
      repository('com.enonic.cms.default', ['archive', 'draft', 'master']),
    ]);

    expect(listContentRepositories()?.[0]?.branches).toEqual(['master', 'archive', 'draft']);
  });

  it('answers null to anyone but a system administrator, without asking the platform', () => {
    vi.mocked(hasRole).mockReturnValue(false);

    expect(listContentRepositories()).toBeNull();
    expect(vi.mocked(list)).not.toHaveBeenCalled();
  });
});
