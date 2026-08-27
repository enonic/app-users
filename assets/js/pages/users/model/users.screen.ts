import { err, ok, type Result } from 'neverthrow';

import {
  appendUsers,
  beginIdProviderNamesLoad,
  beginIdProviderUserCountsLoad,
  beginUsersAppend,
  beginUsersLoad,
  forgetUserDetails,
  receiveIdProviderNames,
  receiveIdProviderUserCounts,
  receiveUsers,
  toIdProviderNames,
  toIdProviderUserCounts,
  toUsersPage,
  usersAppendStart,
  type UsersPage,
} from '../../../entities/principal';
import { AppError } from '../../../shared/api';
import { fetchUsersScreen, type UsersScreenData } from '../api/users-screen.api';
import { $usersQuery, PAGE_SIZE } from './query.store';

/**
 * Loads the Users screen: one page of users plus the id providers, in one request.
 *
 * ! The only section whose search, filter, order and paging live on the server, so every change to any of
 * ! them is a new first page — `reload` — while `Load more` is the same query at a later offset. Both go
 * ! through here, and the previous request is cancelled: without that the slower of two answers decides
 * ! what the list shows, and with paging it could also append a page belonging to an older query.
 */
let pending: AbortController | undefined;

export function reloadUsersScreen(): Promise<void> {
  const { signal } = start();

  beginUsersLoad();
  beginIdProviderNamesLoad();
  beginIdProviderUserCountsLoad();

  return fetchUsersScreen({ ...$usersQuery.get(), start: 0, count: PAGE_SIZE }, signal).match(
    (answer) => {
      if (!signal.aborted) {
        receiveUsers(page(answer.data, answer.message));

        receiveIdProviderNames(providers(answer.data, answer.message));
        receiveIdProviderUserCounts(providerCounts(answer.data, answer.message));

        // ! After the rows, not before. The cached details are built from rows, so invalidating at request
        // ! time would re-read the open user against the page that is about to be replaced — and the
        // ! re-read fires 250 ms later, which on this section is well inside one request.
        forgetUserDetails();
      }
    },
    (error) => {
      if (!signal.aborted) {
        receiveUsers(err(error));
        receiveIdProviderNames(err(error));
        receiveIdProviderUserCounts(err(error));
      }
    },
  );
}

/** The next page of the same query. Ignored while one is already on its way, so a double click is one page. */
export function loadMoreUsers(): Promise<void> {
  // Undefined while a first page is still loading or one is already on its way: two clicks are one page.
  const start_ = usersAppendStart();
  if (start_ === undefined) {
    return Promise.resolve();
  }

  const { signal } = start();
  beginUsersAppend();

  return fetchUsersScreen({ ...$usersQuery.get(), start: start_, count: PAGE_SIZE }, signal).match(
    (answer) => {
      if (!signal.aborted) {
        appendUsers(page(answer.data, answer.message));
        // The providers came along for free; taking them keeps the labels fresh at no cost, and a failed
        // half no longer costs the loaded list — `receiveIdProviderNames` keeps what it has.
        receiveIdProviderNames(providers(answer.data, answer.message));
        receiveIdProviderUserCounts(providerCounts(answer.data, answer.message));
      }
    },
    (error) => {
      if (!signal.aborted) {
        appendUsers(err(error));
      }
    },
  );
}

//
// * Helpers
//

function start(): AbortController {
  pending?.abort();
  const controller = new AbortController();
  pending = controller;
  return controller;
}

// Each root field fails on its own, so each half gets its own verdict — a provider list that could not be
// read leaves the user page on screen, and the other way round.
function page(data: UsersScreenData, message: string | undefined): Result<UsersPage, AppError> {
  return data.users == null
    ? err(new AppError(message ?? 'The user list could not be read'))
    : ok(toUsersPage(data.users));
}

function providers(data: UsersScreenData, message: string | undefined) {
  return data.idProviders == null
    ? err(new AppError(message ?? 'The id providers could not be read'))
    : ok(toIdProviderNames(data.idProviders));
}

function providerCounts(data: UsersScreenData, message: string | undefined) {
  return data.idProviders == null
    ? err(new AppError(message ?? 'The id providers could not be read'))
    : ok(toIdProviderUserCounts(data.idProviders));
}
