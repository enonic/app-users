import { errAsync, okAsync, ResultAsync } from 'neverthrow';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AppError } from '../../../shared/api';
import { isGroupNameTaken } from './group-commands';
import { checkPrincipalName, forgetPrincipalNameChecks } from './principal-name-check.load';
import { $principalNameCheck } from './principal-name-check.store';
import { isUserNameTaken } from './user-commands';

// Only the questions are stubbed: `isIllegalPrincipalName` decides which names are worth asking about,
// and that decision is part of what these tests exercise.
vi.mock('./user-commands', () => ({ isUserNameTaken: vi.fn() }));
vi.mock('./group-commands', () => ({ isGroupNameTaken: vi.fn() }));

const asked = vi.mocked(isUserNameTaken);
const askedForGroup = vi.mocked(isGroupNameTaken);

const DEBOUNCE_MS = 400;

beforeEach(() => {
  vi.useFakeTimers();
  asked.mockReset();
  asked.mockReturnValue(okAsync(false));
  askedForGroup.mockReset();
  askedForGroup.mockReturnValue(okAsync(false));
});

afterEach(() => {
  forgetPrincipalNameChecks();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('checkPrincipalName', () => {
  it('holds the wizard back from the first keystroke, before any request goes out', () => {
    checkPrincipalName('user', 'system', 'ali');

    expect($principalNameCheck.get()).toEqual({ status: 'pending', key: 'user:system:ali' });
    expect(asked).not.toHaveBeenCalled();
  });

  it('asks once for a name typed in one go', async () => {
    checkPrincipalName('user', 'system', 'a');
    checkPrincipalName('user', 'system', 'al');
    checkPrincipalName('user', 'system', 'ali');

    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);

    expect(asked).toHaveBeenCalledTimes(1);
    expect(asked.mock.calls[0]?.slice(0, 2)).toEqual(['system', 'ali']);
    expect($principalNameCheck.get().status).toBe('available');
  });

  it('reports a name the provider already holds', async () => {
    asked.mockReturnValue(okAsync(true));

    checkPrincipalName('user', 'system', 'alice', { immediate: true });
    await vi.runAllTimersAsync();

    expect($principalNameCheck.get()).toEqual({ status: 'taken', key: 'user:system:alice' });
  });

  // The type picks the question and is part of the key, so a user and a group of one name are two answers.
  it('asks the group question for a group, under a group key', async () => {
    askedForGroup.mockReturnValue(okAsync(true));

    checkPrincipalName('group', 'store', 'managers', { immediate: true });
    await vi.runAllTimersAsync();

    expect(askedForGroup.mock.calls[0]?.slice(0, 2)).toEqual(['store', 'managers']);
    expect(asked).not.toHaveBeenCalled();
    expect($principalNameCheck.get()).toEqual({ status: 'taken', key: 'group:store:managers' });
  });

  it('answers a name it has already asked about without asking again', async () => {
    checkPrincipalName('user', 'system', 'alice', { immediate: true });
    await vi.runAllTimersAsync();

    checkPrincipalName('user', 'system', 'alice');

    expect(asked).toHaveBeenCalledTimes(1);
    expect($principalNameCheck.get().status).toBe('available');
  });

  it('asks the new provider about a name it already answered for another', async () => {
    checkPrincipalName('user', 'system', 'alice', { immediate: true });
    await vi.runAllTimersAsync();

    checkPrincipalName('user', 'ldap', 'alice', { immediate: true });
    await vi.runAllTimersAsync();

    expect(asked).toHaveBeenCalledTimes(2);
    expect($principalNameCheck.get().key).toBe('user:ldap:alice');
  });

  it('leaves what the form itself rejects alone', () => {
    checkPrincipalName('user', '', 'alice');
    expect($principalNameCheck.get()).toEqual({ status: 'idle' });

    checkPrincipalName('user', 'system', '   ');
    expect($principalNameCheck.get()).toEqual({ status: 'idle' });

    checkPrincipalName('user', 'system', 'ali ce');
    expect($principalNameCheck.get()).toEqual({ status: 'idle' });

    expect(asked).not.toHaveBeenCalled();
  });

  it('blocks nothing when the check itself fails', async () => {
    asked.mockReturnValue(errAsync(new AppError('offline')));

    checkPrincipalName('user', 'system', 'alice', { immediate: true });
    await vi.runAllTimersAsync();

    expect($principalNameCheck.get().status).toBe('error');
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

    checkPrincipalName('user', 'system', 'alice', { immediate: true });
    checkPrincipalName('user', 'system', 'alicia', { immediate: true });

    settle?.(true);
    await vi.runAllTimersAsync();

    expect($principalNameCheck.get()).toEqual({ status: 'available', key: 'user:system:alicia' });
  });

  it('forgets the answers when the dialog goes', async () => {
    checkPrincipalName('user', 'system', 'alice', { immediate: true });
    await vi.runAllTimersAsync();

    forgetPrincipalNameChecks();
    expect($principalNameCheck.get()).toEqual({ status: 'idle' });

    checkPrincipalName('user', 'system', 'alice', { immediate: true });
    await vi.runAllTimersAsync();

    expect(asked).toHaveBeenCalledTimes(2);
  });
});
