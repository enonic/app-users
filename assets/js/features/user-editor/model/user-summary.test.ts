import { describe, expect, it } from 'vitest';

import type { UserForm } from './user-form';
import { userSummaryRows } from './user-summary';

const FORM: UserForm = {
  idProvider: 'ldap',
  name: 'jane',
  displayName: 'Jane Doe',
  email: 'jane@example.com',
  roles: [],
  groups: [],
  keyAdditions: [],
  keyRemovals: [],
};

const credentials = (form: Partial<UserForm>) =>
  userSummaryRows({ ...FORM, ...form }, 'Corporate LDAP').find(
    ({ labelKey }) => labelKey === 'users.dialog.credentials',
  )?.lines;

describe('userSummaryRows', () => {
  it('reads the answers back in the order the steps asked for them', () => {
    const rows = userSummaryRows({ ...FORM, password: 'sekret-42!' }, 'Corporate LDAP');

    expect(rows.map(({ labelKey }) => labelKey)).toEqual([
      'users.dialog.idProvider',
      'users.dialog.section',
      'users.dialog.email',
      'users.dialog.credentials',
    ]);
  });

  it('names the provider as the caller resolved it, not by key', () => {
    const [provider] = userSummaryRows(FORM, 'Corporate LDAP');

    expect(provider?.value).toBe('Corporate LDAP');
  });

  it('leaves the provider out for a service account: the system store is a given', () => {
    const rows = userSummaryRows({ ...FORM, idProvider: 'system' }, 'System');

    expect(rows.some(({ labelKey }) => labelKey === 'users.dialog.idProvider')).toBe(false);
    expect(rows[0]?.labelKey).toBe('users.dialog.section');
  });

  it('pairs the display name with the name', () => {
    const rows = userSummaryRows(FORM, 'Corporate LDAP');

    expect(rows[1]?.value).toBe('Jane Doe (jane)');
  });

  it('drops the email row while the email is blank', () => {
    const rows = userSummaryRows({ ...FORM, email: '  ' }, 'Corporate LDAP');

    expect(rows.some(({ labelKey }) => labelKey === 'users.dialog.email')).toBe(false);
  });

  it('drops the credentials row while the dialog set none: a password left alone is no answer', () => {
    const rows = userSummaryRows(FORM, 'Corporate LDAP');

    expect(rows.some(({ labelKey }) => labelKey === 'users.dialog.credentials')).toBe(false);
  });

  it('reports the password as set without echoing it', () => {
    const rows = userSummaryRows({ ...FORM, password: 'sekret-42!' }, 'Corporate LDAP');

    expect(credentials({ password: 'sekret-42!' })).toEqual([{ key: 'users.dialog.passwordSet' }]);
    expect(JSON.stringify(rows)).not.toContain('sekret-42!');
  });

  it('reports a password the edit will clear', () => {
    expect(credentials({ clearPassword: true })).toEqual([{ key: 'users.dialog.passwordCleared' }]);
  });

  it('reports the new password rather than the clearing it replaced', () => {
    expect(credentials({ password: 'sekret-42!', clearPassword: true })).toEqual([
      { key: 'users.dialog.passwordSet' },
    ]);
  });

  it('names one phrase per shape of the public key change', () => {
    const added = { id: 'a', publicKey: 'PEM' };

    expect(credentials({ keyAdditions: [added] })).toEqual([
      { key: 'users.dialog.keysAdded', args: [1] },
    ]);
    expect(credentials({ keyRemovals: ['kid-1'] })).toEqual([
      { key: 'users.dialog.keysRemoved', args: [1] },
    ]);
    expect(credentials({ keyAdditions: [added], keyRemovals: ['kid-1'] })).toEqual([
      { key: 'users.dialog.keysAddedRemoved', args: [1, 1] },
    ]);
  });

  it('gives the password and the keys a line each', () => {
    expect(credentials({ password: 'sekret-42!', keyRemovals: ['kid-1'] })).toEqual([
      { key: 'users.dialog.passwordSet' },
      { key: 'users.dialog.keysRemoved', args: [1] },
    ]);
  });
});
