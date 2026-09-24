import type { ReadableAtom } from 'nanostores';
import type { ResultAsync } from 'neverthrow';

import type { AppError } from '../../../shared/api';
import {
  createPrincipalNameCheckStore,
  type PrincipalNameCheckState,
} from './principal-name-check.store';

export type AvailabilityCheckOptions = {
  /** Skip the debounce: the field was left, or the scope changed under a value already typed. */
  immediate?: boolean;
  /** The key of the thing being edited, which holding the value is no clash. */
  except?: string;
};

export type AvailabilityCheck = {
  $state: ReadableAtom<PrincipalNameCheckState>;
  ask: (scope: string, value: string, options?: AvailabilityCheckOptions) => void;
  forget: () => void;
  receive: (key: string, taken: boolean) => void;
  fail: (key: string) => void;
};

/** The question a wizard asks of a value as it is typed, and the key its answer is filed under. */
export type AvailabilityQuestion = {
  ask: (
    scope: string,
    value: string,
    except: string | undefined,
    signal: AbortSignal,
  ) => ResultAsync<boolean, AppError>;
  /** Undefined for a value not worth asking about: the form itself rejects it, or the scope is unset. */
  keyOf: (scope: string, value: string) => string | undefined;
};

const DEBOUNCE_MS = 400;

/**
 * Whether a value is already held — debounced, one request at a time, one dialog's worth of answers
 * remembered. `createPrincipalNameCheck` and `createUserEmailCheck` are the questions asked over it.
 */
export function createAvailabilityCheck({ ask, keyOf }: AvailabilityQuestion): AvailabilityCheck {
  const { $state, begin, receive, fail, idle } = createPrincipalNameCheckStore();

  // A value typed, deleted and typed again is the common path, and every one of those keystrokes would
  // otherwise be a request.
  const answered = new Map<string, boolean>();

  let scheduled: ReturnType<typeof setTimeout> | undefined;
  let pending: AbortController | undefined;

  function cancel(): void {
    if (scheduled !== undefined) {
      clearTimeout(scheduled);
      scheduled = undefined;
    }

    pending?.abort();
    pending = undefined;
  }

  async function request(
    scope: string,
    value: string,
    key: string,
    except: string | undefined,
  ): Promise<void> {
    const controller = new AbortController();
    pending = controller;
    const { signal } = controller;

    await ask(scope, value, except, signal).match(
      (taken) => {
        if (signal.aborted) {
          return;
        }
        answered.set(key, taken);
        receive(key, taken);
      },
      () => {
        if (!signal.aborted) {
          fail(key);
        }
      },
    );
  }

  return {
    $state,
    receive,
    fail,

    ask(scope, value, { immediate = false, except } = {}) {
      cancel();

      const trimmed = value.trim();
      const key = trimmed.length === 0 ? undefined : keyOf(scope, trimmed);

      if (key === undefined) {
        idle();
        return;
      }

      const remembered = answered.get(key);

      if (remembered !== undefined) {
        receive(key, remembered);
        return;
      }

      begin(key);

      if (immediate) {
        void request(scope, trimmed, key, except);
        return;
      }

      scheduled = setTimeout(() => {
        scheduled = undefined;
        void request(scope, trimmed, key, except);
      }, DEBOUNCE_MS);
    },

    /** The dialog opened or closed: nothing asked, nothing remembered. */
    forget() {
      cancel();
      answered.clear();
      idle();
    },
  };
}
