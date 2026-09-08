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
import { isRoleNameTaken } from './role-commands';
import { isUserNameTaken } from './user-commands';

/** The principals a wizard names: a user or a group inside a provider, a role on its own. */
export type NameCheckedType = PrincipalType;

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
  role: (_idProvider, name, signal) => isRoleNameTaken(name, signal),
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

    /**
     * Asks whether the name is already held — by the provider for a user or a group, by the platform for a
     * role, which has no provider and passes `''`. Debounced, one request at a time.
     */
    ask(idProvider, name, { immediate = false } = {}) {
      cancel();

      const trimmed = name.trim();
      const key =
        trimmed.length === 0 || isIllegalPrincipalName(trimmed)
          ? undefined
          : keyOf(type, idProvider, trimmed);

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

//
// * Internal
//

// The answer is filed under the key the principal would have, so one name in two providers is two
// questions. A user or a group has no key until its provider is chosen.
function keyOf(type: NameCheckedType, idProvider: string, name: string): string | undefined {
  if (type === 'role') {
    return `role:${name}`;
  }

  return idProvider.length === 0 ? undefined : `${type}:${idProvider}:${name}`;
}
