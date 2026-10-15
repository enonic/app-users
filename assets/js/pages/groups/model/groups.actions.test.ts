import { describe, expect, it } from 'vitest';

import type { Group } from '../../../entities/principal';
import type { ActionContext, SectionAction } from '../../../widgets/browse-toolbar/actions';
import { createGroupActions } from './groups.actions';

function group(key: string): Group {
  return {
    type: 'group',
    key: `group:system:${key}`,
    displayName: key,
    modifiedTime: '2026-07-14T14:41:00Z',
  };
}

const editors = group('editors');
const support = group('support');

function context(overrides: Partial<ActionContext<Group>> = {}): ActionContext<Group> {
  return { selected: [], active: undefined, ...overrides };
}

function action(id: string): SectionAction<Group> {
  const found = createGroupActions(true).find((candidate) => candidate.id === id);
  if (!found) {
    throw new Error(`No group action with id ${id}`);
  }
  return found;
}

describe('group actions', () => {
  it('offers new and delete in that order', () => {
    expect(createGroupActions(true).map(({ id }) => id)).toEqual(['new', 'delete']);
  });
});

describe('new group', () => {
  it('needs no target', () => {
    expect(action('new').enabled(context())).toBe(true);
  });

  it('is off when no provider takes a new group', () => {
    const create = createGroupActions(false).find(({ id }) => id === 'new');

    expect(create?.enabled(context())).toBe(false);
  });
});

describe('delete group', () => {
  it('needs a target', () => {
    expect(action('delete').enabled(context())).toBe(false);
  });

  it('takes the ticked rows, or the active one', () => {
    expect(action('delete').enabled(context({ selected: [editors, support] }))).toBe(true);
    expect(action('delete').enabled(context({ active: support }))).toBe(true);
  });
});
