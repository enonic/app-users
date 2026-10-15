import { fetchUser } from '../api/users.api';
import { createRowLoader } from './row.load';
import { $users, removeUser, replaceUser } from './users.store';

const reload = createRowLoader({
  fetch: fetchUser,
  receive: replaceUser,
  missing: removeUser,
});

/** Re-reads a row already loaded; Users is paged, so a key the list does not hold costs nothing. */
export function loadUser(key: string): Promise<void> {
  return $users.get().items.some((user) => user.key === key) ? reload(key) : Promise.resolve();
}
