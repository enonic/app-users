import { describe, expect, it } from 'vitest';

import { idProviderDraftFrom } from './idprovider-draft';
import type { IdProviderForm } from './idprovider-form';

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

describe('idProviderDraftFrom', () => {
  it('carries every field through untouched, permissions as the whole list', () => {
    expect(idProviderDraftFrom(FORM)).toEqual(FORM);
  });

  it('writes the configuration it is handed in place of the one the dialog applied', () => {
    const applied = [{ name: 'clientId', type: 'String' as const, values: [{ v: 'applied' }] }];
    const effective = [{ name: 'clientId', type: 'String' as const, values: [{ v: 'effective' }] }];

    expect(idProviderDraftFrom({ ...FORM, config: applied }, effective).config).toBe(effective);
  });

  it('drops the wizard-only field', () => {
    expect('nameEdited' in idProviderDraftFrom({ ...FORM, nameEdited: true })).toBe(false);
  });
});
