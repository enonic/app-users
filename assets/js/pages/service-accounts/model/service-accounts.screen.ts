import { err, ok, type Result } from 'neverthrow';

import {
  appendServiceAccounts,
  beginIdProviderNamesLoad,
  beginServiceAccountsAppend,
  beginServiceAccountsLoad,
  forgetServiceAccountDetails,
  receiveIdProviderNames,
  receiveServiceAccounts,
  serviceAccountsAppendStart,
  serviceAccountsLoadedExtent,
  serviceAccountsLoadedKeys,
  toIdProviderNames,
  toUsersPage,
  type UsersPage,
} from '../../../entities/principal';
import { AppError } from '../../../shared/api';
import {
  fetchServiceAccountsScreen,
  type ServiceAccountsScreenData,
} from '../api/service-accounts-screen.api';
import { $serviceAccountsQuery, PAGE_SIZE } from './query.store';
import { serviceAccountsSelection } from './selection.store';

/**
 * Loads the Service Accounts screen: one page of the system store's users.
 *
 * ! Search, order and paging live on the server, as on the Users screen, so every change to any of them
 * ! is a new first page — `reload` — while `Load more` is the same query at a later offset. Both go
 * ! through here, and the previous request is cancelled: without that the slower of two answers decides
 * ! what the list shows, and with paging it could also append a page belonging to an older query.
 */
let pending: AbortController | undefined;

export function reloadServiceAccountsScreen(): Promise<void> {
  return readFromStart(PAGE_SIZE);
}

/** The screen re-read in place — every loaded page in one request — where `reload` would be a first page again. */
export function refreshServiceAccountsScreen(): Promise<void> {
  const loaded = serviceAccountsLoadedExtent(PAGE_SIZE);
  const count = Math.max(PAGE_SIZE, Math.ceil(loaded / PAGE_SIZE) * PAGE_SIZE);

  return readFromStart(count).then(keepSelectionOnScreen);
}

/** The next page of the same query. Ignored while one is already on its way, so a double click is one page. */
export function loadMoreServiceAccounts(): Promise<void> {
  // Undefined while a first page is still loading or one is already on its way: two clicks are one page.
  const start_ = serviceAccountsAppendStart();
  if (start_ === undefined) {
    return Promise.resolve();
  }

  const { signal } = start();
  beginServiceAccountsAppend();

  return fetchServiceAccountsScreen(
    { ...$serviceAccountsQuery.get(), start: start_, count: PAGE_SIZE },
    signal,
  ).match(
    (answer) => {
      if (!signal.aborted) {
        appendServiceAccounts(page(answer.data, answer.message));
        // The names came along for free; taking them keeps the details panel's provenance labels
        // fresh at no cost, and a failed half costs nothing — `receiveIdProviderNames` keeps what it has.
        receiveIdProviderNames(providers(answer.data, answer.message));
      }
    },
    (error) => {
      if (!signal.aborted) {
        appendServiceAccounts(err(error));
      }
    },
  );
}

//
// * Helpers
//

function readFromStart(count: number): Promise<void> {
  const { signal } = start();

  beginServiceAccountsLoad();
  beginIdProviderNamesLoad();

  return fetchServiceAccountsScreen(
    { ...$serviceAccountsQuery.get(), start: 0, count },
    signal,
  ).match(
    (answer) => {
      if (!signal.aborted) {
        receiveServiceAccounts(page(answer.data, answer.message));

        // The details panel names the provider a group membership comes from, and this section may be
        // the first one mounted in a session — nothing else would have loaded the names yet.
        receiveIdProviderNames(providers(answer.data, answer.message));

        // ! After the rows, not before. The cached details are built from rows, so invalidating at request
        // ! time would re-read the open account against the page that is about to be replaced — and the
        // ! re-read fires 250 ms later, which on this section is well inside one request.
        forgetServiceAccountDetails();
      }
    },
    (error) => {
      if (!signal.aborted) {
        receiveServiceAccounts(err(error));
        receiveIdProviderNames(err(error));
      }
    },
  );
}

// An invisible tick on a row the re-read dropped would widen what `Delete` applies to.
function keepSelectionOnScreen(): void {
  const selected = serviceAccountsSelection.$selected.get();
  if (selected.size === 0) {
    return;
  }

  const onScreen = new Set(serviceAccountsLoadedKeys());
  const kept = [...selected].filter((key) => onScreen.has(key));

  if (kept.length !== selected.size) {
    serviceAccountsSelection.replace(kept);
  }
}

function start(): AbortController {
  pending?.abort();
  const controller = new AbortController();
  pending = controller;
  return controller;
}

// Each root field fails on its own, so each half gets its own verdict — provider names that could not
// be read leave the account page on screen, and the other way round.
function page(
  data: ServiceAccountsScreenData,
  message: string | undefined,
): Result<UsersPage, AppError> {
  return data.users == null
    ? err(new AppError(message ?? 'The service account list could not be read'))
    : ok(toUsersPage(data.users));
}

function providers(data: ServiceAccountsScreenData, message: string | undefined) {
  return data.idProviders == null
    ? err(new AppError(message ?? 'The id providers could not be read'))
    : ok(toIdProviderNames(data.idProviders));
}
