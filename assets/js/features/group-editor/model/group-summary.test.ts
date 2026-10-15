import { describe, expect, it } from 'vitest';

import type { GroupForm } from './group-form';
import { groupSummaryRows } from './group-summary';

const FORM: GroupForm = {
  idProvider: 'store',
  name: 'managers',
  displayName: 'Managers',
  description: 'Runs the shops',
  members: [{ key: 'user:store:alice', displayName: 'Alice', type: 'user' }],
  roles: [],
};

describe('groupSummaryRows', () => {
  it('reads the answers back in the order they were asked', () => {
    expect(groupSummaryRows(FORM, 'Store').map(({ labelKey }) => labelKey)).toEqual([
      'groups.dialog.idProvider',
      'groups.dialog.section',
      'groups.dialog.description',
    ]);
  });

  it('shows the provider by its display name, and the group by both of its names', () => {
    const [provider, group] = groupSummaryRows(FORM, 'Store');

    expect(provider?.value).toBe('Store');
    expect(group?.value).toBe('Managers (managers)');
  });

  it('drops the description when nothing was typed', () => {
    const rows = groupSummaryRows({ ...FORM, description: '  ' }, 'Store');

    expect(rows.some(({ labelKey }) => labelKey === 'groups.dialog.description')).toBe(false);
  });

  // They are principals, not text: the step renders them as labels itself.
  it('leaves the members and the roles to the step', () => {
    expect(JSON.stringify(groupSummaryRows(FORM, 'Store'))).not.toContain('Alice');
  });
});
