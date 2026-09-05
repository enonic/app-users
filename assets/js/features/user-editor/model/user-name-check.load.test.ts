import { errAsync, okAsync, ResultAsync } from 'neverthrow';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { isUserNameTaken } from '../../../entities/principal';
import { AppError } from '../../../shared/api';
import { checkUserName, forgetUserNameChecks } from './user-name-check.load';
import { $userNameCheck } from './user-name-check.store';

// Only the question is stubbed: `isIllegalPrincipalName` decides which names are worth asking about, and
// that decision is part of what these tests exercise.
vi.mock('../../../entities/principal', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../entities/principal')>()),
  isUserNameTaken: vi.fn(),
}));

const asked = vi.mocked(isUserNameTaken);

const DEBOUNCE_MS = 400;

beforeEach(() => {
  vi.useFakeTimers();
  asked.mockReset();
  asked.mockReturnValue(okAsync(false));
});

afterEach(() => {
  forgetUserNameChecks();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('checkUserName', () => {
  it('holds the wizard back from the first keystroke, before any request goes out', () => {
    checkUserName('system', 'ali');

    expect($userNameCheck.get()).toEqual({ status: 'pending', key: 'user:system:ali' });
    expect(asked).not.toHaveBeenCalled();
  });

  it('asks once for a name typed in one go', async () => {
    checkUserName('system', 'a');
    checkUserName('system', 'al');
    checkUserName('system', 'ali');

    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);

    expect(asked).toHaveBeenCalledTimes(1);
    expect(asked.mock.calls[0]?.slice(0, 2)).toEqual(['system', 'ali']);
    expect($userNameCheck.get().status).toBe('available');
  });

  it('reports a name the provider already holds', async () => {
    asked.mockReturnValue(okAsync(true));

    checkUserName('system', 'alice', { immediate: true });
    await vi.runAllTimersAsync();

    expect($userNameCheck.get()).toEqual({ status: 'taken', key: 'user:system:alice' });
  });

  it('answers a name it has already asked about without asking again', async () => {
    checkUserName('system', 'alice', { immediate: true });
    await vi.runAllTimersAsync();

    checkUserName('system', 'alice');

    expect(asked).toHaveBeenCalledTimes(1);
    expect($userNameCheck.get().status).toBe('available');
  });

  it('asks the new provider about a name it already answered for another', async () => {
    checkUserName('system', 'alice', { immediate: true });
    await vi.runAllTimersAsync();

    checkUserName('ldap', 'alice', { immediate: true });
    await vi.runAllTimersAsync();

    expect(asked).toHaveBeenCalledTimes(2);
    expect($userNameCheck.get().key).toBe('user:ldap:alice');
  });

  it('leaves what the form itself rejects alone', () => {
    checkUserName('', 'alice');
    expect($userNameCheck.get()).toEqual({ status: 'idle' });

    checkUserName('system', '   ');
    expect($userNameCheck.get()).toEqual({ status: 'idle' });

    checkUserName('system', 'ali ce');
    expect($userNameCheck.get()).toEqual({ status: 'idle' });

    expect(asked).not.toHaveBeenCalled();
  });

  it('blocks nothing when the check itself fails', async () => {
    asked.mockReturnValue(errAsync(new AppError('offline')));

    checkUserName('system', 'alice', { immediate: true });
    await vi.runAllTimersAsync();

    expect($userNameCheck.get().status).toBe('error');
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

    checkUserName('system', 'alice', { immediate: true });
    checkUserName('system', 'alicia', { immediate: true });

    settle?.(true);
    await vi.runAllTimersAsync();

    expect($userNameCheck.get()).toEqual({ status: 'available', key: 'user:system:alicia' });
  });

  it('forgets the answers when the dialog goes', async () => {
    checkUserName('system', 'alice', { immediate: true });
    await vi.runAllTimersAsync();

    forgetUserNameChecks();
    expect($userNameCheck.get()).toEqual({ status: 'idle' });

    checkUserName('system', 'alice', { immediate: true });
    await vi.runAllTimersAsync();

    expect(asked).toHaveBeenCalledTimes(2);
  });
});
