import { err, ok } from 'neverthrow';

import { fetchIdProviderPrincipalPage, fetchIdProviderPrincipals } from '../api/id-providers.api';
import {
  $idProviderPrincipals,
  appendIdProviderPrincipals,
  beginIdProviderPrincipalsAppend,
  beginIdProviderPrincipalsLoad,
  forgetIdProviderPrincipals,
  idProviderPrincipalsAppendStart,
  receiveIdProviderPrincipals,
} from './id-provider-principals.store';
import type { PrincipalSetType } from './principal.types';

// ! Arrow-key navigation moves the route, so without this a held key queues two searches per row.
const DEBOUNCE_MS = 250;

let pending: AbortController | undefined;
let scheduled: ReturnType<typeof setTimeout> | undefined;

// ! One per set: both sets carry a `Load more`, so two pages can be on their way at once.
const pendingPages = new Map<PrincipalSetType, AbortController>();

/** The selection moved. `undefined` means nothing is selected. */
export function showIdProviderPrincipals(key: string | undefined): void {
  // ! Before the cancelling, not after: this runs again for the key it already holds whenever the panel
  // ! remounts, and cancelling that read to then return would leave the panel loading forever.
  if (key !== undefined && $idProviderPrincipals.get().key === key) {
    return;
  }

  cancel();

  if (key === undefined) {
    forgetIdProviderPrincipals();
    return;
  }

  read(key);
}

/**
 * `Refresh`: the loaded rows describe a list that has just been re-read, so they are read again for the
 * provider they belong to. Dropping them instead would leave the panel empty until the selection moves —
 * the panel asks for a key, and the key has not changed.
 */
export function reloadIdProviderPrincipalRows(): void {
  const { key } = $idProviderPrincipals.get();

  cancel();

  if (key === undefined) {
    return;
  }

  read(key);
}

/** The next page of one set, or nothing at all when there is no page to ask for. */
export function loadMoreIdProviderPrincipals(type: PrincipalSetType): void {
  const { key } = $idProviderPrincipals.get();
  const start = idProviderPrincipalsAppendStart(type);

  if (key === undefined || start === undefined) {
    return;
  }

  beginIdProviderPrincipalsAppend(type);

  const controller = new AbortController();
  pendingPages.set(type, controller);

  void fetchIdProviderPrincipalPage(key, type, start, controller.signal).match(
    (page) => settlePage(type, controller, () => appendIdProviderPrincipals(key, type, ok(page))),
    (error) =>
      settlePage(type, controller, () => appendIdProviderPrincipals(key, type, err(error))),
  );
}

/** Leaving the section: what is loaded describes a provider nobody is looking at any more. */
export function forgetIdProviderPrincipalRows(): void {
  cancel();
  forgetIdProviderPrincipals();
}

function read(key: string): void {
  beginIdProviderPrincipalsLoad(key);

  scheduled = setTimeout(() => {
    scheduled = undefined;

    const controller = new AbortController();
    pending = controller;

    void fetchIdProviderPrincipals(key, controller.signal).match(
      (principals) => {
        if (!controller.signal.aborted) {
          receiveIdProviderPrincipals(key, ok(principals));
        }
      },
      (error) => {
        if (!controller.signal.aborted) {
          receiveIdProviderPrincipals(key, err(error));
        }
      },
    );
  }, DEBOUNCE_MS);
}

function settlePage(type: PrincipalSetType, controller: AbortController, report: () => void): void {
  if (pendingPages.get(type) === controller) {
    pendingPages.delete(type);
  }

  if (!controller.signal.aborted) {
    report();
  }
}

function cancel(): void {
  pending?.abort();
  pending = undefined;

  for (const controller of pendingPages.values()) {
    controller.abort();
  }
  pendingPages.clear();

  if (scheduled !== undefined) {
    clearTimeout(scheduled);
    scheduled = undefined;
  }
}
