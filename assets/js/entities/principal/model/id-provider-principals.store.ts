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
  /** How many the provider holds, not how many were read — the difference is what the `+N` stands for. */
  total: number;
  /** A page is on its way while the rows already read stay on screen. */
  appending: boolean;
  /** Why the last page did not arrive; the rows already read still stand. */
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

const EMPTY_SET: PrincipalSetState = { items: [], total: 0, appending: false };

const EMPTY: IdProviderPrincipalsState = {
  status: 'idle',
  users: EMPTY_SET,
  groups: EMPTY_SET,
};

/** Its own store rather than a `createDetailLoader`: one key, two sets, each with a total of its own. */
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
              users: toSet(principals.users),
              groups: toSet(principals.groups),
            },
      ),
    (error) => $idProviderPrincipals.set({ ...EMPTY, key, status: 'error', error: error.message }),
  );
}

export function forgetIdProviderPrincipals(): void {
  $idProviderPrincipals.set(EMPTY);
}

export function beginIdProviderPrincipalsAppend(type: PrincipalSetType): void {
  patch(type, (set) => ({ ...set, appending: true, error: undefined }));
}

export function appendIdProviderPrincipals(
  type: PrincipalSetType,
  result: Result<PrincipalPage | undefined, AppError>,
): void {
  result.match(
    (page) =>
      patch(type, (set) => {
        const added = page === undefined ? [] : withoutLoaded(page.items, set.items);
        const items = [...set.items, ...added];

        // ? A page that adds nothing means the set shrank under the paging: what is read is all there is.
        return {
          items,
          total: added.length === 0 ? items.length : (page?.total ?? set.total),
          appending: false,
        };
      }),
    (error) => patch(type, (set) => ({ ...set, appending: false, error: error.message })),
  );
}

/** Where the next page of a set starts, or `undefined` when there is no page to ask for. */
export function idProviderPrincipalsNextStart(type: PrincipalSetType): number | undefined {
  const state = $idProviderPrincipals.get();
  const set = state[setKey(type)];

  return state.status !== 'ready' || set.appending || set.items.length >= set.total
    ? undefined
    : set.items.length;
}

//
// * Internal
//

function toSet({ total, items }: PrincipalPage): PrincipalSetState {
  return { items, total, appending: false };
}

function setKey(type: PrincipalSetType): 'users' | 'groups' {
  return type === 'user' ? 'users' : 'groups';
}

// ! Offset paging over a set someone else is editing can answer with a row already read.
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
