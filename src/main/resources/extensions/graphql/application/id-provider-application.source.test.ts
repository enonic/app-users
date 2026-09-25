import { encodeApplicationIcon } from '/lib/icon';
import { getIdProviderDescriptor } from '/lib/idprovider';
import { getDescriptor, list, type Application, type ApplicationDescriptor } from '/lib/xp/app';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { listIdProviderApplications } from './id-provider-application.source';

function application(key: string): Application {
  return {
    key,
    version: '1.0.0',
    systemVersion: null,
    minSystemVersion: null,
    maxSystemVersion: null,
    modifiedTime: null,
    started: true,
    system: false,
  };
}

function descriptor(key: string, icon?: ApplicationDescriptor['icon']): ApplicationDescriptor {
  return {
    key,
    description: '',
    descriptionI18nKey: null,
    title: 'OIDC login',
    titleI18nKey: null,
    vendorName: null,
    vendorUrl: null,
    url: null,
    icon,
  };
}

afterEach(() => {
  vi.resetAllMocks();
});

describe('listIdProviderApplications', () => {
  it('carries the descriptor icon as a data uri of its own mime type', () => {
    vi.mocked(list).mockReturnValue([application('com.enonic.app.oidc')]);
    vi.mocked(getIdProviderDescriptor).mockReturnValue({ hasConfig: true });
    vi.mocked(getDescriptor).mockReturnValue(
      descriptor('com.enonic.app.oidc', {
        data: {} as never,
        mimeType: 'image/svg+xml',
        modifiedTime: '2026-09-25T10:00:00Z',
      }),
    );
    vi.mocked(encodeApplicationIcon).mockReturnValue('PHN2Zy8+');

    expect(listIdProviderApplications()).toEqual([
      {
        key: 'com.enonic.app.oidc',
        displayName: 'OIDC login',
        hasConfig: true,
        icon: 'data:image/svg+xml;base64,PHN2Zy8+',
      },
    ]);
    expect(vi.mocked(encodeApplicationIcon)).toHaveBeenCalledWith({
      application: 'com.enonic.app.oidc',
    });
  });

  it('reads no icon, and encodes nothing, for an application that ships none', () => {
    vi.mocked(list).mockReturnValue([application('com.enonic.app.oidc')]);
    vi.mocked(getIdProviderDescriptor).mockReturnValue({ hasConfig: false });
    vi.mocked(getDescriptor).mockReturnValue(descriptor('com.enonic.app.oidc'));

    expect(listIdProviderApplications()[0]?.icon).toBeUndefined();
    expect(vi.mocked(encodeApplicationIcon)).not.toHaveBeenCalled();
  });

  it('reads no icon when the bytes cannot be read', () => {
    vi.mocked(list).mockReturnValue([application('com.enonic.app.oidc')]);
    vi.mocked(getIdProviderDescriptor).mockReturnValue({ hasConfig: false });
    vi.mocked(getDescriptor).mockReturnValue(
      descriptor('com.enonic.app.oidc', {
        data: {} as never,
        mimeType: 'image/png',
        modifiedTime: '2026-09-25T10:00:00Z',
      }),
    );
    vi.mocked(encodeApplicationIcon).mockReturnValue(null);

    expect(listIdProviderApplications()[0]?.icon).toBeUndefined();
  });
});
