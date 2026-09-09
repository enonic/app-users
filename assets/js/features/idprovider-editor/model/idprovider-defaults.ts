import { atom } from 'nanostores';

import {
  fetchDefaultIdProviderPermissions,
  type IdProviderPermission,
} from '../../../entities/principal';

/**
 * The entries every provider is seeded with. A new provider starts from them, and in both modes they are
 * pinned wherever they appear — see `pinnedPermissions`. A provider nobody may reach is the one shape an
 * administrator never wants.
 */
export const $idProviderDefaultPermissions = atom<readonly IdProviderPermission[]>([]);

// A failed read pins nothing and seeds nothing, and says so nowhere: the list still refuses to be empty,
// so the user grants somebody access by hand.
export function loadIdProviderDefaultPermissions(signal?: AbortSignal): void {
  void fetchDefaultIdProviderPermissions(signal).match(
    (permissions) => {
      if (signal?.aborted !== true) {
        $idProviderDefaultPermissions.set(permissions);
      }
    },
    () => undefined,
  );
}
