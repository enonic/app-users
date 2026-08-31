import { apiUrl } from '/lib/xp/portal';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { configQueryFields } from './config.fields';

beforeEach(() => {
  vi.stubGlobal('app', { name: 'com.enonic.xp.app.users', version: '8.1.0' });
  vi.mocked(apiUrl).mockImplementation(({ api }) => `/_/${api}`);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetAllMocks();
});

describe('config', () => {
  it("answers this application's own key and version, not the shell's", () => {
    expect(configQueryFields.config.resolve?.({} as never)).toMatchObject({
      appId: 'com.enonic.xp.app.users',
      appVersion: '8.1.0',
    });
  });

  it('hands the section the events hub url of the request it came in on', () => {
    expect(configQueryFields.config.resolve?.({} as never)).toMatchObject({
      eventsUrl: '/_/admin:events',
    });
    expect(vi.mocked(apiUrl)).toHaveBeenCalledWith({ api: 'admin:events' });
  });
});
