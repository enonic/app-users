import { describe, expect, it } from 'vitest';

import type { RoleForm } from './role-form';
import { roleSummaryRows } from './role-summary';

const FORM: RoleForm = {
  name: 'store.manager',
  displayName: 'Store Manager',
  description: 'Runs the shop',
  members: [{ key: 'user:store:alice', displayName: 'Alice', type: 'user' }],
};

describe('roleSummaryRows', () => {
  it('reads the answers back in the order they were asked', () => {
    expect(roleSummaryRows(FORM).map(({ labelKey }) => labelKey)).toEqual([
      'roles.dialog.section',
      'roles.dialog.description',
    ]);
  });

  it('shows the role by both of its names', () => {
    const [role] = roleSummaryRows(FORM);

    expect(role?.value).toBe('Store Manager (store.manager)');
  });

  it('drops the description when nothing was typed', () => {
    const rows = roleSummaryRows({ ...FORM, description: '  ' });

    expect(rows.some(({ labelKey }) => labelKey === 'roles.dialog.description')).toBe(false);
  });

  // They are principals, not text: the step renders them as labels itself.
  it('leaves the members to the step', () => {
    expect(JSON.stringify(roleSummaryRows(FORM))).not.toContain('Alice');
  });
});
