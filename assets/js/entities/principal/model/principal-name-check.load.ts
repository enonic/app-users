import type { ReadableAtom } from 'nanostores';
import type { ResultAsync } from 'neverthrow';

import type { AppError } from '../../../shared/api';
import { isGroupNameTaken } from './group-commands';
import { isIllegalPrincipalName } from './principal-name';
import {
  createPrincipalNameCheckStore,
  type PrincipalNameCheckState,
} from './principal-name-check.store';
import type { PrincipalType } from './principal.types';
import { isUserNameTaken } from './user-commands';

/** The principals a wizard names inside a provider. A role has no provider to be unique in. */
export type NameCheckedType = Exclude<PrincipalType, 'role'>;

export type PrincipalNameCheckOptions = {
  /** Skip the debounce: the field was left, or the provider changed under a name already typed. */
  immediate?: boolean;
};

export type PrincipalNameCheck = {
  $state: ReadableAtom<PrincipalNameCheckState>;
  ask: (idProvider: string, name: string, options?: PrincipalNameCheckOptions) => void;
  forget: () => void;
  receive: (key: string, taken: boolean) => void;
  fail: (key: string) => void;
};

const DEBOUNCE_MS = 400;

// The question each kind asks.
const ASK: Record<
  NameCheckedType,
  (idProvider: string, name: string, signal?: AbortSignal) => ResultAsync<boolean, AppError>
> = {
  user: isUserNameTaken,
  group: isGroupNameTaken,
};

export function createPrincipalNameCheck(type: NameCheckedType): PrincipalNameCheck {
  const { $state, begin, receive, fail, idle } = createPrincipalNameCheckStore();

  // One dialog's worth of answers. A name typed, deleted and typed again is the common path, and every one
  // of those keystrokes would otherwise be a request.
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

  async function request(idProvider: string, name: string, key: string): Promise<void> {
    const controller = new AbortController();
    pending = controller;
    const { signal } = controller;

    await ASK[type](idProvider, name, signal).match(
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

    /** Asks whether the provider already holds this name, debounced, one request at a time. */
    ask(idProvider, name, { immediate = false } = {}) {
      cancel();

      const trimmed = name.trim();

      if (idProvider.length === 0 || trimmed.length === 0 || isIllegalPrincipalName(trimmed)) {
        idle();
        return;
      }

      const key = `${type}:${idProvider}:${trimmed}`;
      const remembered = answered.get(key);

      if (remembered !== undefined) {
        receive(key, remembered);
        return;
      }

      begin(key);

      if (immediate) {
        void request(idProvider, trimmed, key);
        return;
      }

      scheduled = setTimeout(() => {
        scheduled = undefined;
        void request(idProvider, trimmed, key);
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
