import { map } from 'nanostores';
import type { Result } from 'neverthrow';

import type { AppError } from '../../../shared/api';
import type {
  IdProviderPrincipals,
  PrincipalPage,
  PrincipalRef,
  PrincipalSetType,
} from './principal.types';

export type PrincipalSetState = {
  items: readonly PrincipalRef[];
  /** How many the provider holds, not how many are loaded — the difference is what `Load more` is for. */
  total: number;
  /** A page is on its way while the rows already loaded stay on screen. */
  appending: boolean;
  /** ! Every page there is, whatever `total` says: a page that adds no row is the end of the list. */
  exhausted: boolean;
  error?: string;
};

export type IdProviderPrincipalsState = {
  /** The provider the rows belong to: a panel that has moved on shows nothing rather than the wrong set. */
  key?: string;
  status: 'idle' | 'loading' | 'ready' | 'error';
  users: PrincipalSetState;
  groups: PrincipalSetState;
  error?: string;
};

const EMPTY_SET: PrincipalSetState = { items: [], total: 0, appending: false, exhausted: false };

const EMPTY: IdProviderPrincipalsState = {
  status: 'idle',
  users: EMPTY_SET,
  groups: EMPTY_SET,
};

/** Its own store rather than a `createDetailLoader`: a first page replaces and a later one appends. */
export const $idProviderPrincipals = map<IdProviderPrincipalsState>(EMPTY);

export function beginIdProviderPrincipalsLoad(key: string): void {
  $idProviderPrincipals.set({ ...EMPTY, key, status: 'loading' });
}

export function receiveIdProviderPrincipals(
  key: string,
  result: Result<IdProviderPrincipals | undefined, AppError>,
): void {
  result.match(
    (principals) =>
      $idProviderPrincipals.set(
        principals === undefined
          ? { ...EMPTY, key, status: 'ready' }
          : {
              key,
              status: 'ready',
              users: firstPage(principals.users),
              groups: firstPage(principals.groups),
            },
      ),
    (error) => $idProviderPrincipals.set({ ...EMPTY, key, status: 'error', error: error.message }),
  );
}

export function beginIdProviderPrincipalsAppend(type: PrincipalSetType): void {
  patch(type, (set) => ({ ...set, appending: true, error: undefined }));
}

export function appendIdProviderPrincipals(
  key: string,
  type: PrincipalSetType,
  result: Result<PrincipalPage | undefined, AppError>,
): void {
  // ! A page that answers after the panel has moved on holds another provider's principals: appending it
  // ! would file them under the provider now on screen.
  if ($idProviderPrincipals.get().key !== key) {
    return;
  }

  result.match(
    (page) =>
      patch(type, (set) => {
        const added = page === undefined ? [] : withoutLoaded(page.items, set.items);

        return {
          items: [...set.items, ...added],
          total: page?.total ?? set.total,
          appending: false,
          exhausted: added.length === 0,
        };
      }),
    (error) => patch(type, (set) => ({ ...set, appending: false, error: error.message })),
  );
}

export function forgetIdProviderPrincipals(): void {
  $idProviderPrincipals.set(EMPTY);
}

/**
 * ! Where the next page starts, and the one answer to whether there is one — `Load more` and the request
 * ! behind it must not disagree.
 */
export function idProviderPrincipalsAppendStart(type: PrincipalSetType): number | undefined {
  const state = $idProviderPrincipals.get();
  const set = state[setKey(type)];

  return state.status !== 'ready' || set.appending || !hasMore(set) ? undefined : set.items.length;
}

export function idProviderPrincipalsHasMore(set: PrincipalSetState): boolean {
  return hasMore(set);
}

//
// * Helpers
//

function firstPage({ total, items }: PrincipalPage): PrincipalSetState {
  return { items, total, appending: false, exhausted: items.length === 0 };
}

function hasMore({ items, total, exhausted }: PrincipalSetState): boolean {
  return !exhausted && items.length < total;
}

function setKey(type: PrincipalSetType): 'users' | 'groups' {
  return type === 'user' ? 'users' : 'groups';
}

// ! Offset paging over a set someone else is editing can answer with a row already loaded, and two rows
// ! under one key render twice.
function withoutLoaded(
  page: readonly PrincipalRef[],
  loaded: readonly PrincipalRef[],
): PrincipalRef[] {
  const keys = new Set(loaded.map(({ key }) => key));
  return page.filter(({ key }) => !keys.has(key));
}

function patch(type: PrincipalSetType, edit: (set: PrincipalSetState) => PrincipalSetState): void {
  const key = setKey(type);
  $idProviderPrincipals.setKey(key, edit($idProviderPrincipals.get()[key]));
}
