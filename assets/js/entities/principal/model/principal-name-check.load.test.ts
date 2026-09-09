import { errAsync, okAsync, ResultAsync } from 'neverthrow';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AppError } from '../../../shared/api';
import { isGroupNameTaken } from './group-commands';
import { createPrincipalNameCheck, type PrincipalNameCheck } from './principal-name-check.load';
import { isRoleNameTaken } from './role-commands';
import { isUserNameTaken } from './user-commands';

// Only the questions are stubbed: `isIllegalPrincipalName` decides which names are worth asking about,
// and that decision is part of what these tests exercise.
vi.mock('./user-commands', () => ({ isUserNameTaken: vi.fn() }));
vi.mock('./group-commands', () => ({ isGroupNameTaken: vi.fn() }));
vi.mock('./role-commands', () => ({ isRoleNameTaken: vi.fn() }));

const asked = vi.mocked(isUserNameTaken);
const askedForGroup = vi.mocked(isGroupNameTaken);
const askedForRole = vi.mocked(isRoleNameTaken);

const DEBOUNCE_MS = 400;

let check: PrincipalNameCheck;

beforeEach(() => {
  vi.useFakeTimers();
  asked.mockReset();
  asked.mockReturnValue(okAsync(false));
  askedForGroup.mockReset();
  askedForGroup.mockReturnValue(okAsync(false));
  askedForRole.mockReset();
  askedForRole.mockReturnValue(okAsync(false));
  check = createPrincipalNameCheck('user');
});

afterEach(() => {
  check.forget();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('ask', () => {
  it('holds the wizard back from the first keystroke, before any request goes out', () => {
    check.ask('system', 'ali');

    expect(check.$state.get()).toEqual({ status: 'pending', key: 'user:system:ali' });
    expect(asked).not.toHaveBeenCalled();
  });

  it('asks once for a name typed in one go', async () => {
    check.ask('system', 'a');
    check.ask('system', 'al');
    check.ask('system', 'ali');

    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);

    expect(asked).toHaveBeenCalledTimes(1);
    expect(asked.mock.calls[0]?.slice(0, 2)).toEqual(['system', 'ali']);
    expect(check.$state.get().status).toBe('available');
  });

  it('reports a name the provider already holds', async () => {
    asked.mockReturnValue(okAsync(true));

    check.ask('system', 'alice', { immediate: true });
    await vi.runAllTimersAsync();

    expect(check.$state.get()).toEqual({ status: 'taken', key: 'user:system:alice' });
  });

  // The type picks the question and is part of the key, so a user and a group of one name are two answers.
  it('asks the group question for a group, under a group key', async () => {
    askedForGroup.mockReturnValue(okAsync(true));
    const groupCheck = createPrincipalNameCheck('group');

    groupCheck.ask('store', 'managers', { immediate: true });
    await vi.runAllTimersAsync();

    expect(askedForGroup.mock.calls[0]?.slice(0, 2)).toEqual(['store', 'managers']);
    expect(asked).not.toHaveBeenCalled();
    expect(groupCheck.$state.get()).toEqual({ status: 'taken', key: 'group:store:managers' });
  });

  // A role has no provider: the empty scope that leaves a user unasked is the role's normal case.
  it('asks the role question with no provider, under the role key', async () => {
    askedForRole.mockReturnValue(okAsync(true));
    const roleCheck = createPrincipalNameCheck('role');

    roleCheck.ask('', 'editors', { immediate: true });
    await vi.runAllTimersAsync();

    expect(askedForRole.mock.calls[0]?.[0]).toBe('editors');
    expect(asked).not.toHaveBeenCalled();
    expect(roleCheck.$state.get()).toEqual({ status: 'taken', key: 'role:editors' });
  });

  it('answers a name it has already asked about without asking again', async () => {
    check.ask('system', 'alice', { immediate: true });
    await vi.runAllTimersAsync();

    check.ask('system', 'alice');

    expect(asked).toHaveBeenCalledTimes(1);
    expect(check.$state.get().status).toBe('available');
  });

  it('asks the new provider about a name it already answered for another', async () => {
    check.ask('system', 'alice', { immediate: true });
    await vi.runAllTimersAsync();

    check.ask('ldap', 'alice', { immediate: true });
    await vi.runAllTimersAsync();

    expect(asked).toHaveBeenCalledTimes(2);
    expect(check.$state.get().key).toBe('user:ldap:alice');
  });

  it('leaves what the form itself rejects alone', () => {
    check.ask('', 'alice');
    expect(check.$state.get()).toEqual({ status: 'idle' });

    check.ask('system', '   ');
    expect(check.$state.get()).toEqual({ status: 'idle' });

    check.ask('system', 'ali ce');
    expect(check.$state.get()).toEqual({ status: 'idle' });

    expect(asked).not.toHaveBeenCalled();
  });

  it('blocks nothing when the check itself fails', async () => {
    asked.mockReturnValue(errAsync(new AppError('offline')));

    check.ask('system', 'alice', { immediate: true });
    await vi.runAllTimersAsync();

    expect(check.$state.get().status).toBe('error');
  });

  it('abandons an answer the user has typed past', async () => {
    let settle: ((taken: boolean) => void) | undefined;
    asked.mockReturnValueOnce(
      ResultAsync.fromSafePromise(
        new Promise<boolean>((resolve) => {
          settle = resolve;
        }),
      ),
    );

    check.ask('system', 'alice', { immediate: true });
    check.ask('system', 'alicia', { immediate: true });

    settle?.(true);
    await vi.runAllTimersAsync();

    expect(check.$state.get()).toEqual({ status: 'available', key: 'user:system:alicia' });
  });
});

describe('forget', () => {
  it('forgets the answers when the dialog goes', async () => {
    check.ask('system', 'alice', { immediate: true });
    await vi.runAllTimersAsync();

    check.forget();
    expect(check.$state.get()).toEqual({ status: 'idle' });

    check.ask('system', 'alice', { immediate: true });
    await vi.runAllTimersAsync();

    expect(asked).toHaveBeenCalledTimes(2);
  });
});

describe('two checks', () => {
  it('keeps each wizard from reading the other wizard verdict', async () => {
    asked.mockReturnValue(okAsync(true));
    const groupCheck = createPrincipalNameCheck('group');

    groupCheck.ask('store', 'managers', { immediate: true });
    check.ask('system', 'alice', { immediate: true });
    await vi.runAllTimersAsync();

    expect(check.$state.get()).toEqual({ status: 'taken', key: 'user:system:alice' });
    expect(groupCheck.$state.get()).toEqual({ status: 'available', key: 'group:store:managers' });
  });

  it('leaves the other wizard answer alone when one of them forgets', async () => {
    askedForGroup.mockReturnValue(okAsync(true));
    const groupCheck = createPrincipalNameCheck('group');

    groupCheck.ask('store', 'managers', { immediate: true });
    await vi.runAllTimersAsync();

    check.forget();

    expect(groupCheck.$state.get()).toEqual({ status: 'taken', key: 'group:store:managers' });
  });

  it('lets a request in flight land after the other wizard forgets', async () => {
    let settle: ((taken: boolean) => void) | undefined;
    askedForGroup.mockReturnValueOnce(
      ResultAsync.fromSafePromise(
        new Promise<boolean>((resolve) => {
          settle = resolve;
        }),
      ),
    );
    const groupCheck = createPrincipalNameCheck('group');

    groupCheck.ask('store', 'managers', { immediate: true });
    check.forget();

    settle?.(true);
    await vi.runAllTimersAsync();

    expect(groupCheck.$state.get()).toEqual({ status: 'taken', key: 'group:store:managers' });
  });
});
