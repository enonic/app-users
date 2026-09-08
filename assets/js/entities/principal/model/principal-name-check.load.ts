import type { ResultAsync } from 'neverthrow';

import type { AppError } from '../../../shared/api';
import { isGroupNameTaken } from './group-commands';
import { isIllegalPrincipalName } from './principal-name';
import {
  beginPrincipalNameCheck,
  failPrincipalNameCheck,
  idlePrincipalNameCheck,
  receivePrincipalNameCheck,
} from './principal-name-check.store';
import type { PrincipalType } from './principal.types';
import { isUserNameTaken } from './user-commands';

/** The principals a wizard names inside a provider. A role has no provider to be unique in. */
export type NameCheckedType = Exclude<PrincipalType, 'role'>;

export type PrincipalNameCheckOptions = {
  /** Skip the debounce: the field was left, or the provider changed under a name already typed. */
  immediate?: boolean;
};

const DEBOUNCE_MS = 400;

// The question each kind asks. One store serves every wizard: two are never open at once, and each
// forgets on open and close.
const ASK: Record<
  NameCheckedType,
  (idProvider: string, name: string, signal?: AbortSignal) => ResultAsync<boolean, AppError>
> = {
  user: isUserNameTaken,
  group: isGroupNameTaken,
};

// One dialog's worth of answers. A name typed, deleted and typed again is the common path, and every one
// of those keystrokes would otherwise be a request.
const answered = new Map<string, boolean>();

let scheduled: ReturnType<typeof setTimeout> | undefined;
let pending: AbortController | undefined;

/** Asks whether the provider already holds this name, debounced, one request at a time. */
export function checkPrincipalName(
  type: NameCheckedType,
  idProvider: string,
  name: string,
  { immediate = false }: PrincipalNameCheckOptions = {},
): void {
  cancel();

  const trimmed = name.trim();

  if (idProvider.length === 0 || trimmed.length === 0 || isIllegalPrincipalName(trimmed)) {
    idlePrincipalNameCheck();
    return;
  }

  const key = `${type}:${idProvider}:${trimmed}`;
  const remembered = answered.get(key);

  if (remembered !== undefined) {
    receivePrincipalNameCheck(key, remembered);
    return;
  }

  beginPrincipalNameCheck(key);

  if (immediate) {
    void request(type, idProvider, trimmed, key);
    return;
  }

  scheduled = setTimeout(() => {
    scheduled = undefined;
    void request(type, idProvider, trimmed, key);
  }, DEBOUNCE_MS);
}

/** The dialog opened or closed: nothing asked, nothing remembered. */
export function forgetPrincipalNameChecks(): void {
  cancel();
  answered.clear();
  idlePrincipalNameCheck();
}

//
// * Internal
//

function cancel(): void {
  if (scheduled !== undefined) {
    clearTimeout(scheduled);
    scheduled = undefined;
  }

  pending?.abort();
  pending = undefined;
}

async function request(
  type: NameCheckedType,
  idProvider: string,
  name: string,
  key: string,
): Promise<void> {
  const controller = new AbortController();
  pending = controller;
  const { signal } = controller;

  await ASK[type](idProvider, name, signal).match(
    (taken) => {
      if (signal.aborted) {
        return;
      }
      answered.set(key, taken);
      receivePrincipalNameCheck(key, taken);
    },
    () => {
      if (!signal.aborted) {
        failPrincipalNameCheck(key);
      }
    },
  );
}
