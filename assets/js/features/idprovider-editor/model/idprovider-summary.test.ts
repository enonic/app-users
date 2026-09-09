import { describe, expect, it } from 'vitest';

import type { IdProviderForm } from './idprovider-form';
import { idProviderSummaryRows } from './idprovider-summary';

const FORM: IdProviderForm = {
  name: 'ldap',
  displayName: 'Company directory',
  description: 'Everyone on staff',
  application: 'com.example.ldap',
  permissions: [
    {
      principal: { key: 'role:system.admin', displayName: 'Administrator', type: 'role' },
      access: 'ADMINISTRATOR',
    },
  ],
};

describe('idProviderSummaryRows', () => {
  it('reads the answers back in the order they were asked', () => {
    expect(idProviderSummaryRows(FORM, 'LDAP login').map(({ labelKey }) => labelKey)).toEqual([
      'idProviders.dialog.section',
      'idProviders.dialog.description',
      'idProviders.dialog.application',
    ]);
  });

  it('shows the provider by both of its names, and the application as it was handed over', () => {
    const [provider, , application] = idProviderSummaryRows(FORM, 'LDAP login');

    expect(provider?.value).toBe('Company directory (ldap)');
    expect(application?.value).toBe('LDAP login');
  });

  it('drops the description when nothing was typed', () => {
    const rows = idProviderSummaryRows({ ...FORM, description: '  ' }, 'LDAP login');

    expect(rows.some(({ labelKey }) => labelKey === 'idProviders.dialog.description')).toBe(false);
  });

  // A provider bound to nothing serves no login: that is an answer, not an omission.
  it('keeps the application row for a provider bound to nothing', () => {
    const rows = idProviderSummaryRows({ ...FORM, application: '' }, 'Bound to no application');

    expect(rows.at(-1)?.value).toBe('Bound to no application');
  });

  // They are principals with a level each, not text: the step renders them as labels itself.
  it('leaves the permissions to the step', () => {
    expect(JSON.stringify(idProviderSummaryRows(FORM, 'LDAP login'))).not.toContain(
      'Administrator',
    );
  });
});
