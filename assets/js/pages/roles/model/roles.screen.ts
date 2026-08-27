import { err, ok, type Result } from 'neverthrow';

import {
  beginIdProviderNamesLoad,
  beginRolesLoad,
  forgetRoleDetails,
  receiveIdProviderNames,
  receiveRoles,
  toIdProviderNames,
  toRoles,
} from '../../../entities/principal';
import { AppError } from '../../../shared/api';
import { fetchRolesScreen, type RolesScreenData } from '../api/roles-screen.api';

/**
 * Loads the Roles screen and fans the one answer out into the three stores that own its parts.
 *
 * ! Refresh can retrigger this, so the previous load is cancelled and its answer dropped: without it the
 * ! slower of two requests decides what the list shows. Cancelling once here is why the stores hold no
 * ! request of their own.
 */
let pending: AbortController | undefined;

export function loadRolesScreen(): Promise<void> {
  pending?.abort();
  const controller = new AbortController();
  pending = controller;
  const { signal } = controller;

  beginRolesLoad();
  beginIdProviderNamesLoad();

  return fetchRolesScreen(signal).match(
    (answer) => {
      if (!signal.aborted) {
        dispatch(answer.data, answer.message);
      }
    },
    (error) => {
      if (!signal.aborted) {
        const failed = err(error);
        receiveRoles(failed);
        receiveIdProviderNames(failed);
      }
    },
  );
}

//
// * Helpers
//

/**
 * Each domain gets its own verdict, because each root field fails on its own — every one of them is
 * nullable for exactly that reason, and `schema/query.ts` explains it.
 *
 * The message is shared: lib-graphql sends no `path`, so which error belongs to which field is not
 * knowable from the response. It reaches only the domains that actually came back null.
 */
function dispatch(data: RolesScreenData, message: string | undefined): void {
  receiveRoles(present(data.roles, message).map(toRoles));
  receiveIdProviderNames(present(data.idProviders, message).map(toIdProviderNames));

  // The panel's members are a request of their own, so `Refresh` has to reach them too: without this the
  // open role would keep the member list it was cached with beside a row that has just been re-read.
  forgetRoleDetails();
}

function present<T>(value: T[] | null, message: string | undefined): Result<T[], AppError> {
  return value == null ? err(new AppError(message ?? 'The field could not be read')) : ok(value);
}
