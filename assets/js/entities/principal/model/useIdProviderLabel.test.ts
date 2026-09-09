import { describe, expect, it } from 'vitest';

import { idProviderLabel } from './useIdProviderLabel';

describe('idProviderLabel', () => {
  it('puts the display name over the name the list is ordered by', () => {
    expect(idProviderLabel('azure', 'Azure AD')).toEqual({
      primary: 'Azure AD',
      secondary: 'azure',
    });
  });

  it('shows the name alone while the providers are still unknown', () => {
    expect(idProviderLabel('azure', undefined)).toEqual({ primary: 'azure' });
  });

  it('keeps the name where the derivation changed more than the case', () => {
    expect(idProviderLabel('azure.ad', 'Azure AD')).toEqual({
      primary: 'Azure AD',
      secondary: 'azure.ad',
    });
  });

  it('drops a name that differs in case alone, keeping the display name as written', () => {
    expect(idProviderLabel('system', 'System')).toEqual({ primary: 'System' });
    expect(idProviderLabel('ldap', 'LDAP')).toEqual({ primary: 'LDAP' });
  });

  it('does not repeat a display name that is the name', () => {
    expect(idProviderLabel('system', 'system')).toEqual({ primary: 'system' });
  });
});
