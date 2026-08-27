import { describe, expect, it } from 'vitest';

import type { Group } from '../../../entities/principal';
import type { ActionContext, SectionAction } from '../../../widgets/browse-toolbar/actions';
import { GROUP_ACTIONS } from './groups.actions';

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
  const found = GROUP_ACTIONS.find((candidate) => candidate.id === id);
  if (!found) {
    throw new Error(`No group action with id ${id}`);
  }
  return found;
}

describe('group actions', () => {
  it('offers new, edit and delete in that order', () => {
    expect(GROUP_ACTIONS.map(({ id }) => id)).toEqual(['new', 'edit', 'delete']);
  });
});

describe('new group', () => {
  it('needs no target', () => {
    expect(action('new').enabled(context())).toBe(true);
  });
});

describe('edit group', () => {
  it('needs exactly one target', () => {
    expect(action('edit').enabled(context())).toBe(false);
    expect(action('edit').enabled(context({ selected: [editors] }))).toBe(true);
    expect(action('edit').enabled(context({ selected: [editors, support] }))).toBe(false);
  });

  it('falls back to the active row when nothing is ticked', () => {
    expect(action('edit').enabled(context({ active: editors }))).toBe(true);
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
