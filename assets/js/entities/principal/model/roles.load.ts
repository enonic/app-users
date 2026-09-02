import { fetchRole } from '../api/roles.api';
import { receiveRole, removeRole } from './roles.store';
import { createRowLoader } from './row.load';

export const loadRole: (key: string) => Promise<void> = createRowLoader({
  fetch: fetchRole,
  receive: receiveRole,
  missing: removeRole,
});
