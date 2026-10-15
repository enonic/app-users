import { execute } from '/lib/graphql';
import { getMimeType, getResource } from '/lib/xp/io';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { setResources } from '../../../../test/mocks/lib-xp-io';
import { get, post } from './section-endpoint';

const CONTEXT =
  '/admin/com.enonic.xp.app.settings/main/_/admin:extension/com.enonic.xp.app.users:users';

function request(path: string) {
  return { rawPath: `${CONTEXT}${path}`, contextPath: CONTEXT };
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

  it('leaves the content type of anything else to lib-io', () => {
    setResources({ '/assets/_static/icon.svg': '<svg/>' });

    expect(get(request('/_static/icon.svg')).contentType).toBe(
      'application/octet-stream; charset=utf-8',
    );
    expect(vi.mocked(getMimeType)).toHaveBeenCalledWith('/assets/_static/icon.svg');
  });
});

type Headers = Record<string, string | undefined>;

const SAME_ORIGIN_JSON: Headers = {
  'sec-fetch-site': 'same-origin',
  'content-type': 'application/json',
};

function postRequest(
  path: string,
  headers: Headers = SAME_ORIGIN_JSON,
  body = '{"query":"{ a }"}',
) {
  return {
    ...request(path),
    body,
    getHeader: (name: string) => headers[name.toLowerCase()] ?? null,
  };
}

describe('post', () => {
  it('answers 404 for anything but the graphql path', () => {
    expect(post(postRequest('/_static/main.js')).status).toBe(404);
  });

  it('executes a same-origin json request', () => {
    vi.mocked(execute).mockReturnValue({ data: {} });

    expect(post(postRequest('/graphql')).status).toBe(200);
    expect(vi.mocked(execute)).toHaveBeenCalledOnce();
  });

  it('accepts media type parameters and any casing of the media type', () => {
    vi.mocked(execute).mockReturnValue({ data: {} });
    const headers = { ...SAME_ORIGIN_JSON, 'content-type': 'Application/JSON; charset=utf-8' };

    expect(post(postRequest('/graphql', headers)).status).toBe(200);
  });

  it('hands the graphql path to the schema, which rejects an empty body', () => {
    expect(post(postRequest('/graphql', SAME_ORIGIN_JSON, '')).status).toBe(400);
  });

  it.each([
    'cross-site',
    'same-site',
    'none',
    'Same-Origin',
    'same-origin, cross-site',
    '',
    undefined,
  ])('answers 403 without executing when Sec-Fetch-Site is %j', (site) => {
    const response = post(postRequest('/graphql', { ...SAME_ORIGIN_JSON, 'sec-fetch-site': site }));

    expect(response).toEqual({ status: 403 });
    expect(vi.mocked(execute)).not.toHaveBeenCalled();
  });

  it.each([
    'text/plain',
    'application/x-www-form-urlencoded',
    'multipart/form-data; boundary=x',
    'application/jsonp',
    'application/json-seq',
    '',
    undefined,
  ])('answers 415 without executing when Content-Type is %j', (contentType) => {
    const response = post(
      postRequest('/graphql', { ...SAME_ORIGIN_JSON, 'content-type': contentType }),
    );

    expect(response).toEqual({ status: 415 });
    expect(vi.mocked(execute)).not.toHaveBeenCalled();
  });

  it('checks the fetch site before the content type', () => {
    const headers = { 'sec-fetch-site': 'cross-site', 'content-type': 'text/plain' };

    expect(post(postRequest('/graphql', headers)).status).toBe(403);
  });
});
