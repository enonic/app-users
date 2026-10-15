import { fetchUser } from '../api/users.api';
import { createRowLoader } from './row.load';
import {
  $serviceAccounts,
  removeServiceAccount,
  replaceServiceAccount,
} from './service-accounts.store';

const reload = createRowLoader({
  fetch: fetchUser,
  receive: replaceServiceAccount,
  missing: removeServiceAccount,
});

/** Re-reads a row already loaded; the list is paged, so a key it does not hold costs nothing. */
export function loadServiceAccount(key: string): Promise<void> {
  return $serviceAccounts.get().items.some((user) => user.key === key)
    ? reload(key)
    : Promise.resolve();
}
