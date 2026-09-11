import { describe, expect, it } from 'vitest';

import { type ActionContext, actionTargets } from './actions';

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
