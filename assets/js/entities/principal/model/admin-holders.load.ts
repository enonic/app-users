import { isAdministrator } from '../../../shared/config';
import { fetchAdminHolders } from '../api/admin-holders.api';
import { receiveAdminHolders } from './admin-holders.store';

let pending: AbortController | undefined;

/**
 * Re-read whenever principals change: a membership written anywhere can make a principal a holder or
 * stop it being one. An administrator is locked out of nothing, so asks nothing.
 */
export function reloadAdminHolders(): void {
  if (isAdministrator()) {
    return;
  }

  pending?.abort();
  const controller = new AbortController();
  pending = controller;
  const { signal } = controller;

  // A failed re-read keeps what the last one answered.
  void fetchAdminHolders(signal).map((keys) => {
    if (!signal.aborted) {
      receiveAdminHolders(keys);
    }
  });
}
