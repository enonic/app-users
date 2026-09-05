import { isIllegalPrincipalName, isUserNameTaken } from '../../../entities/principal';
import {
  beginUserNameCheck,
  failUserNameCheck,
  idleUserNameCheck,
  receiveUserNameCheck,
} from './user-name-check.store';

export type UserNameCheckOptions = {
  /** Skip the debounce: the field was left, or the provider changed under a name already typed. */
  immediate?: boolean;
};

const DEBOUNCE_MS = 400;

// One dialog's worth of answers. A name typed, deleted and typed again is the common path, and every one
// of those keystrokes would otherwise be a request.
const answered = new Map<string, boolean>();

let scheduled: ReturnType<typeof setTimeout> | undefined;
let pending: AbortController | undefined;

/** Asks whether the provider already holds this name, debounced, one request at a time. */
export function checkUserName(
  idProvider: string,
  name: string,
  { immediate = false }: UserNameCheckOptions = {},
): void {
  cancel();

  const trimmed = name.trim();

  if (idProvider.length === 0 || trimmed.length === 0 || isIllegalPrincipalName(trimmed)) {
    idleUserNameCheck();
    return;
  }

  const key = `user:${idProvider}:${trimmed}`;
  const remembered = answered.get(key);

  if (remembered !== undefined) {
    receiveUserNameCheck(key, remembered);
    return;
  }

  beginUserNameCheck(key);

  if (immediate) {
    void request(idProvider, trimmed, key);
    return;
  }

  scheduled = setTimeout(() => {
    scheduled = undefined;
    void request(idProvider, trimmed, key);
  }, DEBOUNCE_MS);
}

/** The dialog opened or closed: nothing asked, nothing remembered. */
export function forgetUserNameChecks(): void {
  cancel();
  answered.clear();
  idleUserNameCheck();
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

async function request(idProvider: string, name: string, key: string): Promise<void> {
  const controller = new AbortController();
  pending = controller;
  const { signal } = controller;

  await isUserNameTaken(idProvider, name, signal).match(
    (taken) => {
      if (signal.aborted) {
        return;
      }
      answered.set(key, taken);
      receiveUserNameCheck(key, taken);
    },
    () => {
      if (!signal.aborted) {
        failUserNameCheck(key);
      }
    },
  );
}
