import { describe, expect, it } from 'vitest';

import type { UserForm } from './user-form';
import { userSummaryRows } from './user-summary';

const FORM: UserForm = {
  idProvider: 'system',
  name: 'jane',
  displayName: 'Jane Doe',
  email: 'jane@example.com',
  roles: [],
  groups: [],
  keyAdditions: [],
  keyRemovals: [],
};

describe('userSummaryRows', () => {
  it('reads the answers back in the order the steps asked for them', () => {
    const rows = userSummaryRows({ ...FORM, password: 'sekret-42!' }, 'System');

    expect(rows.map(({ labelKey }) => labelKey)).toEqual([
      'users.dialog.idProvider',
      'users.dialog.section',
      'users.dialog.email',
      'users.dialog.password',
    ]);
  });

  it('names the provider as the caller resolved it, not by key', () => {
    const [provider] = userSummaryRows(FORM, 'System');

    expect(provider?.value).toBe('System');
  });

  it('pairs the display name with the name', () => {
    const rows = userSummaryRows(FORM, 'System');

    expect(rows[1]?.value).toBe('Jane Doe (jane)');
  });

  it('drops the email row while the email is blank', () => {
    const rows = userSummaryRows({ ...FORM, email: '  ' }, 'System');

    expect(rows.some(({ labelKey }) => labelKey === 'users.dialog.email')).toBe(false);
  });

  it('drops the password row until one is set', () => {
    const rows = userSummaryRows(FORM, 'System');

    expect(rows.some(({ labelKey }) => labelKey === 'users.dialog.password')).toBe(false);
  });

  it('reports a password the edit will clear', () => {
    const rows = userSummaryRows({ ...FORM, clearPassword: true }, 'System');

    expect(rows.find(({ labelKey }) => labelKey === 'users.dialog.password')?.valueKey).toBe(
      'users.dialog.passwordCleared',
    );
  });

  it('reports the new password rather than the clearing it replaced', () => {
    const rows = userSummaryRows(
      { ...FORM, password: 'sekret-42!', clearPassword: true },
      'System',
    );

    expect(rows.find(({ labelKey }) => labelKey === 'users.dialog.password')?.valueKey).toBe(
      'users.dialog.passwordSet',
    );
  });

  it('reports the password as set without echoing it', () => {
    const rows = userSummaryRows({ ...FORM, password: 'sekret-42!' }, 'System');

    expect(rows.every(({ value }) => value?.includes('sekret-42!') !== true)).toBe(true);
  });

  it('names one phrase per shape of the public key change', () => {
    const added = { id: 'a', publicKey: 'PEM' };
    const keys = (form: Partial<UserForm>) =>
      userSummaryRows({ ...FORM, ...form }, 'System').find(
        ({ labelKey }) => labelKey === 'users.dialog.publicKeys',
      );

    expect(keys({ keyAdditions: [added] })).toMatchObject({
      valueKey: 'users.dialog.keysAdded',
      valueArgs: [1],
    });
    expect(keys({ keyRemovals: ['kid-1'] })).toMatchObject({
      valueKey: 'users.dialog.keysRemoved',
      valueArgs: [1],
    });
    expect(keys({ keyAdditions: [added], keyRemovals: ['kid-1'] })).toMatchObject({
      valueKey: 'users.dialog.keysAddedRemoved',
      valueArgs: [1, 1],
    });
    expect(keys({})).toBeUndefined();
  });
});
