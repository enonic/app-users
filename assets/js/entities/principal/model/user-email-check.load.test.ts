import { okAsync } from 'neverthrow';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { isUserEmailTaken } from './user-commands';
import { createUserEmailCheck, type UserEmailCheck } from './user-email-check.load';

// Only the question is stubbed: which addresses are worth asking about is part of what is exercised.
// The debounce, the cancelling and the remembering are the core's, covered with the name check.
vi.mock('./user-commands', () => ({ isUserEmailTaken: vi.fn() }));

const asked = vi.mocked(isUserEmailTaken);

let check: UserEmailCheck;

beforeEach(() => {
  vi.useFakeTimers();
  asked.mockReset();
  asked.mockReturnValue(okAsync(false));
  check = createUserEmailCheck();
});

afterEach(() => {
  check.forget();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('ask', () => {
  it('files the answer under the provider and the address, case-blind', async () => {
    asked.mockReturnValue(okAsync(true));

    check.ask('system', ' Alice@Example.com ', { immediate: true });
    await vi.runAllTimersAsync();

    expect(asked.mock.calls[0]?.slice(0, 3)).toEqual(['system', 'Alice@Example.com', undefined]);
    expect(check.$state.get()).toEqual({ status: 'taken', key: 'email:system|alice@example.com' });
  });

  it('answers a spelling it has already asked about in another case without asking again', async () => {
    check.ask('system', 'alice@example.com', { immediate: true });
    await vi.runAllTimersAsync();

    check.ask('system', 'ALICE@example.com', { immediate: true });

    expect(asked).toHaveBeenCalledTimes(1);
    expect(check.$state.get().status).toBe('available');
  });

  it('hands the user being edited over, so its own address is no clash', async () => {
    check.ask('system', 'alice@example.com', { immediate: true, except: 'user:system:alice' });
    await vi.runAllTimersAsync();

    expect(asked.mock.calls[0]?.[2]).toBe('user:system:alice');
  });

  it('leaves what is not yet an address, or has no provider, alone', () => {
    check.ask('system', 'alice@');
    expect(check.$state.get()).toEqual({ status: 'idle' });

    check.ask('', 'alice@example.com');
    expect(check.$state.get()).toEqual({ status: 'idle' });

    expect(asked).not.toHaveBeenCalled();
  });
});
