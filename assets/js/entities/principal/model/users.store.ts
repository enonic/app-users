import { computed, map, type ReadableAtom } from 'nanostores';
import type { Result } from 'neverthrow';

import type { AppError } from '../../../shared/api';
import type { UsersPage } from '../api/users.api';
import type { User } from './principal.types';

export type UsersState = {
  status: 'loading' | 'ready' | 'error';
  items: readonly User[];
  /**
   * How many users the current search matches, not how many are loaded.
   *
   * The two differ for this one section: `items` is what has been paged in so far, and the difference
   * between them is what makes `Load more` appear.
   */
  total: number;
  /** A page is on its way while the loaded rows stay on screen. */
  appending: boolean;
  /**
   * Every page there is has been loaded, whatever `total` says.
   *
   * ! `total` and the rows can disagree for two honest reasons: the server clamps the offset at the
   * ! Elasticsearch result window, and a page can come back short because `SecurityServiceImpl` re-fetches
   * ! the hits by id. Comparing `items.length` with `total` alone would then leave `Load more` on screen
   * ! forever, appending nothing on every click. A page that adds no row is the end of the list.
   */
  exhausted: boolean;
  error?: string;
};

const EMPTY: UsersState = {
  status: 'loading',
  items: [],
  total: 0,
  appending: false,
  exhausted: false,
};

/**
 * The store holds users and nothing else — no request, no cancelling, and no notion of a query.
 * Users is the only section whose narrowing lives on the server, so what to ask for belongs to the screen:
 * `pages/users/model/users.screen.ts` owns the query, the paging and the cancelling, and hands outcomes
 * here. Two ways in, because a first page replaces and a later page appends.
 */
export const $users = map<UsersState>(EMPTY);

/**
 * ! Keeps the rows on screen. Clearing them would replace the list with a skeleton on every debounced
 * ! keystroke — the search runs on the server here — losing the scroll position and any focus inside the
 * ! list several times a second. The rows are replaced when the answer lands, which is the only moment
 * ! the new query is actually known.
 */
export function beginUsersLoad(): void {
  $users.set({ ...$users.get(), status: 'loading', exhausted: false, error: undefined });
}

export function beginUsersAppend(): void {
  $users.set({ ...$users.get(), appending: true, error: undefined });
}

/**
 * ! Offset paging over a set someone else may be editing can return a row already loaded — a user created
 * ! above the offset shifts everything down by one. A duplicate key would render twice and the two rows
 * ! would tick as one, so the page keeps only what is new.
 */
function withoutLoaded(page: readonly User[], loaded: readonly User[]): User[] {
  const keys = new Set(loaded.map(({ key }) => key));
  return page.filter(({ key }) => !keys.has(key));
}

/**
 * Whether there is another page to ask for.
 * ! The one answer to that question. `Load more` used to decide its own visibility from `items.length <
 * ! total` while this decided whether to send anything, and the two disagreed the moment a page came back
 * ! adding nothing: the control stayed on screen and every click did nothing at all, silently.
 */
export const $usersHasMore: ReadableAtom<boolean> = computed($users, hasMore);

/**
 * Where the next page starts, or `undefined` when there is no next page to ask for.
 *
 * The screen owns the paging but not the rows, so it asks the store where it has got to rather than
 * reading `items` through the barrel — which would make the slice's internals part of its public surface.
 * Undefined while a first page is still loading and while one is already on its way, which is what makes
 * two clicks on `Load more` one page.
 */
export function usersAppendStart(): number | undefined {
  const state = $users.get();
  return state.status !== 'ready' || state.appending || !hasMore(state)
    ? undefined
    : state.items.length;
}

function hasMore({ items, total, exhausted }: UsersState): boolean {
  return !exhausted && items.length < total;
}

export function replaceUser(user: User): void {
  const current = $users.get();

  if (!current.items.some(({ key }) => key === user.key)) {
    return;
  }

  $users.setKey(
    'items',
    current.items.map((loaded) => (loaded.key === user.key ? user : loaded)),
  );
}

export function receiveUsers(result: Result<UsersPage, AppError>): void {
  result.match(
    ({ items, total }) =>
      $users.set({ status: 'ready', items, total, appending: false, exhausted: false }),
    (error) => $users.set({ ...EMPTY, status: 'error', error: error.message }),
  );
}

/**
 * ! Appends, and keeps what is on screen when the page fails: a failed `Load more` must not take the
 * ! rows the user is already reading with it. `total` is taken from the new answer, since a user created
 * ! or deleted meanwhile changes it.
 */
export function appendUsers(result: Result<UsersPage, AppError>): void {
  const current = $users.get();

  result.match(
    ({ items, total }) => {
      const fresh = withoutLoaded(items, current.items);

      $users.set({
        status: 'ready',
        items: [...current.items, ...fresh],
        total,
        appending: false,
        exhausted: fresh.length === 0,
      });
    },
    (error) => $users.set({ ...current, appending: false, error: error.message }),
  );
}
