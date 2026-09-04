import { hasRole } from '/lib/xp/auth';
import { getMimeType, getResource } from '/lib/xp/io';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { setResources } from '../../../../test/mocks/lib-xp-io';
import { get, post } from './section-endpoint';

const CONTEXT =
  '/admin/com.enonic.xp.app.settings/main/_/admin:extension/com.enonic.xp.app.users:users';

function request(path: string, params: Record<string, string> = {}) {
  return { rawPath: `${CONTEXT}${path}`, contextPath: CONTEXT, params };
}

beforeEach(() => {
  vi.clearAllMocks();
  setResources({
    '/assets/_static/main.js': 'export function mount() {}',
    '/assets/_static/main.css': ':host { color: red }',
  });
});

describe('get', () => {
  it('serves a bundled module as javascript', () => {
    const response = get(request('/_static/main.js'));

    expect(response.status).toBe(200);
    expect(response.contentType).toBe('text/javascript; charset=utf-8');
    expect(response.body).toBe('export function mount() {}');
  });

  it('serves the stylesheet as css', () => {
    expect(get(request('/_static/main.css')).contentType).toBe('text/css; charset=utf-8');
  });

  it('answers 404 for a static file the jar does not hold', () => {
    expect(get(request('/_static/absent.js')).status).toBe(404);
  });

  it('refuses to climb out of the asset root', () => {
    const response = get(request('/_static/../../application.yaml'));

    expect(response.status).toBe(404);
    expect(vi.mocked(getResource)).not.toHaveBeenCalled();
  });

  it('answers 404 below the prefix but outside the static base', () => {
    expect(get(request('/graphql')).status).toBe(404);
  });

  // The report's own gates are covered beside it; what this pins is that the path reaches them at all.
  it('routes the report path to the report handler', () => {
    vi.mocked(hasRole).mockReturnValue(false);

    expect(get(request('/report')).status).toBe(403);
  });

  it('leaves the content type of anything else to lib-io', () => {
    setResources({ '/assets/_static/icon.svg': '<svg/>' });

    expect(get(request('/_static/icon.svg')).contentType).toBe(
      'application/octet-stream; charset=utf-8',
    );
    expect(vi.mocked(getMimeType)).toHaveBeenCalledWith('/assets/_static/icon.svg');
  });
});

describe('post', () => {
  it('answers 404 for anything but the graphql path', () => {
    expect(post({ ...request('/_static/main.js'), body: '{}' }).status).toBe(404);
  });

  it('hands the graphql path to the schema, which rejects an empty body', () => {
    expect(post({ ...request('/graphql'), body: '' }).status).toBe(400);
  });
});
