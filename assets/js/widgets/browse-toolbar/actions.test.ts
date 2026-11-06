import { describe, expect, it } from 'vitest';

import { type ActionContext, actionTargets, rowActivationAction, shortcutAction } from './actions';
import type { ShortcutEvent } from './shortcuts';

const a = { id: 'a' };
const b = { id: 'b' };

function context(overrides: Partial<ActionContext<typeof a>> = {}): ActionContext<typeof a> {
  return { selected: [], active: undefined, ...overrides };
}

describe('actionTargets', () => {
  it('takes the ticked rows when there are any', () => {
    expect(actionTargets(context({ selected: [a, b], active: a }))).toEqual([a, b]);
  });

  it('falls back to the active row', () => {
    expect(actionTargets(context({ active: b }))).toEqual([b]);
  });

  it('has no target with nothing ticked and no active row', () => {
    expect(actionTargets(context())).toEqual([]);
  });
});

describe('rowActivationAction', () => {
  const edit = {
    id: 'edit',
    labelKey: 'edit',
    enabled: (ctx: ActionContext<typeof a>) => actionTargets(ctx).length === 1,
    run: () => undefined,
    activatedByRow: true,
  };

  const remove = {
    id: 'delete',
    labelKey: 'delete',
    enabled: () => true,
    run: () => undefined,
  };

  it('answers the action the section marked, when it is allowed', () => {
    expect(rowActivationAction([remove, edit], context({ active: a }))?.id).toBe('edit');
  });

  // ! A double click is a shortcut to an action the user already has, never a way past its rules.
  it('answers nothing while that action is disabled', () => {
    expect(
      rowActivationAction([remove, edit], context({ selected: [a, b], active: b })),
    ).toBeUndefined();
  });

  it('answers nothing where the section marked no action at all', () => {
    expect(rowActivationAction([remove], context({ active: a }))).toBeUndefined();
  });
});

describe('shortcutAction', () => {
  const create = {
    id: 'new',
    labelKey: 'new',
    enabled: () => true,
    run: () => undefined,
    shortcut: { code: 'KeyN', alt: true },
  };

  const remove = {
    id: 'delete',
    labelKey: 'delete',
    enabled: (ctx: ActionContext<typeof a>) => actionTargets(ctx).length > 0,
    run: () => undefined,
    shortcut: { code: 'Delete', mod: true },
  };

  const actions = [create, remove];

  function key(overrides: Partial<ShortcutEvent>): ShortcutEvent {
    return {
      code: '',
      altKey: false,
      ctrlKey: false,
      metaKey: false,
      shiftKey: false,
      ...overrides,
    };
  }

  it('answers the action bound to the chord, when it is allowed', () => {
    expect(
      shortcutAction(actions, context({ active: a }), key({ code: 'Delete', ctrlKey: true }), false)
        ?.id,
    ).toBe('delete');
  });

  it('answers nothing while the bound action is disabled', () => {
    expect(
      shortcutAction(actions, context(), key({ code: 'Delete', ctrlKey: true }), false),
    ).toBeUndefined();
  });

  it('answers nothing for a chord no action is bound to', () => {
    expect(
      shortcutAction([remove], context({ active: a }), key({ code: 'KeyN', altKey: true }), false),
    ).toBeUndefined();
  });
});
