import { computed, map, type MapStore, type ReadableAtom } from 'nanostores';
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
   * The two differ for the paged sections: `items` is what has been paged in so far, and the difference
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

export type UsersList = {
  $state: MapStore<UsersState>;
  /** Whether there is another page to ask for — the one answer to that question. */
  $hasMore: ReadableAtom<boolean>;
  beginLoad: () => void;
  beginAppend: () => void;
  receive: (result: Result<UsersPage, AppError>) => void;
  append: (result: Result<UsersPage, AppError>) => void;
  replace: (user: User) => void;
  remove: (key: string) => void;
  appendStart: () => number | undefined;
  loadedExtent: (pageSize: number) => number;
  loadedKeys: () => string[];
};

const EMPTY: UsersState = {
  status: 'loading',
  items: [],
  total: 0,
  appending: false,
  exhausted: false,
};

/**
 * A paged list of users, held for one section: no request, no cancelling, and no notion of a query.
 *
 * A factory rather than a store, because two sections list users — Users, and Service Accounts over the
 * system store — and the host keeps both mounted at once: one shared list would hand each section the
 * other's page. What to ask for belongs to each section's screen (`pages/<section>/model/*.screen.ts`),
 * which owns the query, the paging and the cancelling, and hands outcomes here. Two ways in, because a
 * first page replaces and a later page appends.
 */
export function createUsersList(): UsersList {
  const $state = map<UsersState>(EMPTY);

  /**
   * ! `beginLoad` keeps the rows on screen. Clearing them would replace the list with a skeleton on every
   * ! debounced keystroke — the search runs on the server here — losing the scroll position and any focus
   * ! inside the list several times a second. The rows are replaced when the answer lands, which is the
   * ! only moment the new query is actually known.
   */
  function beginLoad(): void {
    $state.set({ ...$state.get(), status: 'loading', exhausted: false, error: undefined });
  }

  function beginAppend(): void {
    $state.set({ ...$state.get(), appending: true, error: undefined });
  }

  /**
   * ! `$hasMore` used to be decided twice: `Load more` decided its own visibility from `items.length <
   * ! total` while the store decided whether to send anything, and the two disagreed the moment a page
   * ! came back adding nothing: the control stayed on screen and every click did nothing at all, silently.
   */
  const $hasMore = computed($state, hasMore);

  /**
   * Where the next page starts, or `undefined` when there is no next page to ask for.
   *
   * The screen owns the paging but not the rows, so it asks the store where it has got to rather than
   * reading `items` through the barrel — which would make the slice's internals part of its public
   * surface. Undefined while a first page is still loading and while one is already on its way, which is
   * what makes two clicks on `Load more` one page.
   */
  function appendStart(): number | undefined {
    const state = $state.get();
    return state.status !== 'ready' || state.appending || !hasMore(state)
      ? undefined
      : state.items.length;
  }

  /** What a re-read has to cover: the rows loaded, plus the page on its way so cancelling it loses no click. */
  function loadedExtent(pageSize: number): number {
    const { items, appending } = $state.get();
    return items.length + (appending ? pageSize : 0);
  }

  function loadedKeys(): string[] {
    return $state.get().items.map(({ key }) => key);
  }

  function replace(user: User): void {
    const current = $state.get();

    if (!current.items.some(({ key }) => key === user.key)) {
      return;
    }

    $state.setKey(
      'items',
      current.items.map((loaded) => (loaded.key === user.key ? user : loaded)),
    );
  }

  function remove(key: string): void {
    const current = $state.get();

    if (!current.items.some((user) => user.key === key)) {
      return;
    }

    $state.set({
      ...current,
      items: current.items.filter((user) => user.key !== key),
      total: Math.max(0, current.total - 1),
    });
  }

  function receive(result: Result<UsersPage, AppError>): void {
    result.match(
      ({ items, total }) =>
        $state.set({ status: 'ready', items, total, appending: false, exhausted: false }),
      (error) => $state.set({ ...EMPTY, status: 'error', error: error.message }),
    );
  }

  /**
   * ! Appends, and keeps what is on screen when the page fails: a failed `Load more` must not take the
   * ! rows the user is already reading with it. `total` is taken from the new answer, since a user created
   * ! or deleted meanwhile changes it.
   */
  function append(result: Result<UsersPage, AppError>): void {
    const current = $state.get();

    result.match(
      ({ items, total }) => {
        const fresh = withoutLoaded(items, current.items);

        $state.set({
          status: 'ready',
          items: [...current.items, ...fresh],
          total,
          appending: false,
          exhausted: fresh.length === 0,
        });
      },
      (error) => $state.set({ ...current, appending: false, error: error.message }),
    );
  }

  return {
    $state,
    $hasMore,
    beginLoad,
    beginAppend,
    receive,
    append,
    replace,
    remove,
    appendStart,
    loadedExtent,
    loadedKeys,
  };
}

//
// * Helpers
//

/**
 * ! Offset paging over a set someone else may be editing can return a row already loaded — a user created
 * ! above the offset shifts everything down by one. A duplicate key would render twice and the two rows
 * ! would tick as one, so the page keeps only what is new.
 */
function withoutLoaded(page: readonly User[], loaded: readonly User[]): User[] {
  const keys = new Set(loaded.map(({ key }) => key));
  return page.filter(({ key }) => !keys.has(key));
}

function hasMore({ items, total, exhausted }: UsersState): boolean {
  return !exhausted && items.length < total;
}
