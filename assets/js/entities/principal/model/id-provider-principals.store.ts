import { map } from 'nanostores';
import type { Result } from 'neverthrow';

import type { AppError } from '../../../shared/api';
import type { IdProviderPrincipals, PrincipalPage, PrincipalRef } from './principal.types';

export type PrincipalSetState = {
  items: readonly PrincipalRef[];
  /** How many the provider holds, not how many were read — the difference is what the `+N` stands for. */
  total: number;
};

export type IdProviderPrincipalsState = {
  /** The provider the rows belong to: a panel that has moved on shows nothing rather than the wrong set. */
  key?: string;
  status: 'idle' | 'loading' | 'ready' | 'error';
  users: PrincipalSetState;
  groups: PrincipalSetState;
  error?: string;
};

const EMPTY_SET: PrincipalSetState = { items: [], total: 0 };

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

//
// * Helpers
//

function toSet({ total, items }: PrincipalPage): PrincipalSetState {
  return { items, total };
}
