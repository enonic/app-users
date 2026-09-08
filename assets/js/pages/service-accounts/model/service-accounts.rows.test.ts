import { describe, expect, it } from 'vitest';

import type { User } from '../../../entities/principal';
import { toServiceAccountRow } from './service-accounts.rows';

const account: User = {
  type: 'user',
  key: 'user:system:reporting',
  displayName: 'Reporting service',
  login: 'reporting',
  idProvider: 'system',
  hasPassword: false,
};

describe('toServiceAccountRow', () => {
  it('keys the row by the user key so the route param matches', () => {
    expect(toServiceAccountRow(account).key).toBe('user:system:reporting');
  });

  it('shows the display name over the user name', () => {
    const { title, subtitle } = toServiceAccountRow(account);

    expect(title).toBe('Reporting service');
    expect(subtitle).toBe('reporting');
  });

  it('carries no provider cell — every row is the system store', () => {
    expect(toServiceAccountRow(account).meta).toBeUndefined();
  });

  it('carries the icon the page hands it', () => {
    expect(toServiceAccountRow(account, 'icon').icon).toBe('icon');
  });
});
