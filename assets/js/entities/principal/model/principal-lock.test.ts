import { describe, expect, it } from 'vitest';

import { principalLock, principalLockPending } from './principal-lock';

describe('principalLock', () => {
  it('leaves a principal of a provider that allows the write open', () => {
    expect(principalLock('LOCAL', 'ready', 'user')).toEqual({ locked: false });
    expect(principalLock('MIXED', 'ready', 'group')).toEqual({ locked: false });
  });

  it('locks a principal a remote system owns, and says so', () => {
    expect(principalLock('EXTERNAL', 'ready', 'user')).toEqual({
      locked: true,
      reasonKey: 'principal.details.lockedExternal',
    });
    expect(principalLock('MIXED', 'ready', 'user')).toEqual({
      locked: true,
      reasonKey: 'principal.details.lockedExternal',
    });
  });

  it('names the missing application when the provider is UNAVAILABLE', () => {
    expect(principalLock('UNAVAILABLE', 'ready', 'group')).toEqual({
      locked: true,
      reasonKey: 'principal.details.lockedUnavailable',
    });
  });

  it('locks without a reason while the providers are still on their way', () => {
    expect(principalLock(undefined, 'loading', 'user')).toEqual({ locked: true });
  });

  it('says the providers could not be loaded when that is why the mode is unknown', () => {
    expect(principalLock(undefined, 'error', 'user')).toEqual({
      locked: true,
      reasonKey: 'principal.details.lockedProvidersFailed',
    });
  });

  it('locks a provider the loaded list does not carry, without a reason to give', () => {
    expect(principalLock(undefined, 'ready', 'user')).toEqual({ locked: true });
  });
});

describe('principalLockPending', () => {
  it('is pending only on a first load with nothing to show', () => {
    expect(principalLockPending({ status: 'loading', items: [] })).toBe(true);
    expect(
      principalLockPending({
        status: 'loading',
        items: [{ key: 'system', displayName: 'System', mode: 'LOCAL' }],
      }),
    ).toBe(false);
    expect(principalLockPending({ status: 'ready', items: [] })).toBe(false);
    expect(principalLockPending({ status: 'error', items: [] })).toBe(false);
  });
});
